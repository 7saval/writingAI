import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { useDialogStore } from "@/store/useDialogStore";

const ShowConfirm = () => {
  const { confirmState, closeConfirm } = useDialogStore();

  return (
    <AlertDialog
      open={confirmState.isOpen}
      onOpenChange={(open) => {
        if (!open) {
          // If closed without explicit confirm (e.g., escape key), treat as cancel
          confirmState.onCancel?.();
          closeConfirm();
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className={!confirmState.title ? "hidden" : ""}>
            {confirmState.title || "확인"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base text-slate-800 pt-2 pb-1 whitespace-pre-wrap">
            {confirmState.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => {
              confirmState.onCancel?.();
            }}
          >
            취소
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              confirmState.onConfirm?.();
            }}
          >
            확인
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ShowConfirm;
