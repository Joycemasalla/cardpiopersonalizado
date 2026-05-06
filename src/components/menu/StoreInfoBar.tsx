import type { Store } from "@/types/store";
import { Clock, Bike } from "lucide-react";
import type { ReactNode } from "react";

interface StoreInfoBarProps {
  store: Store;
}

export const StoreInfoBar = ({ store }: StoreInfoBarProps) => {
  const isOpen = store.is_open && !store.maintenance_mode;
  const fee = Number(store.delivery_fee || 0);
  const feeLabel = fee > 0 ? `R$ ${fee.toFixed(2).replace(".", ",")}` : "Grátis";

  const items: { key: string; node: ReactNode }[] = [];

  items.push({
    key: "status",
    node: (
      <span className="inline-flex items-center gap-1.5">
        <span
          className={`relative flex h-2 w-2`}
          aria-hidden
        >
          <span
            className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isOpen ? "bg-emerald-400 animate-ping" : "bg-destructive"
            }`}
          />
          <span
            className={`relative inline-flex h-2 w-2 rounded-full ${
              isOpen ? "bg-emerald-500" : "bg-destructive"
            }`}
          />
        </span>
        <span className="font-medium">{isOpen ? "Aberto agora" : "Fechado"}</span>
      </span>
    ),
  });

  if (store.estimated_delivery_time) {
    items.push({
      key: "time",
      node: (
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-primary" />
          {store.estimated_delivery_time}
        </span>
      ),
    });
  }

  if (fee >= 0) {
    items.push({
      key: "fee",
      node: (
        <span className="inline-flex items-center gap-1.5">
          <Bike className="h-3.5 w-3.5 text-primary" />
          {feeLabel}
        </span>
      ),
    });
  }

  return (
    <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-background/60 backdrop-blur-sm border border-border/60 text-foreground/90 text-xs md:text-sm">
      {items.map((item, i) => (
        <span key={item.key} className="inline-flex items-center gap-3">
          {i > 0 && <span className="h-3 w-px bg-border/80" aria-hidden />}
          {item.node}
        </span>
      ))}
    </div>
  );
};