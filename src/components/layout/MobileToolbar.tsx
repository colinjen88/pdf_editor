import { useTranslation } from 'react-i18next'
import { CaretLeft, CaretRight, PencilSimple, ArrowClockwise, Trash } from '@phosphor-icons/react'
import { useEditorStore } from '../../stores/useEditorStore'
import { usePdfStore } from '../../stores/usePdfStore'
import { useUiStore } from '../../stores/useUiStore'
import { rotatePage as rotatePageOp, deletePageAt as deletePageAtOp, rebuildPdfJsDoc } from '../../services/pdfPageOps'

export function MobileToolbar() {
  const { t } = useTranslation()
  const { pageNum, setPage, tool, setTool, annotations, drawings } = useEditorStore()
  const { pdfJsDoc, pdfDoc, totalPages } = usePdfStore()
  const { showToast } = useUiStore()

  if (!pdfJsDoc) return null

  const handleRotate = async () => {
    if (!pdfDoc) return
    await rotatePageOp(pdfDoc, pageNum - 1, 90)
    const { pdfjsDoc } = await rebuildPdfJsDoc(pdfDoc)
    usePdfStore.setState({ pdfJsDoc: pdfjsDoc })
    showToast(t('toast.pageRotated'), 'info')
  }

  const handleDelete = async () => {
    if (!pdfDoc) return
    if (pdfDoc.getPageCount() <= 1) { showToast(t('toast.minPages'), 'warning'); return }
    if (!confirm('確定要刪除此頁嗎？')) return
    try {
      const result = await deletePageAtOp(pdfDoc, pageNum - 1, annotations, drawings)
      useEditorStore.getState().removePageAt(pageNum - 1)
      const { pdfjsDoc } = await rebuildPdfJsDoc(pdfDoc)
      usePdfStore.setState({ pdfJsDoc: pdfjsDoc, totalPages: pdfjsDoc.numPages })
      setPage(result.newPageNum)
      showToast(t('toast.pageDeleted'), 'success')
    } catch (e) {
      console.error(e)
      showToast('刪除失敗', 'error')
    }
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-vibe-surface border-t border-vibe-border flex items-center justify-around py-2 px-4 z-30 mobile-safe-bottom">
      <button
        onClick={() => pageNum > 1 && setPage(pageNum - 1)}
        disabled={pageNum <= 1}
        className="flex flex-col items-center gap-0.5 p-2 rounded-xl text-gray-400 disabled:opacity-30"
      >
        <CaretLeft size={20} />
        <span className="text-[10px]">{t('editor.prev')}</span>
      </button>

      <span className="text-sm text-gray-400 min-w-[60px] text-center">
        <span className="text-white font-medium">{pageNum}</span> / {totalPages}
      </span>

      <button
        onClick={() => pageNum < totalPages && setPage(pageNum + 1)}
        disabled={pageNum >= totalPages}
        className="flex flex-col items-center gap-0.5 p-2 rounded-xl text-gray-400 disabled:opacity-30"
      >
        <CaretRight size={20} />
        <span className="text-[10px]">{t('editor.next')}</span>
      </button>

      <div className="w-px h-8 bg-vibe-border" />

      <button
        onClick={() => setTool(tool === 'cursor' ? 'draw' : 'cursor')}
        className={`flex flex-col items-center gap-0.5 p-2 rounded-xl ${tool === 'draw' ? 'text-indigo-400' : 'text-gray-400'}`}
      >
        <PencilSimple size={20} />
        <span className="text-[10px]">{t('toolbar.draw')}</span>
      </button>

      <button onClick={handleRotate} className="flex flex-col items-center gap-0.5 p-2 rounded-xl text-gray-400">
        <ArrowClockwise size={20} />
        <span className="text-[10px]">{t('toolbar.rotate')}</span>
      </button>

      <button onClick={handleDelete} className="flex flex-col items-center gap-0.5 p-2 rounded-xl text-red-400">
        <Trash size={20} />
        <span className="text-[10px]">{t('toolbar.delete')}</span>
      </button>
    </div>
  )
}
