import { create } from 'zustand';

interface UiState {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
}));
