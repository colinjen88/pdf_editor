import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { FilePdf } from '@phosphor-icons/react'

interface Props {
  onFileSelected: (file: File) => void
  isDragActive?: boolean
}

export function EmptyState({ onFileSelected, isDragActive }: Props) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 text-center p-8">
      <div
        className={`
          border-2 border-dashed rounded-2xl p-16 flex flex-col items-center gap-4
          transition-all duration-300 cursor-pointer
          ${isDragActive
            ? 'border-indigo-400 bg-indigo-500/10 scale-105'
            : 'border-vibe-border hover:border-indigo-400/50 hover:bg-indigo-500/5'
          }
        `}
        onClick={() => inputRef.current?.click()}
      >
        <FilePdf size={64} className={isDragActive ? 'text-indigo-400' : 'text-gray-500'} />
        <div>
          <p className="text-xl font-semibold text-vibe-text">{t('editor.dropZone')}</p>
          <p className="text-gray-400 mt-1">{t('editor.dropZoneOr')}</p>
          <button
            className="mt-3 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors"
            onClick={e => { e.stopPropagation(); inputRef.current?.click() }}
          >
            {t('editor.openFile')}
          </button>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) onFileSelected(file)
        }}
      />
    </div>
  )
}
