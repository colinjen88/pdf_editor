import { useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { AppHeader } from './components/layout/AppHeader'
import { LeftToolbar } from './components/layout/LeftToolbar'
import { RightSidebar } from './components/layout/RightSidebar'
import { Footer } from './components/layout/Footer'
import { MobileToolbar } from './components/layout/MobileToolbar'
import { PdfViewer } from './components/editor/PdfViewer'
import { EmptyState } from './components/editor/EmptyState'
import { DrawToolbar } from './components/toolbars/DrawToolbar'
import { AnnotationToolbar } from './components/toolbars/AnnotationToolbar'
import { CompressModal } from './components/modals/CompressModal'
import { BatchModal } from './components/modals/BatchModal'
import { ConvertModal } from './components/modals/ConvertModal'
import { SettingsModal } from './components/modals/SettingsModal'
import { ToastContainer } from './components/ui/Toast'
import { Spinner } from './components/ui/Spinner'
import { usePdfStore } from './stores/usePdfStore'
import { useEditorStore } from './stores/useEditorStore'
import { useUiStore } from './stores/useUiStore'
import { useHistoryStore } from './stores/useHistoryStore'
import { scanPdfSecurity } from './services/pdfLoader'

export default function App() {
  const { t } = useTranslation()
  const [selectedIndices, setSelectedIndices] = useState<number[]>([])

  const { pdfJsDoc, loadPdf, totalPages } = usePdfStore()
  const { pageNum, tool, initPages } = useEditorStore()
  const {
    compressModalOpen, batchModalOpen, convertModalOpen, settingsModalOpen,
    closeModal, toasts, removeToast, loading, loadingMessage,
    showToast, showLoading, hideLoading
  } = useUiStore()
  const historyStore = useHistoryStore()

  // Initialize drag-over zone
  const [isDragActive, setIsDragActive] = useState(false)

  const handleFileDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(false)
    const file = Array.from(e.dataTransfer.files).find(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'))
    if (!file) return
    await loadPdfFile(file)
  }, [])

  const loadPdfFile = async (file: File) => {
    showLoading(t('toast.processing'))
    try {
      const buffer = await file.arrayBuffer()
      const security = await scanPdfSecurity(buffer)
      if (security.messages.length > 0) {
        showToast(security.messages.join('、'), 'warning', 5000)
      }
      await loadPdf(buffer)
      const count = usePdfStore.getState().totalPages
      initPages(count)
      historyStore.reset()
      setSelectedIndices([])
    } catch (e) {
      console.error(e)
      showToast(t('toast.loadError'), 'error')
    } finally {
      hideLoading()
    }
  }

  const handlePdfLoaded = useCallback(() => {
    const count = usePdfStore.getState().totalPages
    initPages(count)
    historyStore.reset()
    setSelectedIndices([])
  }, [initPages, historyStore])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        const snapshot = historyStore.undo()
        if (snapshot) {
          useEditorStore.setState({
            pageNum: snapshot.pageNum,
            annotations: snapshot.annotations,
            drawings: snapshot.drawings,
            pagesDetails: snapshot.pagesDetails,
          })
          if (snapshot.formFields) usePdfStore.setState({ formFields: snapshot.formFields })
          showToast(t('toast.undone'), 'success')
        } else {
          showToast(t('toast.noUndo'), 'info')
        }
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        const snapshot = historyStore.redo()
        if (snapshot) {
          useEditorStore.setState({
            pageNum: snapshot.pageNum,
            annotations: snapshot.annotations,
            drawings: snapshot.drawings,
            pagesDetails: snapshot.pagesDetails,
          })
          if (snapshot.formFields) usePdfStore.setState({ formFields: snapshot.formFields })
          showToast(t('toast.redone'), 'success')
        } else {
          showToast(t('toast.noRedo'), 'info')
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [historyStore, showToast, t])

  return (
    <div
      className="flex flex-col h-screen bg-vibe-bg text-vibe-text overflow-hidden"
      onDragOver={e => { e.preventDefault(); setIsDragActive(true) }}
      onDragLeave={() => setIsDragActive(false)}
      onDrop={handleFileDrop}
    >
      {/* Header */}
      <AppHeader onPdfLoaded={handlePdfLoaded} />

      {/* Main layout */}
      <div className="flex flex-1 min-h-0">
        {/* Left toolbar (desktop) */}
        <LeftToolbar />

        {/* Center editor area */}
        <main
          id="main-scroll"
          className="flex-1 overflow-auto flex items-start justify-center p-4 md:p-8 relative"
        >
          {!pdfJsDoc ? (
            <EmptyState onFileSelected={loadPdfFile} isDragActive={isDragActive} />
          ) : (
            <PdfViewer />
          )}
        </main>

        {/* Right sidebar */}
        <RightSidebar
          selectedIndices={selectedIndices}
          onSelectionChange={setSelectedIndices}
        />
      </div>

      {/* Footer (desktop page nav) */}
      <Footer />

      {/* Mobile bottom toolbar */}
      <MobileToolbar />

      {/* Floating toolbars */}
      {tool === 'draw' && pdfJsDoc && <DrawToolbar />}
      {tool === 'text' && pdfJsDoc && <AnnotationToolbar />}

      {/* Modals */}
      <CompressModal open={compressModalOpen} onClose={() => closeModal('compress')} />
      <BatchModal
        open={batchModalOpen}
        onClose={() => closeModal('batch')}
        selectedIndices={selectedIndices}
        onPdfUpdated={() => setSelectedIndices([])}
      />
      <ConvertModal open={convertModalOpen} onClose={() => closeModal('convert')} />
      <SettingsModal open={settingsModalOpen} onClose={() => closeModal('settings')} />

      {/* Global overlays */}
      {loading && <Spinner message={loadingMessage} />}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
