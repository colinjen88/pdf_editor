import type { PDFDocument } from 'pdf-lib'
import type { PDFDocumentProxy } from 'pdfjs-dist'

export type ToolType = 'cursor' | 'text' | 'draw'
export type ThemeColor = 'indigo' | 'emerald' | 'rose' | 'amber'
export type Language = 'zh-TW' | 'en'
export type ToastType = 'info' | 'success' | 'warning' | 'error'

export interface Annotation {
  id: string
  x: number
  y: number
  content: string
  color: string
  font: string
  size: number
}

export interface PageDetail {
  rotation: number
}

export interface FormField {
  page: number
  name: string
  type: 'text' | 'signature' | 'checkbox' | 'radio' | 'button'
  rect: [number, number, number, number] // [x1, y1, x2, y2] in PDF units
  value: string
}

export interface ToastMessage {
  id: string
  message: string
  type: ToastType
  duration: number
}

export interface HistorySnapshot {
  pageNum: number
  annotations: Annotation[][]
  drawings: (string | null)[]
  pagesDetails: PageDetail[]
  formFields: FormField[] | null
}

// ---- Store interfaces ----

export interface PdfStore {
  pdfDoc: PDFDocument | null
  pdfJsDoc: PDFDocumentProxy | null
  pdfBytes: Uint8Array | ArrayBuffer | null
  totalPages: number
  formFields: FormField[]
  loadPdf: (buffer: ArrayBuffer, fileName?: string) => Promise<void>
  rebuildPdfJsDoc: (targetPage?: number) => Promise<void>
  reset: () => void
}

export interface EditorStore {
  pageNum: number
  scale: number
  tool: ToolType
  annotations: Annotation[][]
  drawings: (string | null)[]
  pagesDetails: PageDetail[]
  // Drawing tool
  drawColor: string
  drawWidth: number
  drawEraser: boolean
  // Annotation tool
  annoColor: string
  annoFont: string
  annoSize: number

  setPage: (num: number) => void
  setScale: (scale: number) => void
  setTool: (tool: ToolType) => void
  setDrawColor: (color: string) => void
  setDrawWidth: (width: number) => void
  setDrawEraser: (eraser: boolean) => void
  setAnnoColor: (color: string) => void
  setAnnoFont: (font: string) => void
  setAnnoSize: (size: number) => void
  addAnnotation: (pageIndex: number, anno: Omit<Annotation, 'id'>) => void
  updateAnnotation: (pageIndex: number, id: string, updates: Partial<Annotation>) => void
  removeAnnotation: (pageIndex: number, id: string) => void
  saveDrawing: (pageIndex: number, dataUrl: string | null) => void
  initPages: (count: number) => void
  reorderPages: (fromIndex: number, toIndex: number) => void
  insertPageAt: (index: number) => void
  removePageAt: (index: number) => void
  duplicatePageAt: (index: number) => void
  splitPageAt: (index: number) => void
  rotatePage: (pageIndex: number, delta: number) => void
}

export interface HistoryStore {
  snapshots: HistorySnapshot[]
  index: number
  canUndo: boolean
  canRedo: boolean
  push: (snapshot: HistorySnapshot) => void
  undo: () => HistorySnapshot | null
  redo: () => HistorySnapshot | null
  reset: () => void
}

export interface UiStore {
  darkMode: boolean
  themeColor: ThemeColor
  lang: Language
  mobileSidebarOpen: boolean
  compressModalOpen: boolean
  batchModalOpen: boolean
  convertModalOpen: boolean
  apiModalOpen: boolean
  settingsModalOpen: boolean
  toasts: ToastMessage[]
  loading: boolean
  loadingMessage: string

  setDarkMode: (dark: boolean) => void
  setThemeColor: (color: ThemeColor) => void
  setLang: (lang: Language) => void
  toggleMobileSidebar: () => void
  openModal: (name: ModalName) => void
  closeModal: (name: ModalName) => void
  showToast: (message: string, type?: ToastType, duration?: number) => void
  removeToast: (id: string) => void
  showLoading: (message?: string) => void
  hideLoading: () => void
}

export type ModalName = 'compress' | 'batch' | 'convert' | 'api' | 'settings'

export const THEME_COLORS: Record<ThemeColor, { accent: string; bg: string; accentClass: string }> = {
  indigo: { accent: '#6366F1', bg: '#0F1117', accentClass: 'indigo' },
  emerald: { accent: '#10B981', bg: '#0F1117', accentClass: 'emerald' },
  rose: { accent: '#F43F5E', bg: '#1E212B', accentClass: 'rose' },
  amber: { accent: '#F59E0B', bg: '#1E212B', accentClass: 'amber' }
}
