import { create } from "zustand";

interface WritingState {
  aiDirective: string;
  setAiDirective: (directive: string) => void;
  resetAiDirective: () => void;
}

export const useWritingStore = create<WritingState>((set) => ({
  aiDirective: "",
  setAiDirective: (directive) => set({ aiDirective: directive }),
  resetAiDirective: () => set({ aiDirective: "" }),
}));
