import { useTranslation } from 'react-i18next'
import { Cursor, TextT, PencilSimple, ArrowClockwise, Trash } from '@phosphor-icons/react'
import { useEditorStore } from '../../stores/useEditorStore'
import { usePdfStore } from '../../stores/usePdfStore'
import { useUiStore } from '../../stores/useUiStore'
import { rotatePage as rotatePageOp, deletePageAt as deletePageAtOp, rebuildPdfJsDoc } from '../../services/pdfPageOps'
import type { ToolType } from '../../stores/types'

export function LeftToolbar() {
  const { t } = useTranslation()
  const { tool, setTool, pageNum, annotations, drawings } = useEditorStore()
  const { pdfDoc } = usePdfStore()
  const { showToast } = useUiStore()

  const tools: { id: ToolType; icon: typeof Cursor; label: string }[] = [
    { id: 'cursor', icon: Cursor, label: t('toolbar.cursor') },
    { id: 'text', icon: TextT, label: t('toolbar.text') },
    { id: 'draw', icon: PencilSimple, label: t('toolbar.draw') },
  ]

  const handleRotate = async () => {
    if (!pdfDoc) return
    await rotatePageOp(pdfDoc, pageNum - 1, 90)
    const { pdfjsDoc } = await rebuildPdfJsDoc(pdfDoc)
    usePdfStore.setState({ pdfJsDoc: pdfjsDoc })
    useEditorStore.getState().rotatePage(pageNum - 1, 90)
    showToast(t('toast.pageRotated'), 'info')
  }

  const handleDelete = async () => {
    if (!pdfDoc) return
    if (pdfDoc.getPageCount() <= 1) { showToast(t('toast.minPages'), 'warning'); return }
    if (!confirm('確定要刪除此頁嗎？')) return
    const result = await deletePageAtOp(pdfDoc, pageNum - 1, annotations, drawings)
    useEditorStore.getState().removePageAt(pageNum - 1)
    const { pdfjsDoc } = await rebuildPdfJsDoc(pdfDoc)
    usePdfStore.setState({ pdfJsDoc: pdfjsDoc, totalPages: pdfjsDoc.numPages })
    useEditorStore.getState().setPage(result.newPageNum)
    showToast(t('toast.pageDeleted'), 'success')
  }

  return (
    <div className="hidden md:flex flex-col items-center py-4 px-2 gap-2 border-r border-vibe-border bg-vibe-bg w-16 shrink-0">
      {tools.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => setTool(id)}
          title={label}
          className={`tool-btn ${tool === id ? 'active' : ''} w-full justify-center`}
        >
          <Icon size={20} />
          <span className="text-[10px]">{label}</span>
        </button>
      ))}
      <div className="w-full h-px bg-vibe-border my-1" />
      <button onClick={handleRotate} disabled={!pdfDoc} title={t('toolbar.rotate')} className="tool-btn w-full justify-center">
        <ArrowClockwise size={20} />
        <span className="text-[10px]">{t('toolbar.rotate')}</span>
      </button>
      <button onClick={handleDelete} disabled={!pdfDoc} title={t('toolbar.delete')} className="tool-btn w-full justify-center text-red-400 hover:text-red-300">
        <Trash size={20} />
        <span className="text-[10px]">{t('toolbar.delete')}</span>
      </button>
    </div>
  )
}
