import { useTranslation } from 'react-i18next'
import { Modal } from '../ui/Modal'
import { useUiStore } from '../../stores/useUiStore'
import type { ThemeColor, Language } from '../../stores/types'
import i18n from '../../i18n'

interface Props {
  open: boolean
  onClose: () => void
}

const THEME_OPTIONS: { value: ThemeColor; label: string; bg: string }[] = [
  { value: 'indigo', label: '靛藍', bg: 'bg-indigo-500' },
  { value: 'emerald', label: '翡翠綠', bg: 'bg-emerald-500' },
  { value: 'rose', label: '玫瑰紅', bg: 'bg-rose-500' },
  { value: 'amber', label: '琥珀黃', bg: 'bg-amber-500' },
]

export function SettingsModal({ open, onClose }: Props) {
  const { t } = useTranslation()
  const { themeColor, setThemeColor, lang, setLang } = useUiStore()

  const handleLangChange = (newLang: Language) => {
    setLang(newLang)
    i18n.changeLanguage(newLang)
  }

  return (
    <Modal open={open} onClose={onClose} title={t('settings.title')}>
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-sm text-gray-400 mb-3">{t('settings.theme')}</p>
          <div className="flex gap-3">
            {THEME_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setThemeColor(opt.value)}
                className={`w-10 h-10 rounded-full ${opt.bg} transition-all ${themeColor === opt.value ? 'ring-2 ring-white ring-offset-2 ring-offset-vibe-bg scale-110' : 'opacity-60 hover:opacity-100'}`}
                title={t(`settings.${opt.value}`)}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-400 mb-3">{t('settings.language')}</p>
          <div className="flex gap-3">
            {(['zh-TW', 'en'] as Language[]).map(l => (
              <button
                key={l}
                onClick={() => handleLangChange(l)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${lang === l ? 'bg-indigo-600 text-white' : 'bg-vibe-bg border border-vibe-border text-gray-300 hover:text-white'}`}
              >
                {l === 'zh-TW' ? '繁體中文' : 'English'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}
