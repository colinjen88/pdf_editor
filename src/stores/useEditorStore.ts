import { create } from 'zustand'
import type { EditorStore, ToolType, Annotation, PageDetail } from './types'

function uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return Math.random().toString(36).slice(2)
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  pageNum: 1,
  scale: 1.5,
  tool: 'cursor',
  annotations: [],
  drawings: [],
  pagesDetails: [],
  drawColor: '#ef4444',
  drawWidth: 3,
  drawEraser: false,
  annoColor: '#222222',
  annoFont: 'Inter',
  annoSize: 16,

  setPage: (num) => set({ pageNum: num }),
  setScale: (scale) => set({ scale }),
  setTool: (tool: ToolType) => set({ tool }),
  setDrawColor: (drawColor) => set({ drawColor }),
  setDrawWidth: (drawWidth) => set({ drawWidth }),
  setDrawEraser: (drawEraser) => set({ drawEraser }),
  setAnnoColor: (annoColor) => set({ annoColor }),
  setAnnoFont: (annoFont) => set({ annoFont }),
  setAnnoSize: (annoSize) => set({ annoSize }),

  addAnnotation: (pageIndex, anno) => {
    const annotations = [...get().annotations]
    if (!annotations[pageIndex]) annotations[pageIndex] = []
    annotations[pageIndex] = [...annotations[pageIndex], { ...anno, id: uid() }]
    set({ annotations })
  },

  updateAnnotation: (pageIndex, id, updates) => {
    const annotations = get().annotations.map((pageAnnos, i) => {
      if (i !== pageIndex) return pageAnnos
      return pageAnnos.map(a => a.id === id ? { ...a, ...updates } : a)
    })
    set({ annotations })
  },

  removeAnnotation: (pageIndex, id) => {
    const annotations = get().annotations.map((pageAnnos, i) => {
      if (i !== pageIndex) return pageAnnos
      return pageAnnos.filter(a => a.id !== id)
    })
    set({ annotations })
  },

  saveDrawing: (pageIndex, dataUrl) => {
    const drawings = [...get().drawings]
    drawings[pageIndex] = dataUrl
    set({ drawings })
  },

  initPages: (count) => {
    set({
      pageNum: 1,
      annotations: Array.from({ length: count }, () => []),
      drawings: Array.from({ length: count }, () => null),
      pagesDetails: Array.from({ length: count }, () => ({ rotation: 0 })),
    })
  },

  reorderPages: (fromIndex, toIndex) => {
    const { annotations, drawings, pagesDetails, pageNum } = get()
    const move = <T>(arr: T[]) => {
      const result = [...arr]
      const [item] = result.splice(fromIndex, 1)
      result.splice(toIndex, 0, item)
      return result
    }
    let newPage = pageNum - 1
    if (newPage === fromIndex) newPage = toIndex
    else if (fromIndex < toIndex && newPage > fromIndex && newPage <= toIndex) newPage -= 1
    else if (fromIndex > toIndex && newPage >= toIndex && newPage < fromIndex) newPage += 1
    set({
      annotations: move(annotations),
      drawings: move(drawings),
      pagesDetails: move(pagesDetails),
      pageNum: newPage + 1,
    })
  },

  insertPageAt: (index) => {
    const { annotations, drawings, pagesDetails } = get()
    const newAnnotations = [...annotations]
    const newDrawings = [...drawings]
    const newDetails = [...pagesDetails]
    newAnnotations.splice(index, 0, [])
    newDrawings.splice(index, 0, null)
    newDetails.splice(index, 0, { rotation: 0 })
    set({ annotations: newAnnotations, drawings: newDrawings, pagesDetails: newDetails })
  },

  removePageAt: (index) => {
    const { annotations, drawings, pagesDetails, pageNum } = get()
    const newAnnotations = [...annotations]
    const newDrawings = [...drawings]
    const newDetails = [...pagesDetails]
    newAnnotations.splice(index, 1)
    newDrawings.splice(index, 1)
    newDetails.splice(index, 1)
    const newPageNum = Math.max(1, Math.min(pageNum, newAnnotations.length))
    set({ annotations: newAnnotations, drawings: newDrawings, pagesDetails: newDetails, pageNum: newPageNum })
  },

  duplicatePageAt: (index) => {
    const { annotations, drawings, pagesDetails } = get()
    const newAnnotations = [...annotations]
    const newDrawings = [...drawings]
    const newDetails = [...pagesDetails]
    newAnnotations.splice(index + 1, 0, [...(annotations[index] || []).map(a => ({ ...a, id: uid() }))])
    newDrawings.splice(index + 1, 0, drawings[index] ?? null)
    newDetails.splice(index + 1, 0, { ...(pagesDetails[index] || { rotation: 0 }) })
    set({ annotations: newAnnotations, drawings: newDrawings, pagesDetails: newDetails })
  },

  splitPageAt: (index) => {
    const { annotations, drawings, pagesDetails } = get()
    const newAnnotations = [...annotations]
    const newDrawings = [...drawings]
    const newDetails = [...pagesDetails]
    newAnnotations.splice(index + 1, 0, [])
    newDrawings.splice(index + 1, 0, null)
    newDetails.splice(index + 1, 0, { rotation: 0 })
    set({ annotations: newAnnotations, drawings: newDrawings, pagesDetails: newDetails })
  },

  rotatePage: (pageIndex, delta) => {
    const pagesDetails = get().pagesDetails.map((d, i) =>
      i === pageIndex ? { rotation: (d.rotation + delta) % 360 } : d
    )
    set({ pagesDetails })
  },
}))
