import { create } from 'zustand'

interface UIState {
  isPanelOpen: boolean
  togglePanel: () => void
}

export const useUIStore = create<UIState>((set) => ({
  isPanelOpen: true, // Default to open
  togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),
}))