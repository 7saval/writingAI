import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useDialogStore } from "@/store/useDialogStore";

const ShowAlert = () => {
  const { alertState, closeAlert } = useDialogStore();

  return (
    <AlertDialog
      open={alertState.isOpen}
      onOpenChange={(open) => {
        if (!open) {
          alertState.onConfirm?.();
          closeAlert();
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className={!alertState.title ? "hidden" : ""}>
            {alertState.title || "알림"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base text-slate-800 pt-2 pb-1 whitespace-pre-wrap">
            {alertState.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={() => {
              alertState.onConfirm?.();
            }}
          >
            확인
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ShowAlert;
