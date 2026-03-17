import { useRef, useEffect, useCallback, useState } from 'react'
import { DrawingLayer, type DrawingLayerRef } from './DrawingLayer'
import { TextLayer } from './TextLayer'
import { FormFieldLayer } from './FormFieldLayer'
import { usePdfStore } from '../../stores/usePdfStore'
import { useEditorStore } from '../../stores/useEditorStore'
import { renderPageToCanvas } from '../../services/pdfRenderer'

export function PdfViewer() {
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null)
  const drawingLayerRef = useRef<DrawingLayerRef>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })

  const { pdfJsDoc } = usePdfStore()
  const { pageNum, scale, tool, annotations, drawings, saveDrawing } = useEditorStore()
  const pageIndex = pageNum - 1

  const renderPage = useCallback(async () => {
    if (!pdfJsDoc || !pdfCanvasRef.current) return
    await renderPageToCanvas(pdfJsDoc, pageNum, pdfCanvasRef.current, scale)
    const w = pdfCanvasRef.current.width
    const h = pdfCanvasRef.current.height
    setCanvasSize({ width: w, height: h })
  }, [pdfJsDoc, pageNum, scale])

  useEffect(() => {
    renderPage()
  }, [renderPage])

  if (!pdfJsDoc) return null

  return (
    <div
      className="canvas-container relative inline-block"
      style={{ width: canvasSize.width || undefined, height: canvasSize.height || undefined }}
    >
      <canvas ref={pdfCanvasRef} className="block" />
      <DrawingLayer
        ref={drawingLayerRef}
        width={canvasSize.width}
        height={canvasSize.height}
        currentDrawing={drawings[pageIndex] ?? null}
        pageIndex={pageIndex}
      />
      <TextLayer
        width={canvasSize.width}
        height={canvasSize.height}
        pageIndex={pageIndex}
        annotations={annotations[pageIndex] ?? []}
      />
      <FormFieldLayer
        pageIndex={pageIndex}
        scale={scale}
        canvasWidth={canvasSize.width}
        canvasHeight={canvasSize.height}
      />
    </div>
  )
}
