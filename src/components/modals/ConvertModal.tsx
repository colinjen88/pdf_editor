import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { usePdfStore } from '../../stores/usePdfStore'
import { useUiStore } from '../../stores/useUiStore'
import { exportAsImages } from '../../services/imageExporter'
import { exportAsWord } from '../../services/wordExporter'

interface Props {
  open: boolean
  onClose: () => void
}

export function ConvertModal({ open, onClose }: Props) {
  const { t } = useTranslation()
  const { pdfJsDoc } = usePdfStore()
  const { showToast, showLoading, hideLoading } = useUiStore()
  const [format, setFormat] = useState<'word' | 'png' | 'jpg'>('word')
  const [processing, setProcessing] = useState(false)

  const handleConvert = async () => {
    if (!pdfJsDoc) { showToast('請先載入 PDF', 'warning'); return }
    setProcessing(true)
    showLoading(t('convert.processing'))
    try {
      if (format === 'word') {
        await exportAsWord(pdfJsDoc)
        showToast(t('convert.wordSuccess'), 'success')
      } else {
        await exportAsImages(pdfJsDoc, format)
        showToast(t('convert.imageSuccess'), 'success')
      }
      onClose()
    } catch (e) {
      console.error(e)
      showToast('轉換失敗', 'error')
    } finally {
      setProcessing(false)
      hideLoading()
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={t('convert.title')}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-gray-400">{t('convert.selectFormat')}</p>
        {(['word', 'png', 'jpg'] as const).map(f => (
          <label key={f} className="flex items-center gap-3 text-sm text-gray-300 cursor-pointer">
            <input
              type="radio" name="convert-type" value={f}
              checked={format === f}
              onChange={() => setFormat(f)}
              className="accent-indigo-500 w-4 h-4"
            />
            {t(`convert.${f}`)}
          </label>
        ))}
        <div className="flex gap-3 pt-2">
          <Button variant="primary" onClick={handleConvert} disabled={processing} className="flex-1">
            {processing ? t('convert.processing') : t('convert.confirm')}
          </Button>
          <Button variant="secondary" onClick={onClose}>{t('convert.cancel')}</Button>
        </div>
      </div>
    </Modal>
  )
}
