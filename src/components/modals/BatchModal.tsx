import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { usePdfStore } from '../../stores/usePdfStore'
import { useEditorStore } from '../../stores/useEditorStore'
import { useUiStore } from '../../stores/useUiStore'
import { exportSelectedPages } from '../../services/pdfExporter'
import { deletePageAt, rebuildPdfJsDoc as rebuildPdfJs } from '../../services/pdfPageOps'
import { downloadBytes } from '../../utils/download'
import { PDFDocument } from 'pdf-lib'

interface Props {
  open: boolean
  onClose: () => void
  selectedIndices: number[]
  onPdfUpdated: () => void
}

export function BatchModal({ open, onClose, selectedIndices, onPdfUpdated }: Props) {
  const { t } = useTranslation()
  const { pdfDoc } = usePdfStore()
  const { showToast, showLoading, hideLoading } = useUiStore()
  const editorStore = useEditorStore()

  const [doBatchDelete, setDoBatchDelete] = useState(false)
  const [doBatchMerge, setDoBatchMerge] = useState(false)
  const [doBatchExport, setDoBatchExport] = useState(false)
  const [doBatchCompress, setDoBatchCompress] = useState(false)

  const handleExecute = async () => {
    if (!pdfDoc || selectedIndices.length === 0) {
      showToast(t('toast.noSelection'), 'warning')
      return
    }
    showLoading(t('toast.processing'))
    try {
      if (doBatchExport || doBatchCompress) {
        const bytes = await exportSelectedPages(pdfDoc, selectedIndices)
        if (doBatchExport) downloadBytes(bytes, 'vibe-batch-export.pdf')
        if (doBatchCompress) {
          const compressedDoc = await PDFDocument.load(bytes)
          const compressedBytes = await compressedDoc.save({ useObjectStreams: true })
          downloadBytes(compressedBytes, 'vibe-batch-compress.pdf')
        }
        showToast('批次匯出完成', 'success')
      }

      if (doBatchDelete) {
        const sorted = [...selectedIndices].sort((a, b) => b - a)
        let { annotations, drawings, pagesDetails, pageNum } = editorStore
        let details = [...pagesDetails]
        for (const idx of sorted) {
          const result = await deletePageAt(pdfDoc, idx, annotations, drawings)
          annotations = result.annotations
          drawings = result.drawings
          details.splice(idx, 1)
        }
        const pageCount = pdfDoc.getPageCount()
        useEditorStore.setState({
          annotations,
          drawings,
          pagesDetails: details,
          pageNum: Math.max(1, Math.min(pageNum, pageCount)),
        })
        const { pdfjsDoc } = await rebuildPdfJs(pdfDoc)
        usePdfStore.setState({ pdfJsDoc: pdfjsDoc, totalPages: pdfjsDoc.numPages })
        showToast('批次刪除完成', 'success')
        onPdfUpdated()
      }

      if (doBatchMerge) {
        const sorted = [...selectedIndices].sort((a, b) => a - b)
        for (let i = sorted.length - 1; i >= 1; i--) {
          pdfDoc.removePage(sorted[i])
          editorStore.removePageAt(sorted[i])
        }
        const { pdfjsDoc } = await rebuildPdfJs(pdfDoc)
        usePdfStore.setState({ pdfJsDoc: pdfjsDoc, totalPages: pdfjsDoc.numPages })
        showToast('批次合併完成', 'success')
        onPdfUpdated()
      }

      onClose()
    } catch (e) {
      console.error(e)
      showToast('批次操作失敗', 'error')
    } finally {
      hideLoading()
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={t('batch.title')}>
      <div className="flex flex-col gap-4">
        {selectedIndices.length === 0 && (
          <p className="text-yellow-400 text-sm">{t('batch.selectHint')}</p>
        )}
        {selectedIndices.length > 0 && (
          <p className="text-gray-400 text-sm">已選取 {selectedIndices.length} 頁</p>
        )}
        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
          <input type="checkbox" checked={doBatchDelete} onChange={e => setDoBatchDelete(e.target.checked)} className="accent-red-500 w-4 h-4" />
          {t('batch.delete')}
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
          <input type="checkbox" checked={doBatchMerge} onChange={e => setDoBatchMerge(e.target.checked)} className="accent-indigo-500 w-4 h-4" />
          {t('batch.merge')}
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
          <input type="checkbox" checked={doBatchExport} onChange={e => setDoBatchExport(e.target.checked)} className="accent-green-500 w-4 h-4" />
          {t('batch.export')}
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
          <input type="checkbox" checked={doBatchCompress} onChange={e => setDoBatchCompress(e.target.checked)} className="accent-amber-500 w-4 h-4" />
          {t('batch.compress')}
        </label>
        <div className="flex gap-3 pt-2">
          <Button variant="primary" onClick={handleExecute} disabled={selectedIndices.length === 0} className="flex-1">
            {t('batch.confirm')}
          </Button>
          <Button variant="secondary" onClick={onClose}>{t('batch.cancel')}</Button>
        </div>
      </div>
    </Modal>
  )
}
