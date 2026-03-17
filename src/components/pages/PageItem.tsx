import { useRef, useEffect } from 'react'
import { Trash } from '@phosphor-icons/react'
import { usePdfStore } from '../../stores/usePdfStore'
import { renderThumbnail } from '../../services/pdfRenderer'

interface Props {
  pageIndex: number  // 0-based
  pageNumber: number // 1-based display
  isActive: boolean
  isSelected: boolean
  onSelect: (index: number, selected: boolean) => void
  onClick: (pageNum: number) => void
  onDelete: (pageIndex: number) => void
  onDragStart: (index: number) => void
  onDragOver: (e: React.DragEvent, index: number) => void
  onDrop: (fromIndex: number, toIndex: number) => void
}

export function PageItem({
  pageIndex, pageNumber, isActive, isSelected,
  onSelect, onClick, onDelete, onDragStart, onDragOver, onDrop
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { pdfJsDoc } = usePdfStore()

  useEffect(() => {
    if (!pdfJsDoc || !canvasRef.current) return
    renderThumbnail(pdfJsDoc, pageNumber, canvasRef.current).catch(console.error)
  }, [pdfJsDoc, pageNumber])

  return (
    <div
      data-index={pageIndex}
      draggable
      className={`
        page-item rounded-xl p-3 border transition-all cursor-pointer select-none
        ${isActive
          ? 'border-indigo-500/60 bg-indigo-600/10'
          : 'border-vibe-border bg-vibe-surface hover:border-indigo-400/40'
        }
        ${isSelected ? 'ring-1 ring-indigo-400' : ''}
      `}
      onClick={() => onClick(pageNumber)}
      onDragStart={e => {
        e.dataTransfer.setData('text/plain', String(pageIndex))
        e.dataTransfer.effectAllowed = 'move'
        onDragStart(pageIndex)
      }}
      onDragOver={e => {
        e.preventDefault()
        onDragOver(e, pageIndex)
      }}
      onDrop={e => {
        e.preventDefault()
        const fromIndex = Number(e.dataTransfer.getData('text/plain'))
        if (!isNaN(fromIndex) && fromIndex !== pageIndex) {
          onDrop(fromIndex, pageIndex)
        }
      }}
      onDragLeave={e => {
        (e.currentTarget as HTMLElement).classList.remove('border-t-2', 'border-indigo-400')
      }}
    >
      <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={e => { e.stopPropagation(); onSelect(pageIndex, e.target.checked) }}
            onClick={e => e.stopPropagation()}
            className="accent-indigo-500 w-3.5 h-3.5"
          />
          <span className="text-xs">第 {pageNumber} 頁</span>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onDelete(pageIndex) }}
          className="text-gray-500 hover:text-red-400 transition-colors p-0.5 rounded"
        >
          <Trash size={14} />
        </button>
      </div>
      <canvas ref={canvasRef} className="w-full rounded-md shadow" />
    </div>
  )
}
