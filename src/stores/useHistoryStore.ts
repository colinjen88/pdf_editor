import { create } from 'zustand'
import type { HistoryStore, HistorySnapshot } from './types'

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  snapshots: [],
  index: -1,
  canUndo: false,
  canRedo: false,

  push: (snapshot: HistorySnapshot) => {
    const { snapshots, index } = get()
    // Cut off redo branch
    const newSnapshots = snapshots.slice(0, index + 1)
    newSnapshots.push(snapshot)
    set({
      snapshots: newSnapshots,
      index: newSnapshots.length - 1,
      canUndo: newSnapshots.length > 1,
      canRedo: false,
    })
  },

  undo: () => {
    const { snapshots, index } = get()
    if (index <= 0) return null
    const newIndex = index - 1
    set({
      index: newIndex,
      canUndo: newIndex > 0,
      canRedo: true,
    })
    return snapshots[newIndex]
  },

  redo: () => {
    const { snapshots, index } = get()
    if (index >= snapshots.length - 1) return null
    const newIndex = index + 1
    set({
      index: newIndex,
      canUndo: true,
      canRedo: newIndex < snapshots.length - 1,
    })
    return snapshots[newIndex]
  },

  reset: () => set({ snapshots: [], index: -1, canUndo: false, canRedo: false }),
}))
