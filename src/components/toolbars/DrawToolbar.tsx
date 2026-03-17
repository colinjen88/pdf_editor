import { useTranslation } from 'react-i18next'
import { Eraser } from '@phosphor-icons/react'
import { useEditorStore } from '../../stores/useEditorStore'

export function DrawToolbar() {
  const { t } = useTranslation()
  const { drawColor, drawWidth, drawEraser, setDrawColor, setDrawWidth, setDrawEraser } = useEditorStore()

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-vibe-surface border border-vibe-border rounded-xl shadow-lg px-4 py-2 flex items-center gap-4">
      <label className="flex items-center gap-2 text-sm text-gray-300">
        {t('draw.color')}
        <input
          type="color"
          value={drawColor}
          onChange={e => setDrawColor(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
        />
      </label>
      <label className="flex items-center gap-2 text-sm text-gray-300">
        {t('draw.width')}
        <input
          type="number"
          min={1} max={20}
          value={drawWidth}
          onChange={e => setDrawWidth(Number(e.target.value))}
          className="w-14 px-2 py-1 bg-vibe-bg border border-vibe-border rounded text-sm text-vibe-text"
        />
      </label>
      <button
        onClick={() => setDrawEraser(!drawEraser)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${drawEraser ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
      >
        <Eraser size={16} />
        {t('draw.eraser')}
      </button>
    </div>
  )
}
