import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, ArrowLeft } from "lucide-react";

interface OrderPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: string;
  onConfirm: () => void;
  estimatedTime?: string | null;
  orderType: "delivery" | "pickup" | "dine_in";
  isSending?: boolean;
}

export function OrderPreviewModal({ open, onOpenChange, message, onConfirm, estimatedTime, orderType, isSending }: OrderPreviewModalProps) {
  const info =
    orderType === "delivery"
      ? { icon: "🚚", label: "Tempo estimado de entrega:", value: estimatedTime || "40–60 minutos" }
      : orderType === "pickup"
      ? { icon: "🏪", label: "Seu pedido ficará pronto em aproximadamente:", value: estimatedTime || "15–25 minutos" }
      : { icon: "🍽️", label: "Seu pedido ficará pronto em aproximadamente:", value: estimatedTime || "15–25 minutos" };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] flex flex-col gap-4">
        <DialogHeader>
          <DialogTitle className="text-foreground">Confirme seu pedido</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">Revise a mensagem que será enviada pelo WhatsApp:</p>
        <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <span className="text-base">{info.icon}</span>
          <div className="flex-1">
            <span className="text-sm font-medium text-foreground">{info.label}</span>
            <p className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-0.5">{info.value}</p>
          </div>
        </div>
        <ScrollArea className="h-[40vh] border border-border rounded-lg bg-muted/30 p-4">
          <pre className="whitespace-pre-wrap font-sans text-sm text-foreground leading-relaxed pr-4">{message}</pre>
        </ScrollArea>
        <DialogFooter className="flex-col sm:flex-row gap-2 mt-auto">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto gap-2" disabled={isSending}>
            <ArrowLeft className="h-4 w-4" /> Voltar e Editar
          </Button>
          <Button onClick={onConfirm} className="w-full sm:w-auto gap-2" disabled={isSending}>
            <MessageCircle className="h-4 w-4" /> {isSending ? "Enviando..." : "Confirmar e Enviar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}