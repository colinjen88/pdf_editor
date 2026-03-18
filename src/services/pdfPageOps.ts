// PDF page operations service (insert, delete, rotate, reorder, split, merge, duplicate)
import { PDFDocument, degrees } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'
import { arrayMove, computeNewIndex } from '../utils/arrayMove'
import type { Annotation, PageDetail, FormField } from '../stores/types'

pdfjsLib.GlobalWorkerOptions.workerSrc = `${import.meta.env.BASE_URL}pdf.worker.min.mjs`

// pdf-lib doesn't have movePage; implement by copying all pages in new order
async function reorderPagesInDoc(pdfDoc: PDFDocument, fromIndex: number, toIndex: number): Promise<void> {
  const pages = pdfDoc.getPages()
  const totalPages = pages.length
  // Build new order
  const order = Array.from({ length: totalPages }, (_, i) => i)
  const [item] = order.splice(fromIndex, 1)
  order.splice(toIndex, 0, item)
  // Copy pages in new order to a fresh doc, then replace the original pages
  // Since pdf-lib doesn't have movePage, we do it by remove+insert approach
  // Move fromIndex page: remove it and insert at toIndex
  const pageRef = pdfDoc.getPages()[fromIndex]
  pdfDoc.removePage(fromIndex)
  // After removal, toIndex shifts if toIndex > fromIndex
  const adjustedTo = toIndex > fromIndex ? toIndex - 1 : toIndex
  pdfDoc.insertPage(adjustedTo, pageRef)
}

export async function rebuildPdfJsDoc(pdfDoc: PDFDocument) {
  const pdfBytes = await pdfDoc.save()
  const pdfjsDoc = await pdfjsLib.getDocument({ data: pdfBytes }).promise
  return { pdfBytes, pdfjsDoc }
}

export async function insertBlankPage(
  pdfDoc: PDFDocument,
  atIndex: number, // insert after this 0-based index
  annotations: Annotation[][],
  drawings: (string | null)[]
): Promise<{ pdfDoc: PDFDocument; annotations: Annotation[][]; drawings: (string | null)[] }> {
  const currentPage = pdfDoc.getPages()[atIndex]
  const size = currentPage ? currentPage.getSize() : { width: 595.28, height: 841.89 }
  const insertIndex = atIndex + 1
  pdfDoc.insertPage(insertIndex, [size.width, size.height])
  const newAnnotations = [...annotations]
  const newDrawings = [...drawings]
  newAnnotations.splice(insertIndex, 0, [])
  newDrawings.splice(insertIndex, 0, null)
  return { pdfDoc, annotations: newAnnotations, drawings: newDrawings }
}

export async function insertImagePage(
  pdfDoc: PDFDocument,
  file: File,
  atIndex: number,
  annotations: Annotation[][],
  drawings: (string | null)[]
): Promise<{ pdfDoc: PDFDocument; annotations: Annotation[][]; drawings: (string | null)[] }> {
  const insertIndex = atIndex + 1
  const arrayBuffer = await file.arrayBuffer()
  const image = file.type === 'image/png'
    ? await pdfDoc.embedPng(arrayBuffer)
    : await pdfDoc.embedJpg(arrayBuffer)
  const page = pdfDoc.insertPage(insertIndex, [image.width, image.height])
  page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height })
  const newAnnotations = [...annotations]
  const newDrawings = [...drawings]
  newAnnotations.splice(insertIndex, 0, [])
  newDrawings.splice(insertIndex, 0, null)
  return { pdfDoc, annotations: newAnnotations, drawings: newDrawings }
}

export async function deletePageAt(
  pdfDoc: PDFDocument,
  pageIndex: number,
  annotations: Annotation[][],
  drawings: (string | null)[]
): Promise<{ pdfDoc: PDFDocument; annotations: Annotation[][]; drawings: (string | null)[]; newPageNum: number }> {
  pdfDoc.removePage(pageIndex)
  const newAnnotations = [...annotations]
  const newDrawings = [...drawings]
  newAnnotations.splice(pageIndex, 1)
  newDrawings.splice(pageIndex, 1)
  const newPageNum = Math.min(pageIndex + 1, pdfDoc.getPageCount())
  return { pdfDoc, annotations: newAnnotations, drawings: newDrawings, newPageNum }
}

