// File system service - abstracts browser File API
// Future: add Tauri-specific file operations here using platform detection
import { isTauri } from '../utils/platform'

export async function openPdfFile(): Promise<{ buffer: ArrayBuffer; name: string } | null> {
  if (isTauri()) {
    // TODO: Tauri native file dialog (Phase 8)
    // const { open } = await import('@tauri-apps/plugin-dialog')
    // const path = await open({ filters: [{ name: 'PDF', extensions: ['pdf'] }] })
    // if (!path) return null
    // const { readFile } = await import('@tauri-apps/plugin-fs')
    // const bytes = await readFile(path as string)
    // return { buffer: bytes.buffer, name: (path as string).split('/').pop() ?? 'document.pdf' }
    return browserOpenPdf()
  }
  return browserOpenPdf()
}

function browserOpenPdf(): Promise<{ buffer: ArrayBuffer; name: string } | null> {
  return new Promise(resolve => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.pdf,application/pdf'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) { resolve(null); return }
      const buffer = await file.arrayBuffer()
      resolve({ buffer, name: file.name })
    }
    input.oncancel = () => resolve(null)
    input.click()
  })
}

export async function savePdfBytes(bytes: Uint8Array, filename: string = 'vibe-edited.pdf'): Promise<void> {
  if (isTauri()) {
    // TODO: Tauri native save dialog (Phase 8)
    return browserSavePdf(bytes, filename)
  }
  return browserSavePdf(bytes, filename)
}

function browserSavePdf(bytes: Uint8Array, filename: string): void {
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
