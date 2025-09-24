import { create } from 'zustand';

interface LoadingState {
  isLoading: boolean;
  message?: string;
  setLoading: (loading: boolean, message?: string) => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  isLoading: false,
  message: undefined,
  setLoading: (loading, message) => set({ isLoading: loading, message }),
}));

export const showLoading = (message?: string) => {
  useLoadingStore.getState().setLoading(true, message);
};

export const hideLoading = () => {
  useLoadingStore.getState().setLoading(false);
};