import { create } from 'zustand'
import { PDFDocument } from 'pdf-lib'
import { loadPdfLib, loadPdfJs, detectFormFields, scanPdfSecurity } from '../services/pdfLoader'
import { rebuildPdfJsDoc as rebuildPdfJs } from '../services/pdfPageOps'
import type { PdfStore, FormField } from './types'

export const usePdfStore = create<PdfStore>((set, get) => ({
  pdfDoc: null,
  pdfJsDoc: null,
  pdfBytes: null,
  totalPages: 0,
  formFields: [],

  loadPdf: async (buffer: ArrayBuffer) => {
    // Load for rendering
    const pdfJsDoc = await loadPdfJs(buffer)
    // Load for editing
    const pdfDoc = await loadPdfLib(buffer)
    // Detect form fields
    const formFields = await detectFormFields(pdfJsDoc)
    set({
      pdfDoc,
      pdfJsDoc,
      pdfBytes: buffer,
      totalPages: pdfJsDoc.numPages,
      formFields,
    })
  },

  rebuildPdfJsDoc: async (_targetPage?: number) => {
    const { pdfDoc } = get()
    if (!pdfDoc) return
    const { pdfBytes, pdfjsDoc } = await rebuildPdfJs(pdfDoc)
    set({
      pdfJsDoc: pdfjsDoc,
      pdfBytes: pdfBytes as Uint8Array,
      totalPages: pdfjsDoc.numPages,
    })
  },

  reset: () => set({
    pdfDoc: null,
    pdfJsDoc: null,
    pdfBytes: null,
    totalPages: 0,
    formFields: [],
  }),
}))
