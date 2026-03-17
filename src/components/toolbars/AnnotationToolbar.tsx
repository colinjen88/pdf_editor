import { useTranslation } from 'react-i18next'
import { useEditorStore } from '../../stores/useEditorStore'

const FONTS = ['Inter', 'Arial', 'Helvetica', 'Times New Roman', 'Courier New']

export function AnnotationToolbar() {
  const { t } = useTranslation()
  const { annoColor, annoFont, annoSize, setAnnoColor, setAnnoFont, setAnnoSize } = useEditorStore()

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-vibe-surface border border-vibe-border rounded-xl shadow-lg px-4 py-2 flex items-center gap-4">
      <label className="flex items-center gap-2 text-sm text-gray-300">
        {t('annotation.color')}
        <input
          type="color"
          value={annoColor}
          onChange={e => setAnnoColor(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
        />
      </label>
      <label className="flex items-center gap-2 text-sm text-gray-300">
        {t('annotation.font')}
        <select
          value={annoFont}
          onChange={e => setAnnoFont(e.target.value)}
          className="px-2 py-1 bg-vibe-bg border border-vibe-border rounded text-sm text-vibe-text"
        >
          {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm text-gray-300">
        {t('annotation.size')}
        <input
          type="number"
          min={10} max={48}
          value={annoSize}
          onChange={e => setAnnoSize(Number(e.target.value))}
          className="w-14 px-2 py-1 bg-vibe-bg border border-vibe-border rounded text-sm text-vibe-text"
        />
      </label>
    </div>
  )
}
