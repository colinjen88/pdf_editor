import { useState, useCallback } from 'react'
import { PageItem } from './PageItem'
import { usePdfStore } from '../../stores/usePdfStore'
import { useEditorStore } from '../../stores/useEditorStore'
import { useUiStore } from '../../stores/useUiStore'
import { useHistoryStore } from '../../stores/useHistoryStore'
import { reorderPages as reorderPagesOp, deletePageAt as deletePageAtOp, rebuildPdfJsDoc } from '../../services/pdfPageOps'

interface Props {
  selectedIndices: number[]
  onSelectionChange: (indices: number[]) => void
}

export function PageList({ selectedIndices, onSelectionChange }: Props) {
  const { pdfJsDoc, pdfDoc, totalPages } = usePdfStore()
  const { pageNum, annotations, drawings } = useEditorStore()
  const { showToast } = useUiStore()
  const historyStore = useHistoryStore()
  const editorStore = useEditorStore()

  const handleSelect = useCallback((index: number, selected: boolean) => {
    if (selected) {
      onSelectionChange([...selectedIndices, index])
    } else {
      onSelectionChange(selectedIndices.filter(i => i !== index))
    }
  }, [selectedIndices, onSelectionChange])

  const handleClick = useCallback((pageNumber: number) => {
    editorStore.setPage(pageNumber)
  }, [editorStore])

  const handleDelete = useCallback(async (pageIndex: number) => {
    if (!pdfDoc) return
    if (pdfDoc.getPageCount() <= 1) {
      showToast('至少需要保留 1 頁', 'warning')
      return
    }
    if (!confirm('確定要刪除此頁嗎？')) return
    try {
      const result = await deletePageAtOp(pdfDoc, pageIndex, annotations, drawings)
      editorStore.removePageAt(pageIndex)
      const { pdfjsDoc } = await rebuildPdfJsDoc(pdfDoc)
      usePdfStore.setState({ pdfJsDoc: pdfjsDoc, totalPages: pdfjsDoc.numPages })
      editorStore.setPage(result.newPageNum)
      showToast('已刪除頁面', 'success')
    } catch (e) {
      console.error(e)
      showToast('刪除失敗', 'error')
    }
  }, [pdfDoc, annotations, drawings, editorStore, showToast])

  const handleDrop = useCallback(async (fromIndex: number, toIndex: number) => {
    if (!pdfDoc) return
    const currentIndex = pageNum - 1
    const result = await reorderPagesOp(pdfDoc, fromIndex, toIndex, currentIndex, annotations, drawings)
    editorStore.reorderPages(fromIndex, toIndex)
    const { pdfjsDoc } = await rebuildPdfJsDoc(pdfDoc)
    usePdfStore.setState({ pdfJsDoc: pdfjsDoc, totalPages: pdfjsDoc.numPages })
    editorStore.setPage(result.newPageIndex + 1)
    showToast('已重新排序頁面', 'success')
  }, [pdfDoc, pageNum, annotations, drawings, editorStore, showToast])

  if (!pdfJsDoc) return null

  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: totalPages }, (_, i) => (
        <PageItem
          key={i}
          pageIndex={i}
          pageNumber={i + 1}
          isActive={pageNum === i + 1}
          isSelected={selectedIndices.includes(i)}
          onSelect={handleSelect}
          onClick={handleClick}
          onDelete={handleDelete}
          onDragStart={() => {}}
          onDragOver={() => {}}
          onDrop={handleDrop}
        />
      ))}
    </div>
  )
}
