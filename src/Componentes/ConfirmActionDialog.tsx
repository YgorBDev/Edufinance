import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Info } from "lucide-react";

interface ConfirmActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  infoItems?: { label: string; value: string }[];
  educationalTip?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  variant?: "default" | "destructive";
  isPending?: boolean;
}

export function ConfirmActionDialog({
  open,
  onOpenChange,
  title,
  description,
  infoItems,
  educationalTip,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  variant = "default",
  isPending,
}: ConfirmActionDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        {infoItems && infoItems.length > 0 && (
          <div className="grid grid-cols-2 gap-2 text-sm my-2">
            {infoItems.map((item, i) => (
              <div key={i} className="p-2 rounded-lg bg-muted/50">
                <p className="text-muted-foreground text-xs">{item.label}</p>
                <p className="font-medium">{item.value}</p>
              </div>
            ))}
          </div>
        )}

        {educationalTip && (
          <div className="flex gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10 text-sm">
            <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <p className="text-muted-foreground">{educationalTip}</p>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
            className={variant === "destructive" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
          >
            {isPending ? "Processando..." : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
