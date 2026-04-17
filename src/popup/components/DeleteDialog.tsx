import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";

interface DeleteDialogProps {
  open: boolean;
  pairKey: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteDialog({
  open,
  pairKey,
  onConfirm,
  onCancel,
}: DeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="animate-scale-in sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Delete pair</DialogTitle>
          <DialogDescription>
            Delete pair &ldquo;{pairKey}&rdquo;? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
