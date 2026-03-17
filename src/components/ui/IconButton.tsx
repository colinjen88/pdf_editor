import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
  activeColor?: string
  children: ReactNode
}

export function IconButton({ active, activeColor = 'indigo', children, className = '', ...props }: Props) {
  const activeClass = active
    ? `bg-${activeColor}-600/20 text-${activeColor}-400 border border-${activeColor}-500/30`
    : 'text-gray-400 hover:text-white hover:bg-white/10'

  return (
    <button
      className={`
        p-2 rounded-xl transition-all duration-200 flex items-center justify-center
        disabled:opacity-50 disabled:cursor-not-allowed
        ${activeClass}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}
