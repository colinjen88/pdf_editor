// PDF export service (embed annotations and drawings into PDF)
import { PDFDocument, rgb } from 'pdf-lib'
import type { Annotation } from '../stores/types'

function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1]
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

export async function buildEditedPdfBytes(
  pdfDoc: PDFDocument,
  annotations: Annotation[][],
  drawings: (string | null)[],
  scale: number = 1.5
): Promise<Uint8Array> {
  const baseBytes = await pdfDoc.save()
  const tempDoc = await PDFDocument.load(baseBytes)
  const pages = tempDoc.getPages()

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i]
    const { height } = page.getSize()

    const annos = annotations[i] || []
    for (const anno of annos) {
      const pdfX = anno.x / scale
      const pdfY = height - (anno.y / scale) - 12
      try {
        page.drawText(anno.content, {
          x: pdfX,
          y: pdfY,
          size: (anno.size / scale) * 1.5,
          color: rgb(0, 0, 0),
        })
      } catch {
        // Font embedding may fail for some characters; skip silently
      }
    }

    const drawingDataUrl = drawings[i]
    if (drawingDataUrl) {
      try {
        const pngImage = await tempDoc.embedPng(dataUrlToUint8Array(drawingDataUrl))
        const { width, height: h } = page.getSize()
        page.drawImage(pngImage, { x: 0, y: 0, width, height: h })
      } catch {
        // Drawing embedding failed; skip
      }
    }
  }

  return tempDoc.save()
}

export async function exportSelectedPages(
  pdfDoc: PDFDocument,
  selectedIndices: number[]
): Promise<Uint8Array> {
  const tempDoc = await PDFDocument.create()
  const pages = await tempDoc.copyPages(pdfDoc, selectedIndices)
  pages.forEach(p => tempDoc.addPage(p))
  return tempDoc.save()
}
