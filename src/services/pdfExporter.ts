import { PDFDocument, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import type { Annotation } from '../stores/types'

let fallbackFontBytes: ArrayBuffer | null = null;
async function getFallbackFontBytes() {
  if (!fallbackFontBytes) {
    const res = await fetch('https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-tc@latest/400-normal.ttf')
    fallbackFontBytes = await res.arrayBuffer()
  }
  return fallbackFontBytes;
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? rgb(
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255
  ) : rgb(0,0,0);
}
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
  tempDoc.registerFontkit(fontkit)

  let fallbackFont: any = null;
  try {
    const fontBytes = await getFallbackFontBytes();
    fallbackFont = await tempDoc.embedFont(fontBytes);
  } catch (e) {
    console.warn("Failed to load fallback font", e);
  }

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
          color: hexToRgb(anno.color),
          font: fallbackFont || undefined,
        })
      } catch (e) {
        console.warn("Text embedding failed for:", anno.content, e)
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
