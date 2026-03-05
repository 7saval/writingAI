import { create } from "zustand";

interface DialogState {
  alertState: {
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: (() => void) | null;
  };
  confirmState: {
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: (() => void) | null;
    onCancel: (() => void) | null;
  };
  showAlert: (description: string, title?: string) => Promise<void>;
  showConfirm: (description: string, title?: string) => Promise<boolean>;
  closeAlert: () => void;
  closeConfirm: () => void;
}

export const useDialogStore = create<DialogState>((set) => ({
  alertState: { isOpen: false, title: "", description: "", onConfirm: null },
  confirmState: {
    isOpen: false,
    title: "",
    description: "",
    onConfirm: null,
    onCancel: null,
  },

  showAlert: (description, title = "") =>
    new Promise((resolve) => {
      set({
        alertState: {
          isOpen: true,
          title,
          description,
          onConfirm: () => {
            set((state) => ({
              alertState: { ...state.alertState, isOpen: false },
            }));
            resolve();
          },
        },
      });
    }),

  showConfirm: (description, title = "") =>
    new Promise((resolve) => {
      set({
        confirmState: {
          isOpen: true,
          title,
          description,
          onConfirm: () => {
            set((state) => ({
              confirmState: { ...state.confirmState, isOpen: false },
            }));
            resolve(true);
          },
          onCancel: () => {
            set((state) => ({
              confirmState: { ...state.confirmState, isOpen: false },
            }));
            resolve(false);
          },
        },
      });
    }),

  closeAlert: () =>
    set((state) => ({
      alertState: { ...state.alertState, isOpen: false, onConfirm: null },
    })),
  closeConfirm: () =>
    set((state) => ({
      confirmState: {
        ...state.confirmState,
        isOpen: false,
        onConfirm: null,
        onCancel: null,
      },
    })),
}));

export const showAlert = (description: string, title?: string) =>
  useDialogStore.getState().showAlert(description, title);
export const showConfirm = (description: string, title?: string) =>
  useDialogStore.getState().showConfirm(description, title);
