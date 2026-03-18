import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { useEditorStore } from '../../stores/useEditorStore'

interface Props {
  width: number
  height: number
  currentDrawing: string | null
  pageIndex: number
}

export interface DrawingLayerRef {
  getDataUrl: () => string
  clear: () => void
}

export const DrawingLayer = forwardRef<DrawingLayerRef, Props>(
  function DrawingLayer({ width, height, currentDrawing, pageIndex }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const { tool, drawColor, drawWidth, drawEraser, saveDrawing } = useEditorStore()
    const isDrawingRef = useRef(false)
    const lastPosRef = useRef({ x: 0, y: 0 })

    useImperativeHandle(ref, () => ({
      getDataUrl: () => canvasRef.current?.toDataURL() ?? '',
      clear: () => {
        const canvas = canvasRef.current
        if (canvas) canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height)
      },
    }))

    // Restore drawing when page changes
    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')!
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      if (currentDrawing) {
        const img = new Image()
        img.onload = () => ctx.drawImage(img, 0, 0)
        img.src = currentDrawing
      }
    }, [currentDrawing, width, height])

    const getPos = (e: MouseEvent | React.MouseEvent): { x: number; y: number } => {
      const canvas = canvasRef.current!
      const rect = canvas.getBoundingClientRect()
      return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height),
      }
    }

    const startDraw = (e: React.MouseEvent) => {
      if (tool !== 'draw') return
      isDrawingRef.current = true
      const pos = getPos(e)
      lastPosRef.current = pos
      const ctx = canvasRef.current!.getContext('2d')!
      ctx.lineWidth = drawEraser ? drawWidth * 4 : drawWidth
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'
      if (drawEraser) {
        ctx.globalCompositeOperation = 'destination-out'
        ctx.strokeStyle = 'rgba(0,0,0,1)'
      } else {
        ctx.globalCompositeOperation = 'source-over'
        ctx.strokeStyle = drawColor
      }
    }

    const draw = (e: React.MouseEvent) => {
      if (!isDrawingRef.current || tool !== 'draw') return
      const ctx = canvasRef.current!.getContext('2d')!
      const pos = getPos(e)
      ctx.beginPath()
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y)
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
      lastPosRef.current = pos
    }

    const stopDraw = () => {
      if (isDrawingRef.current) {
        isDrawingRef.current = false
        const dataUrl = canvasRef.current?.toDataURL() ?? null
        saveDrawing(pageIndex, dataUrl)
      }
    }

    // Touch support
    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const toMouse = (e: TouchEvent, type: string) => {
        if (e.touches.length > 1) return
        const touch = e.touches[0] || e.changedTouches[0]
        const mouseEvent = new MouseEvent(type, {
          clientX: touch.clientX,
          clientY: touch.clientY,
          button: 0,
        })
        canvas.dispatchEvent(mouseEvent)
        if (type !== 'mouseup') e.preventDefault()
      }

      const onTouchStart = (e: TouchEvent) => toMouse(e, 'mousedown')
      const onTouchMove = (e: TouchEvent) => toMouse(e, 'mousemove')
      const onTouchEnd = (e: TouchEvent) => toMouse(e, 'mouseup')

      canvas.addEventListener('touchstart', onTouchStart, { passive: false })
      canvas.addEventListener('touchmove', onTouchMove, { passive: false })
      canvas.addEventListener('touchend', onTouchEnd)
      return () => {
        canvas.removeEventListener('touchstart', onTouchStart)
        canvas.removeEventListener('touchmove', onTouchMove)
        canvas.removeEventListener('touchend', onTouchEnd)
      }
    }, [])

    return (
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="absolute inset-0"
        style={{
          cursor: tool === 'draw' ? (drawEraser ? 'cell' : 'crosshair') : 'default',
          pointerEvents: tool === 'draw' ? 'auto' : 'none',
          zIndex: 10,
        }}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={stopDraw}
        onMouseLeave={stopDraw}
      />
    )
  }
)
