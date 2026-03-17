// Image export service (PNG and JPG per page)
import * as pdfjsLib from 'pdfjs-dist'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { downloadBlob } from '../utils/download'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

export async function exportAsImages(
  pdfjsDoc: PDFDocumentProxy,
  format: 'png' | 'jpg',
  scale: number = 2
): Promise<void> {
  for (let i = 1; i <= pdfjsDoc.numPages; i++) {
    const page = await pdfjsDoc.getPage(i)
    const viewport = page.getViewport({ scale })
    const canvas = document.createElement('canvas')
    canvas.width = Math.floor(viewport.width)
    canvas.height = Math.floor(viewport.height)
    const context = canvas.getContext('2d')!
    await page.render({ canvasContext: context as CanvasRenderingContext2D, viewport }).promise
    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg'
    const quality = format === 'jpg' ? 0.92 : undefined
    canvas.toBlob(blob => {
      if (blob) downloadBlob(blob, `vibe-export-page${i}.${format}`)
    }, mimeType, quality)
  }
}
