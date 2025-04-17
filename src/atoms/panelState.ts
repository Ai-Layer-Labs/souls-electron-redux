import { atom } from 'jotai'

// Atom for panel visibility that can be shared between components
export const isPanelOpenAtom = atom<boolean>(true) 