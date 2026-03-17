import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { useUiStore } from '../../stores/useUiStore'

interface Props {
  open: boolean
  onClose: () => void
}

export function ApiModal({ open, onClose }: Props) {
  const { t } = useTranslation()
  const { showToast } = useUiStore()
  const [doExport, setDoExport] = useState(false)
  const [doCollab, setDoCollab] = useState(false)
  const [result, setResult] = useState('')

  const handleExecute = () => {
    let r = ''
    if (doExport) r += 'PDF 已匯出至 API 端點（僅示意）\n'
    if (doCollab) r += '協作連結：https://vibe-collab.example.com/xxxxxx\n'
    setResult(r)
    showToast('API/協作操作完成', 'success')
  }

  return (
    <Modal open={open} onClose={onClose} title={t('api.title')}>
      <div className="flex flex-col gap-4">
        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
          <input type="checkbox" checked={doExport} onChange={e => setDoExport(e.target.checked)} className="accent-indigo-500 w-4 h-4" />
          {t('api.exportHint')}
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
          <input type="checkbox" checked={doCollab} onChange={e => setDoCollab(e.target.checked)} className="accent-green-500 w-4 h-4" />
          {t('api.collabHint')}
        </label>
        {result && (
          <pre className="mt-2 p-3 bg-vibe-bg rounded-lg text-xs text-gray-300 whitespace-pre-wrap">{result}</pre>
        )}
        <div className="flex gap-3 pt-2">
          <Button variant="primary" onClick={handleExecute} className="flex-1">{t('api.export')}</Button>
          <Button variant="secondary" onClick={onClose}>{t('api.cancel')}</Button>
        </div>
      </div>
    </Modal>
  )
}