export async function rotatePage(pdfDoc: PDFDocument, pageIndex: number, delta: number = 90): Promise<PDFDocument> {
  const page = pdfDoc.getPages()[pageIndex]
  const currentRotation = page.getRotation().angle
  page.setRotation(degrees(currentRotation + delta))
  return pdfDoc
}

export async function reorderPages(
  pdfDoc: PDFDocument,
  fromIndex: number,
  toIndex: number,
  currentPageIndex: number,
  annotations: Annotation[][],
  drawings: (string | null)[]
): Promise<{ pdfDoc: PDFDocument; annotations: Annotation[][]; drawings: (string | null)[]; newPageIndex: number }> {
  // pdf-lib doesn't have movePage; reorder by rebuilding the document page order
  // We'll handle actual reordering via rebuildPdfJsDoc after updating editor state
  // For now just track it (the actual PDF reorder happens in reorderPagesInDoc)
  await reorderPagesInDoc(pdfDoc, fromIndex, toIndex)
  const newAnnotations = arrayMove(annotations, fromIndex, toIndex)
  const newDrawings = arrayMove(drawings, fromIndex, toIndex)
  const newPageIndex = computeNewIndex(currentPageIndex, fromIndex, toIndex)
  // Fix computeNewIndex for this specific case
  let actualNewIndex = currentPageIndex
  if (currentPageIndex === fromIndex) actualNewIndex = toIndex
  else if (fromIndex < toIndex && currentPageIndex > fromIndex && currentPageIndex <= toIndex) actualNewIndex = currentPageIndex - 1
  else if (fromIndex > toIndex && currentPageIndex >= toIndex && currentPageIndex < fromIndex) actualNewIndex = currentPageIndex + 1
  return { pdfDoc, annotations: newAnnotations, drawings: newDrawings, newPageIndex: actualNewIndex }
}

export async function splitPage(
  pdfDoc: PDFDocument,
  pageIndex: number,
  annotations: Annotation[][],
  drawings: (string | null)[]
): Promise<{ pdfDoc: PDFDocument; annotations: Annotation[][]; drawings: (string | null)[] }> {
  const page = pdfDoc.getPages()[pageIndex]
  const { width, height } = page.getSize()
  pdfDoc.insertPage(pageIndex + 1, [width, height])
  const newAnnotations = [...annotations]
  const newDrawings = [...drawings]
  newAnnotations.splice(pageIndex + 1, 0, [])
  newDrawings.splice(pageIndex + 1, 0, null)
  return { pdfDoc, annotations: newAnnotations, drawings: newDrawings }
}

export async function duplicatePage(
  pdfDoc: PDFDocument,
  pageIndex: number,
  annotations: Annotation[][],
  drawings: (string | null)[]
): Promise<{ pdfDoc: PDFDocument; annotations: Annotation[][]; drawings: (string | null)[] }> {
  const page = pdfDoc.getPages()[pageIndex]
  const { width, height } = page.getSize()
  pdfDoc.insertPage(pageIndex + 1, [width, height])
  const newAnnotations = [...annotations]
  const newDrawings = [...drawings]
  // duplicate annotations and drawing for this page
  newAnnotations.splice(pageIndex + 1, 0, [...(annotations[pageIndex] || []).map(a => ({ ...a }))])
  newDrawings.splice(pageIndex + 1, 0, drawings[pageIndex] ?? null)
  return { pdfDoc, annotations: newAnnotations, drawings: newDrawings }
}

export async function mergeSelectedPages(
  pdfDoc: PDFDocument,
  selectedIndices: number[],
  annotations: Annotation[][],
  drawings: (string | null)[]
): Promise<{ pdfDoc: PDFDocument; annotations: Annotation[][]; drawings: (string | null)[]; baseIndex: number }> {
  if (selectedIndices.length < 2) return { pdfDoc, annotations, drawings, baseIndex: selectedIndices[0] ?? 0 }
  const sorted = [...selectedIndices].sort((a, b) => a - b)
  const baseIdx = sorted[0]
  // Remove pages in reverse order (excluding base)
  const toRemove = sorted.slice(1).reverse()
  const newAnnotations = [...annotations]
  const newDrawings = [...drawings]
  for (const idx of toRemove) {
    pdfDoc.removePage(idx)
    newAnnotations.splice(idx, 1)
    newDrawings.splice(idx, 1)
  }
  return { pdfDoc, annotations: newAnnotations, drawings: newDrawings, baseIndex: baseIdx }
}
