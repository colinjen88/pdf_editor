// PDF.js page rendering service
import * as pdfjsLib from 'pdfjs-dist'
import type { PDFDocumentProxy } from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

export const DEFAULT_SCALE = 1.5
export const THUMBNAIL_WIDTH = 180

export async function renderPageToCanvas(
  pdfjsDoc: PDFDocumentProxy,
  pageNum: number,
  canvas: HTMLCanvasElement,
  scale: number = DEFAULT_SCALE
): Promise<void> {
  const page = await pdfjsDoc.getPage(pageNum)
  const viewport = page.getViewport({ scale })
  canvas.width = Math.floor(viewport.width)
  canvas.height = Math.floor(viewport.height)
  const ctx = canvas.getContext('2d')!
  await page.render({ canvasContext: ctx as CanvasRenderingContext2D, viewport }).promise
}

export async function renderThumbnail(
  pdfjsDoc: PDFDocumentProxy,
  pageNum: number,
  canvas: HTMLCanvasElement
): Promise<void> {
  const page = await pdfjsDoc.getPage(pageNum)
  const baseViewport = page.getViewport({ scale: 1 })
  const thumbScale = THUMBNAIL_WIDTH / baseViewport.width
  const viewport = page.getViewport({ scale: thumbScale })
  canvas.width = Math.floor(viewport.width)
  canvas.height = Math.floor(viewport.height)
  const ctx = canvas.getContext('2d')!
  await page.render({ canvasContext: ctx as CanvasRenderingContext2D, viewport }).promise
}

export function getPageDimensions(pdfjsDoc: PDFDocumentProxy, pageNum: number, scale: number = DEFAULT_SCALE) {
  // Returns the viewport dimensions for the given page and scale
  // This is async because getPage is async
  return pdfjsDoc.getPage(pageNum).then(page => {
    const viewport = page.getViewport({ scale })
    return { width: Math.floor(viewport.width), height: Math.floor(viewport.height) }
  })
}
