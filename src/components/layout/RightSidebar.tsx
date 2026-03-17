import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Plus, Image, GitMerge, Scissors, Copy, Signature, X
} from '@phosphor-icons/react'
import { PageList } from '../pages/PageList'
import { usePdfStore } from '../../stores/usePdfStore'
import { useEditorStore } from '../../stores/useEditorStore'
import { useUiStore } from '../../stores/useUiStore'
import {
  insertBlankPage, insertImagePage, splitPage, duplicatePage,
  mergeSelectedPages, rebuildPdfJsDoc
} from '../../services/pdfPageOps'

interface Props {
  selectedIndices: number[]
  onSelectionChange: (indices: number[]) => void
}

export function RightSidebar({ selectedIndices, onSelectionChange }: Props) {
  const { t } = useTranslation()
  const imageInputRef = useRef<HTMLInputElement>(null)
  const { pdfDoc } = usePdfStore()
  const editorStore = useEditorStore()
  const { showToast, mobileSidebarOpen, toggleMobileSidebar } = useUiStore()

  const rebuild = async (newPageNum?: number) => {
    if (!pdfDoc) return
    const { pdfjsDoc } = await rebuildPdfJsDoc(pdfDoc)
    usePdfStore.setState({ pdfJsDoc: pdfjsDoc, totalPages: pdfjsDoc.numPages })
    if (newPageNum !== undefined) editorStore.setPage(newPageNum)
  }

  const handleInsertBlank = async () => {
    if (!pdfDoc) return
    const { annotations, drawings } = editorStore
    const result = await insertBlankPage(pdfDoc, editorStore.pageNum - 1, annotations, drawings)
    editorStore.insertPageAt(editorStore.pageNum)
    await rebuild(editorStore.pageNum + 1)
    showToast(t('toast.pageInserted'), 'success')
  }

  const handleInsertImage = () => {
    if (!pdfDoc) return
    imageInputRef.current?.click()
  }

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      showToast('只支援 PNG 或 JPG', 'error')
      return
    }
    const { annotations, drawings } = editorStore
    await insertImagePage(pdfDoc!, file, editorStore.pageNum - 1, annotations, drawings)
    editorStore.insertPageAt(editorStore.pageNum)
    await rebuild(editorStore.pageNum + 1)
    showToast(t('toast.pageInserted'), 'success')
    e.target.value = ''
  }

  const handleMerge = async () => {
    if (!pdfDoc || selectedIndices.length < 2) {
      showToast('請選擇兩頁以上進行合併', 'error')
      return
    }
    const { annotations, drawings } = editorStore
    const result = await mergeSelectedPages(pdfDoc, selectedIndices, annotations, drawings)
    // Update editor state to match
    const sorted = [...selectedIndices].sort((a, b) => a - b)
    for (let i = sorted.length - 1; i >= 1; i--) {
      editorStore.removePageAt(sorted[i])
    }
    await rebuild(result.baseIndex + 1)
    onSelectionChange([])
    showToast(t('toast.pageMerged'), 'success')
  }

  const handleSplit = async () => {
    if (!pdfDoc) return
    const { annotations, drawings } = editorStore
    await splitPage(pdfDoc, editorStore.pageNum - 1, annotations, drawings)
    editorStore.splitPageAt(editorStore.pageNum - 1)
    await rebuild(editorStore.pageNum)
    showToast(t('toast.pageSplit'), 'success')
  }

  const handleDuplicate = async () => {
    if (!pdfDoc) return
    const { annotations, drawings } = editorStore
    await duplicatePage(pdfDoc, editorStore.pageNum - 1, annotations, drawings)
    editorStore.duplicatePageAt(editorStore.pageNum - 1)
    await rebuild(editorStore.pageNum + 1)
    showToast(t('toast.pageDuplicated'), 'success')
  }

  const handleInsertSignature = () => {
    if (!pdfDoc) return
    const formFields = [...usePdfStore.getState().formFields]
    const { pageNum } = editorStore
    formFields.push({
      page: pageNum,
      name: 'Signature' + Date.now(),
      type: 'signature',
      rect: [350, 50, 550, 90], // approximate bottom-right
      value: '',
    })
    usePdfStore.setState({ formFields })
    showToast(t('toast.signatureInserted'), 'success')
  }

  const actionBtns = [
    { icon: Plus, label: t('sidebar.insertBlank'), onClick: handleInsertBlank },
    { icon: Image, label: t('sidebar.insertImage'), onClick: handleInsertImage },
    { icon: GitMerge, label: t('sidebar.merge'), onClick: handleMerge },
    { icon: Scissors, label: t('sidebar.split'), onClick: handleSplit },
    { icon: Copy, label: t('sidebar.duplicate'), onClick: handleDuplicate },
    { icon: Signature, label: t('sidebar.insertSignature'), onClick: handleInsertSignature },
  ]

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Action buttons */}
      <div className="p-3 border-b border-vibe-border">
        <div className="grid grid-cols-3 gap-1.5">
          {actionBtns.map(({ icon: Icon, label, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              disabled={!pdfDoc}
              className="flex flex-col items-center gap-1 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-xs"
              title={label}
            >
              <Icon size={18} />
              <span className="text-[10px] text-center leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Page list */}
      <div className="flex-1 overflow-y-auto p-3">
        <PageList
          selectedIndices={selectedIndices}
          onSelectionChange={onSelectionChange}
        />
      </div>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={handleImageFile}
      />
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col w-56 border-l border-vibe-border bg-vibe-bg shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile sidebar drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={toggleMobileSidebar} />
          <div className="absolute right-0 top-0 h-full w-64 bg-vibe-bg border-l border-vibe-border flex flex-col">
            <div className="flex items-center justify-between p-3 border-b border-vibe-border">
              <span className="font-semibold text-sm">{t('sidebar.pages')}</span>
              <button onClick={toggleMobileSidebar} className="p-1 rounded-lg hover:bg-white/10">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              {sidebarContent}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
