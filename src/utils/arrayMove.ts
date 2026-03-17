export function arrayMove<T>(arr: T[], from: number, to: number): T[] {
  const result = [...arr]
  const [item] = result.splice(from, 1)
  result.splice(to, 0, item)
  return result
}

export function computeNewIndex(fromIndex: number, toIndex: number, total: number): number {
  if (toIndex < 0) return 0
  if (toIndex >= total) return total - 1
  return toIndex
}
