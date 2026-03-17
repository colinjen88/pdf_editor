import { useEffect, useState } from 'react'
import { CheckCircle, Info, Warning, WarningCircle } from '@phosphor-icons/react'
import type { ToastMessage } from '../../stores/types'

interface Props {
  toast: ToastMessage
  onRemove: (id: string) => void
}

export function Toast({ toast, onRemove }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Fade in
    const t = setTimeout(() => setVisible(true), 10)
    // Fade out before removal
    const t2 = setTimeout(() => setVisible(false), toast.duration - 300)
    return () => { clearTimeout(t); clearTimeout(t2) }
  }, [toast.duration])

  const colorClass = {
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white',
    warning: 'bg-yellow-500 text-black',
    info: 'bg-vibe-surface text-vibe-text border border-vibe-border',
  }[toast.type]

  const Icon = {
    success: CheckCircle,
    error: WarningCircle,
    warning: Warning,
    info: Info,
  }[toast.type]

  return (
    <div
      onClick={() => onRemove(toast.id)}
      className={`
        pointer-events-auto fixed left-1/2 top-8 -translate-x-1/2 z-[101]
        px-6 py-3 rounded-xl shadow-lg font-medium text-base
        flex items-center gap-2 cursor-pointer select-none
        transition-all duration-300
        ${colorClass}
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
      `}
    >
      <Icon size={18} weight="fill" />
      {toast.message}
    </div>
  )
}

interface ToastContainerProps {
  toasts: ToastMessage[]
  onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null
  // Show only the latest toast
  const latest = toasts[toasts.length - 1]
  return <Toast key={latest.id} toast={latest} onRemove={onRemove} />
}
