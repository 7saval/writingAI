import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

function UpdateBanner() {
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    if (!window.electron) return;

    window.electron.onUpdateDownloaded(() => {
      setUpdateReady(true);
    });
  }, []);

  if (!updateReady || !window.electron) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground">
      <span className="text-sm">
        새 버전이 준비되었습니다. 재시작하면 업데이트가 적용됩니다.
      </span>
      <Button
        variant="secondary"
        size="sm"
        className="gap-2 shrink-0"
        onClick={() => window.electron!.restartToUpdate()}
      >
        <RefreshCw className="h-4 w-4" />
        지금 재시작
      </Button>
    </div>
  );
}

export default UpdateBanner;
