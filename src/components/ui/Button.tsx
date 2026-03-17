import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-indigo-600 hover:bg-indigo-500 text-white border border-transparent',
  secondary: 'bg-transparent hover:bg-white/10 text-vibe-text border border-vibe-border',
  danger: 'bg-red-600 hover:bg-red-500 text-white border border-transparent',
  ghost: 'bg-transparent hover:bg-white/5 text-gray-400 hover:text-white border border-transparent',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-5 py-2.5 text-base rounded-xl',
}

export function Button({ variant = 'secondary', size = 'md', className = '', children, ...props }: Props) {
  return (
    <button
      className={`
        font-medium transition-all duration-200 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}
