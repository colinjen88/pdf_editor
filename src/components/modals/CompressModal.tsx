import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { usePdfStore } from '../../stores/usePdfStore'
import { useEditorStore } from '../../stores/useEditorStore'
import { useUiStore } from '../../stores/useUiStore'
import { compressPdf } from '../../services/pdfCompressor'
import { downloadBytes } from '../../utils/download'

interface Props {
  open: boolean
  onClose: () => void
}

export function CompressModal({ open, onClose }: Props) {
  const { t } = useTranslation()
  const { pdfDoc } = usePdfStore()
  const { annotations, drawings, scale } = useEditorStore()
  const { showToast, showLoading, hideLoading } = useUiStore()

  const [mode, setMode] = useState<'lossless' | 'raster'>('lossless')
  const [rasterScale, setRasterScale] = useState(0.8)
  const [quality, setQuality] = useState(0.82)
  const [password, setPassword] = useState('')
  const [safeFilter, setSafeFilter] = useState(false)
  const [processing, setProcessing] = useState(false)

  const isRaster = mode === 'raster'

  const handleCompress = async () => {
    if (!pdfDoc) return
    setProcessing(true)
    showLoading(t('compress.processing'))
    try {
      const bytes = await compressPdf(pdfDoc, annotations, drawings, scale, {
        mode,
        scale: rasterScale,
        quality,
      })
      if (password) {
        showToast('前端加密僅示意，請用專業工具加密 PDF', 'warning')
      }
      downloadBytes(bytes, 'vibe-compressed.pdf')
      showToast(t('compress.success'), 'success')
      onClose()
    } catch (e) {
      console.error(e)
      showToast('壓縮失敗，請稍後再試', 'error')
    } finally {
      setProcessing(false)
      hideLoading()
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={t('compress.title')}>
      <div className="flex flex-col gap-5">
        {/* Mode */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">{t('compress.mode')}</label>
          <select
            value={mode}
            onChange={e => setMode(e.target.value as 'lossless' | 'raster')}
            className="w-full px-3 py-2 bg-vibe-bg border border-vibe-border rounded-lg text-vibe-text text-sm"
          >
            <option value="lossless">{t('compress.lossless')}</option>
            <option value="raster">{t('compress.raster')}</option>
          </select>
        </div>

        {/* Raster settings */}
        {isRaster && (
          <>
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs">
              {t('compress.warning')}
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                {t('compress.scale')}: <span className="text-white">{rasterScale}</span>
              </label>
              <input
                type="range" min="0.5" max="1.0" step="0.05"
                value={rasterScale}
                onChange={e => setRasterScale(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                {t('compress.quality')}: <span className="text-white">{quality}</span>
              </label>
              <input
                type="range" min="0.5" max="0.95" step="0.05"
                value={quality}
                onChange={e => setQuality(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
          </>
        )}

        {/* Safe filter */}
        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={safeFilter}
            onChange={e => setSafeFilter(e.target.checked)}
            className="accent-indigo-500 w-4 h-4"
          />
          {t('compress.safeFilter')}
        </label>

        {/* Password */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">{t('compress.password')}</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder={t('compress.passwordPlaceholder')}
            className="w-full px-3 py-2 bg-vibe-bg border border-vibe-border rounded-lg text-vibe-text text-sm placeholder-gray-500"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="primary" onClick={handleCompress} disabled={processing} className="flex-1">
            {processing ? t('compress.processing') : t('compress.confirm')}
          </Button>
          <Button variant="secondary" onClick={onClose} disabled={processing}>
            {t('compress.cancel')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
