// PDF compression service (lossless and raster)
import { PDFDocument } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'
import { buildEditedPdfBytes } from './pdfExporter'
import type { Annotation } from '../stores/types'

pdfjsLib.GlobalWorkerOptions.workerSrc = `${import.meta.env.BASE_URL}pdf.worker.min.mjs`

export interface CompressOptions {
  mode: 'lossless' | 'raster'
  scale: number    // 0.5 - 1.0 for raster
  quality: number  // 0.5 - 0.95 for raster JPEG
}

export async function compressPdf(
  pdfDoc: PDFDocument,
  annotations: Annotation[][],
  drawings: (string | null)[],
  renderScale: number,
  options: CompressOptions
): Promise<Uint8Array> {
  const editedBytes = await buildEditedPdfBytes(pdfDoc, annotations, drawings, renderScale)

  if (options.mode === 'lossless') {
    const doc = await PDFDocument.load(editedBytes)
    return doc.save({ useObjectStreams: true })
  }

  // Raster mode
  const pdfJsDoc = await pdfjsLib.getDocument({ data: editedBytes.slice(0) }).promise
  const compressedDoc = await PDFDocument.create()

  for (let i = 1; i <= pdfJsDoc.numPages; i++) {
    const page = await pdfJsDoc.getPage(i)
    const viewport = page.getViewport({ scale: options.scale })
    const canvas = document.createElement('canvas')
    canvas.width = Math.floor(viewport.width)
    canvas.height = Math.floor(viewport.height)
    const context = canvas.getContext('2d')!
    await page.render({ canvasContext: context as CanvasRenderingContext2D, viewport }).promise
    const jpegDataUrl = canvas.toDataURL('image/jpeg', options.quality)
    const base64 = jpegDataUrl.split(',')[1]
    const binary = atob(base64)
    const jpegBytes = new Uint8Array(binary.length)
    for (let j = 0; j < binary.length; j++) jpegBytes[j] = binary.charCodeAt(j)
    const jpegImage = await compressedDoc.embedJpg(jpegBytes)
    const newPage = compressedDoc.addPage([viewport.width, viewport.height])
    newPage.drawImage(jpegImage, { x: 0, y: 0, width: viewport.width, height: viewport.height })
  }

  return compressedDoc.save({ useObjectStreams: true })
}
