import { Clock } from "lucide-react";

interface ClosedOverlayProps {
  message: string;
}

export const ClosedOverlay = ({ message }: ClosedOverlayProps) => {
  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm text-center shadow-2xl">
        <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-display font-bold text-foreground mb-2">
          Estamos fechados
        </h2>
        <p className="text-muted-foreground text-sm">{message}</p>
      </div>
    </div>
  );
};
