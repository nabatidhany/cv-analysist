import { create } from "zustand";

interface ResultState {
  result: any | null;
  setResult: (data: any) => void;
  clearResult: () => void;
}

export const useResultStore = create<ResultState>((set) => ({
  result: null,
  setResult: (data) => set({ result: data }),
  clearResult: () => set({ result: null }),
}));
