import { create } from 'zustand'

interface AppState {
    searchQuery: string
    setSearchQuery: (query: string) => void
    isSearchOpen: boolean
    setSearchOpen: (open: boolean) => void
    selectedGenre: number | null
    setSelectedGenre: (genreId: number | null) => void
}

export const useStore = create<AppState>((set) => ({
    searchQuery: '',
    setSearchQuery: (query) => set({ searchQuery: query }),
    isSearchOpen: false,
    setSearchOpen: (open) => set({ isSearchOpen: open }),
    selectedGenre: null,
    setSelectedGenre: (genreId) => set({ selectedGenre: genreId }),
}))
