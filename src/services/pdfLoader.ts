// PDF loading and security scanning service
// Uses pdfjs-dist to load and scan the PDF for security issues
// Uses pdf-lib to load for editing
import * as pdfjsLib from 'pdfjs-dist'
import { PDFDocument } from 'pdf-lib'
import type { FormField } from '../stores/types'

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `${import.meta.env.BASE_URL}pdf.worker.min.mjs`

export interface SecurityScanResult {
  hasXfa: boolean
  hasScript: boolean
  hasRichMedia: boolean
  messages: string[]
}

export async function scanPdfSecurity(arrayBuffer: ArrayBuffer): Promise<SecurityScanResult> {
  const pdfjsDoc = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise
  const result: SecurityScanResult = { hasXfa: false, hasScript: false, hasRichMedia: false, messages: [] }

  for (let i = 1; i <= pdfjsDoc.numPages; i++) {
    const page = await pdfjsDoc.getPage(i)
    const annos = await page.getAnnotations()
    for (const anno of annos) {
      if (anno.subtype === 'Widget' && 'xfa' in anno) {
        result.hasXfa = true
        result.messages.push('偵測到 XFA 動態表單 (非標準)')
      }
      if (anno.subtype === 'RichMedia') {
        result.hasRichMedia = true
        result.messages.push('偵測到嵌入式多媒體 (非標準)')
      }
      if (anno.subtype === 'JavaScript') {
        result.hasScript = true
        result.messages.push('偵測到嵌入式腳本 (非標準)')
      }
    }
  }

  await pdfjsDoc.destroy()
  return result
}

export async function loadPdfLib(arrayBuffer: ArrayBuffer): Promise<PDFDocument> {
  return PDFDocument.load(arrayBuffer)
}

export async function loadPdfJs(arrayBuffer: ArrayBuffer) {
  return pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise
}

export async function detectFormFields(pdfjsDoc: import('pdfjs-dist').PDFDocumentProxy): Promise<FormField[]> {
  const fields: FormField[] = []
  for (let i = 1; i <= pdfjsDoc.numPages; i++) {
    const page = await pdfjsDoc.getPage(i)
    const annotations = await page.getAnnotations()
    for (const anno of annotations) {
      if (anno.subtype === 'Widget' && anno.fieldName) {
        fields.push({
          page: i,
          name: anno.fieldName as string,
          type: anno.fieldType === 'Sig' ? 'signature' : 'text',
          rect: anno.rect as [number, number, number, number],
          value: (anno.fieldValue as string) || '',
        })
      }
    }
  }
  return fields
}
