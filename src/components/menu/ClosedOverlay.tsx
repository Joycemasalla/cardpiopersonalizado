import { Clock } from "lucide-react";

interface ClosedOverlayProps {
  message: string;
}

export const ClosedOverlay = ({ message }: ClosedOverlayProps) => {
  return (
    <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg p-8 max-w-sm text-center shadow-2xl">
        <Clock className="h-12 w-12 mx-auto text-primary mb-4" />
        <h2 className="text-xl font-display font-bold italic text-foreground mb-2">
          Estamos fechados
        </h2>
        <p className="text-muted-foreground text-sm">{message}</p>
      </div>
    </div>
  );
};
