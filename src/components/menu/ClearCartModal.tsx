import { AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ClearCartModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function ClearCartModal({ open, onOpenChange, onConfirm }: ClearCartModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <div className="flex-1">
            <DialogTitle className="text-foreground">Limpar carrinho?</DialogTitle>
          </div>
        </DialogHeader>
        <div className="text-muted-foreground text-sm">
          Todos os itens serão removidos do carrinho. Esta ação não pode ser desfeita.
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleConfirm} className="flex-1">
            Remover Tudo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}