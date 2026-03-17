import type { FormField } from '../../stores/types'
import { usePdfStore } from '../../stores/usePdfStore'

interface Props {
  pageIndex: number  // 0-based
  scale: number
  canvasWidth: number
  canvasHeight: number
}

export function FormFieldLayer({ pageIndex, scale, canvasWidth, canvasHeight }: Props) {
  const { formFields, pdfJsDoc } = usePdfStore()
  const pageFields = formFields.filter(f => f.page === pageIndex + 1)

  if (!pdfJsDoc || pageFields.length === 0) return null

  // We need the original PDF page dimensions to scale the rect coordinates
  // The rect is in PDF units (points), we need to convert to canvas pixels
  // PDF page origin is bottom-left, canvas origin is top-left
  // We'll estimate based on canvasWidth / scale giving us the PDF unit width

  const pdfUnitWidth = canvasWidth / scale
  const pdfUnitHeight = canvasHeight / scale

  const updateField = (fieldId: string, value: string) => {
    const fields = usePdfStore.getState().formFields.map(f =>
      f.name === fieldId ? { ...f, value } : f
    )
    usePdfStore.setState({ formFields: fields })
  }

  return (
    <div className="absolute inset-0" style={{ zIndex: 30, pointerEvents: 'none' }}>
      {pageFields.map(field => {
        const [x1, y1, x2, y2] = field.rect
        // Convert PDF coordinates to canvas coordinates
        const left = (x1 / pdfUnitWidth) * canvasWidth
        const top = canvasHeight - (y2 / pdfUnitHeight) * canvasHeight
        const fieldWidth = ((x2 - x1) / pdfUnitWidth) * canvasWidth
        const fieldHeight = ((y2 - y1) / pdfUnitHeight) * canvasHeight

        return (
          <input
            key={field.name}
            type="text"
            value={field.value}
            onChange={e => updateField(field.name, e.target.value)}
            placeholder={field.type === 'signature' ? '簽章欄位' : field.name}
            className={`
              absolute pointer-events-auto px-2 py-1 text-sm rounded border border-vibe-border
              ${field.type === 'signature'
                ? 'bg-white text-purple-700 font-bold'
                : 'bg-white text-black'
              }
            `}
            style={{
              left, top,
              width: fieldWidth,
              height: fieldHeight,
              fontSize: Math.max(10, fieldHeight * 0.5),
            }}
          />
        )
      })}
    </div>
  )
}
