import { useTranslation } from 'react-i18next'
import {
  ArrowCounterClockwise, ArrowClockwise, FolderOpen,
  ArrowsClockwise, StackSimple, Export,
  Moon, Sun, List
} from '@phosphor-icons/react'
import { useUiStore } from '../../stores/useUiStore'
import { useHistoryStore } from '../../stores/useHistoryStore'
import { useEditorStore } from '../../stores/useEditorStore'
import { usePdfStore } from '../../stores/usePdfStore'
import { buildEditedPdfBytes } from '../../services/pdfExporter'
import { downloadBytes } from '../../utils/download'
import { openPdfFile } from '../../services/fileSystem'
import { scanPdfSecurity } from '../../services/pdfLoader'
import i18n from '../../i18n'
import type { Language } from '../../stores/types'

interface Props {
  onPdfLoaded: () => void
}

export function AppHeader({ onPdfLoaded }: Props) {
  const { t } = useTranslation()
  const { darkMode, setDarkMode, setThemeColor, lang, setLang, openModal, toggleMobileSidebar, showToast, showLoading, hideLoading } = useUiStore()
  const { canUndo, canRedo, undo, redo } = useHistoryStore()
  const { pdfDoc, loadPdf } = usePdfStore()
  const editorStore = useEditorStore()

  const handleUndo = () => {
    const snapshot = undo()
    if (!snapshot) { showToast(t('toast.noUndo'), 'info'); return }
    editorStore.initPages(snapshot.annotations.length)
    useEditorStore.setState({
      pageNum: snapshot.pageNum,
      annotations: snapshot.annotations,
      drawings: snapshot.drawings,
      pagesDetails: snapshot.pagesDetails,
    })
    if (snapshot.formFields) usePdfStore.setState({ formFields: snapshot.formFields })
    showToast(t('toast.undone'), 'success')
  }

  const handleRedo = () => {
    const snapshot = redo()
    if (!snapshot) { showToast(t('toast.noRedo'), 'info'); return }
    useEditorStore.setState({
      pageNum: snapshot.pageNum,
      annotations: snapshot.annotations,
      drawings: snapshot.drawings,
      pagesDetails: snapshot.pagesDetails,
    })
    if (snapshot.formFields) usePdfStore.setState({ formFields: snapshot.formFields })
    showToast(t('toast.redone'), 'success')
  }

  const handleOpenFile = async () => {
    const result = await openPdfFile()
    if (!result) return
    showLoading(t('toast.processing'))
    try {
      const security = await scanPdfSecurity(result.buffer)
      if (security.messages.length > 0) {
        showToast(security.messages.join('、'), 'warning', 5000)
      }
      await loadPdf(result.buffer)
      onPdfLoaded()
    } catch (e) {
      console.error(e)
      showToast(t('toast.loadError'), 'error')
    } finally {
      hideLoading()
    }
  }

  const handleExport = async () => {
    if (!pdfDoc) return
    showLoading('PDF 產生中...')
    try {
      const { annotations, drawings, scale } = editorStore
      const bytes = await buildEditedPdfBytes(pdfDoc, annotations, drawings, scale)
      downloadBytes(bytes, 'vibe-edited.pdf')
      showToast(t('toast.exported'), 'success')
    } catch (e) {
      console.error(e)
      showToast('匯出失敗', 'error')
    } finally {
      hideLoading()
    }
  }

  const handleLangChange = (newLang: Language) => {
    setLang(newLang)
    i18n.changeLanguage(newLang)
  }

  return (
    <header className="h-12 bg-vibe-surface border-b border-vibe-border flex items-center px-3 gap-2 shrink-0 z-30">
      {/* Logo */}
      <span className="text-base font-bold text-vibe-text tracking-tight mr-1 hidden sm:block">
        <span className="text-indigo-400">Vibe</span> PDF
      </span>

      {/* File open */}
      <button onClick={handleOpenFile} className="header-btn" title={t('header.openFile')}>
        <FolderOpen size={16} />
        <span className="hidden md:inline">{t('header.openFile')}</span>
      </button>

      <div className="w-px h-5 bg-vibe-border mx-1" />

      {/* Undo / Redo */}
      <button onClick={handleUndo} disabled={!canUndo} className="header-btn" title={t('toolbar.undo')}>
        <ArrowCounterClockwise size={16} />
      </button>
      <button onClick={handleRedo} disabled={!canRedo} className="header-btn" title={t('toolbar.redo')}>
        <ArrowClockwise size={16} />
      </button>

      <div className="flex-1" />

      {/* Tool buttons */}
      <button onClick={() => openModal('compress')} className="header-btn" title={t('header.compress')}>
        <ArrowsClockwise size={16} />
        <span className="hidden lg:inline text-xs">{t('header.compress')}</span>
      </button>
      <button onClick={() => openModal('batch')} className="header-btn" title={t('header.batch')}>
        <StackSimple size={16} />
        <span className="hidden lg:inline text-xs">{t('header.batch')}</span>
      </button>
      <button onClick={() => openModal('convert')} className="header-btn" title={t('header.convert')}>
        <ArrowsClockwise size={16} />
        <span className="hidden lg:inline text-xs">{t('header.convert')}</span>
      </button>

      <div className="w-px h-5 bg-vibe-border mx-1" />

      {/* Export */}
      <button onClick={handleExport} disabled={!pdfDoc} className="header-btn-primary" title={t('header.export')}>
        <Export size={16} />
        <span className="hidden sm:inline text-xs">{t('header.export')}</span>
      </button>

      <div className="w-px h-5 bg-vibe-border mx-1" />

      {/* Theme */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="header-btn"
        title={darkMode ? t('header.darkMode') : t('header.lightMode')}
      >
        {darkMode ? <Moon size={16} /> : <Sun size={16} />}
      </button>

      {/* Language */}
      <button
        onClick={() => handleLangChange(lang === 'zh-TW' ? 'en' : 'zh-TW')}
        className="header-btn text-xs font-medium"
      >
        {lang === 'zh-TW' ? 'EN' : '中文'}
      </button>

      {/* Mobile menu */}
      <button onClick={toggleMobileSidebar} className="header-btn md:hidden" title="頁面列表">
        <List size={18} />
      </button>
    </header>
  )
}
