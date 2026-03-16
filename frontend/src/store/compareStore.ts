import { create } from 'zustand';

interface CompareState {
  selectedEventIds: number[];
  toggleEvent: (id: number) => void;
  clearSelection: () => void;
}

export const useCompareStore = create<CompareState>((set) => ({
  selectedEventIds: [],
  toggleEvent: (id) =>
    set((state) => {
      if (state.selectedEventIds.includes(id)) {
        return { selectedEventIds: state.selectedEventIds.filter((eventId) => eventId !== id) };
      }
      if (state.selectedEventIds.length >= 5) {
        return state; // max 5 elements
      }
      return { selectedEventIds: [...state.selectedEventIds, id] };
    }),
  clearSelection: () => set({ selectedEventIds: [] }),
}));
