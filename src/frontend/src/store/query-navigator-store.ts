import { create } from "zustand";

interface QueryNavigatorState {
  activeQueryIndex: number | null;
  setActiveQueryIndex: (index: number | null) => void;
}

export const useQueryNavigatorStore = create<QueryNavigatorState>((set) => ({
  activeQueryIndex: null,
  setActiveQueryIndex: (index) => set({ activeQueryIndex: index }),
}));
