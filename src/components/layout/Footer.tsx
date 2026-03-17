import { useTranslation } from 'react-i18next'
import { CaretLeft, CaretRight } from '@phosphor-icons/react'
import { useEditorStore } from '../../stores/useEditorStore'
import { usePdfStore } from '../../stores/usePdfStore'

export function Footer() {
  const { t } = useTranslation()
  const { pageNum, setPage } = useEditorStore()
  const { pdfJsDoc, totalPages } = usePdfStore()

  const changePage = (delta: number) => {
    if (!pdfJsDoc) return
    const newNum = pageNum + delta
    if (newNum >= 1 && newNum <= totalPages) {
      setPage(newNum)
    }
  }

  if (!pdfJsDoc) return null

  return (
    <footer className="hidden md:flex h-10 items-center justify-center gap-4 border-t border-vibe-border bg-vibe-surface px-4 shrink-0">
      <button
        onClick={() => changePage(-1)}
        disabled={pageNum <= 1}
        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        title={t('editor.prev')}
      >
        <CaretLeft size={16} />
      </button>
      <span className="text-sm text-gray-400">
        <span className="text-white font-medium">{pageNum}</span>
        {' '}{t('editor.of')}{' '}
        <span className="text-white font-medium">{totalPages}</span>
      </span>
      <button
        onClick={() => changePage(1)}
        disabled={pageNum >= totalPages}
        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        title={t('editor.next')}
      >
        <CaretRight size={16} />
      </button>
    </footer>
  )
}
