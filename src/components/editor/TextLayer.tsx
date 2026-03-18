import { useEffect, useRef } from 'react'
import { X } from '@phosphor-icons/react'
import { useEditorStore } from '../../stores/useEditorStore'
import type { Annotation } from '../../stores/types'

interface Props {
  width: number
  height: number
  pageIndex: number
  annotations: Annotation[]
}

export function TextLayer({ width, height, pageIndex, annotations }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { tool, annoColor, annoFont, annoSize, addAnnotation, updateAnnotation, removeAnnotation } = useEditorStore()

  const handleContainerClick = (e: React.MouseEvent) => {
    if (tool !== 'text') return
    if (e.target !== containerRef.current) return
    const rect = containerRef.current!.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    addAnnotation(pageIndex, { x, y, content: '輸入文字...', color: annoColor, font: annoFont, size: annoSize })
    useEditorStore.getState().setTool('cursor')
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      style={{
        width, height,
        cursor: tool === 'text' ? 'text' : 'default',
        pointerEvents: tool === 'text' ? 'auto' : 'none',
        zIndex: 20,
      }}
      onClick={handleContainerClick}
    >
      {annotations.map(anno => (
        <DraggableAnnotation
          key={anno.id}
          anno={anno}
          pageIndex={pageIndex}
          onUpdate={updates => updateAnnotation(pageIndex, anno.id, updates)}
          onDelete={() => removeAnnotation(pageIndex, anno.id)}
        />
      ))}
    </div>
  )
}

interface DraggableAnnotationProps {
  anno: Annotation
  pageIndex: number
  onUpdate: (updates: Partial<Annotation>) => void
  onDelete: () => void
}

function DraggableAnnotation({ anno, onUpdate, onDelete }: DraggableAnnotationProps) {
  const divRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startPos = useRef({ x: 0, y: 0, left: 0, top: 0 })
  const tool = useEditorStore(s => s.tool)

  useEffect(() => {
    if (divRef.current) {
      divRef.current.innerText = anno.content
    }
  }, []) // Only on mount

  const onMouseDown = (e: React.MouseEvent) => {
    if (tool !== 'cursor') return
    e.stopPropagation()
    isDragging.current = true
    startPos.current = { x: e.clientX, y: e.clientY, left: anno.x, top: anno.y }
    divRef.current!.style.borderColor = '#6366F1'

    const onMouseMove = (me: MouseEvent) => {
      if (!isDragging.current) return
      const newX = startPos.current.left + (me.clientX - startPos.current.x)
      const newY = startPos.current.top + (me.clientY - startPos.current.y)
      divRef.current!.style.left = `${newX}px`
      divRef.current!.style.top = `${newY}px`
      onUpdate({ x: newX, y: newY })
    }

    const onMouseUp = () => {
      isDragging.current = false
      if (divRef.current) divRef.current.style.borderColor = 'transparent'
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  return (
    <div
      className="absolute group"
      style={{ left: anno.x, top: anno.y, zIndex: 25 }}
    >
      <div
        ref={divRef}
        contentEditable
        suppressContentEditableWarning
        className="draggable-text pointer-events-auto"
        style={{
          color: anno.color,
          fontFamily: anno.font,
          fontSize: `${anno.size}px`,
          cursor: tool === 'cursor' ? 'move' : 'text',
          userSelect: tool === 'cursor' ? 'none' : 'text',
        }}
        onMouseDown={onMouseDown}
        onInput={e => onUpdate({ content: (e.target as HTMLDivElement).innerText })}
        onBlur={e => onUpdate({ content: e.target.innerText })}
      />
      <button
        onMouseDown={e => e.stopPropagation()}
        onClick={e => { e.stopPropagation(); onDelete() }}
        className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-auto"
        title="刪除"
      >
        <X size={8} weight="bold" />
      </button>
    </div>
  )
}
