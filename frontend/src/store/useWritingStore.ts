import { create } from "zustand";

export type StoryStage = "발단" | "전개" | "위기" | "절정" | "결말";

interface WritingState {
  aiDirective: string;
  currentStage: StoryStage;
  setAiDirective: (directive: string) => void;
  resetAiDirective: () => void;
  setCurrentStage: (stage: StoryStage) => void;
}

export const useWritingStore = create<WritingState>((set) => ({
  aiDirective: "",
  currentStage: "발단",
  setAiDirective: (directive) => set({ aiDirective: directive }),
  resetAiDirective: () => set({ aiDirective: "" }),
  setCurrentStage: (stage) => set({ currentStage: stage }),
}));
