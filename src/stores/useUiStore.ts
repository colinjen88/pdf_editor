import { create } from 'zustand'
import type { UiStore, ThemeColor, Language, ToastType, ModalName, ToastMessage } from './types'

function uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return Math.random().toString(36).slice(2)
}

export const useUiStore = create<UiStore>((set, get) => ({
  darkMode: true,
  themeColor: 'indigo',
  lang: (localStorage.getItem('vibe-lang') as Language) ?? 'zh-TW',
  mobileSidebarOpen: false,
  compressModalOpen: false,
  batchModalOpen: false,
  convertModalOpen: false,
  settingsModalOpen: false,
  toasts: [],
  loading: false,
  loadingMessage: '',

  setDarkMode: (dark) => {
    if (dark) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
    set({ darkMode: dark })
  },

  setThemeColor: (themeColor: ThemeColor) => {
    const colors: Record<ThemeColor, string> = {
      indigo: '#0F1117',
      emerald: '#0F1117',
      rose: '#1E212B',
      amber: '#1E212B',
    }
    document.body.style.backgroundColor = colors[themeColor]
    set({ themeColor })
  },

  setLang: (lang: Language) => {
    localStorage.setItem('vibe-lang', lang)
    set({ lang })
  },

  toggleMobileSidebar: () => set(s => ({ mobileSidebarOpen: !s.mobileSidebarOpen })),

  openModal: (name: ModalName) => set({ [`${name}ModalOpen`]: true } as Partial<UiStore>),
  closeModal: (name: ModalName) => set({ [`${name}ModalOpen`]: false } as Partial<UiStore>),

  showToast: (message: string, type: ToastType = 'info', duration = 2200) => {
    const toast: ToastMessage = { id: uid(), message, type, duration }
    set(s => ({ toasts: [...s.toasts, toast] }))
    setTimeout(() => {
      get().removeToast(toast.id)
    }, duration + 300)
  },

  removeToast: (id: string) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),

  showLoading: (message = '處理中...') => set({ loading: true, loadingMessage: message }),
  hideLoading: () => set({ loading: false, loadingMessage: '' }),
}))
