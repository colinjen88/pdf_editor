interface Props {
  message?: string
}

export function Spinner({ message = '處理中...' }: Props) {
  return (
    <div className="pointer-events-auto fixed inset-0 flex items-center justify-center z-[102] bg-black/40">
      <div className="flex flex-col items-center gap-4 p-8 bg-vibe-surface/95 rounded-2xl shadow-lg border border-vibe-border">
        <svg
          className="animate-spin h-10 w-10 text-indigo-500"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12" cy="12" r="10"
            stroke="currentColor" strokeWidth="4" fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
        <span className="text-base font-medium text-vibe-text">{message}</span>
      </div>
    </div>
  )
}
