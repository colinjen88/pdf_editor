// Word/DOCX export service (text extraction only)
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { downloadBlob } from '../utils/download'

export async function exportAsWord(pdfjsDoc: PDFDocumentProxy): Promise<void> {
  let docContent = ''
  for (let i = 1; i <= pdfjsDoc.numPages; i++) {
    const page = await pdfjsDoc.getPage(i)
    const textContent = await page.getTextContent()
    docContent += `\n第${i}頁\n`
    docContent += textContent.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
    docContent += '\n'
  }
  const blob = new Blob([docContent], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  })
  downloadBlob(blob, 'vibe-export.docx')
}
