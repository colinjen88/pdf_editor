declare global {
  interface Window {
    __TAURI__?: unknown
  }
}

export function isTauri(): boolean {
  return typeof window !== 'undefined' && window.__TAURI__ !== undefined
}

export function isWeb(): boolean {
  return !isTauri()
}
