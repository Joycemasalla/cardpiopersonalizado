import type { Order, OrderStatus } from "@/types/store";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, STATUS_FLOW } from "@/lib/constants";
import { ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrdersTabProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<void>;
}

export const OrdersTab = ({ orders, onUpdateStatus }: OrdersTabProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-display font-semibold text-foreground italic">Pedidos</h3>
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Atualização automática</span>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-lg text-muted-foreground text-sm">
          <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-50" />
          Nenhum pedido recebido ainda.
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => {
            const items = Array.isArray(order.items) ? order.items : [];
            const nextStatus = STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1] as OrderStatus | undefined;
            return (
              <div key={order.id} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-foreground">{order.customer_name}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${ORDER_STATUS_COLORS[order.status]}`}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {new Date(order.created_at).toLocaleString("pt-BR")}
                      {order.customer_phone && ` · ${order.customer_phone}`}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {order.order_type === "delivery" ? "🚚 Entrega" : order.order_type === "pickup" ? "🏪 Retirada" : "🍽️ Na Mesa"}
                      {order.table_number && ` · Mesa ${order.table_number}`}
                      {order.address && ` · ${order.address}`}
                    </p>
                  </div>
                  <span className="text-primary font-bold text-sm">R$ {Number(order.total).toFixed(2).replace(".", ",")}</span>
                </div>

                <div className="space-y-1 mb-3">
                  {items.map((item: any, idx: number) => (
                    <div key={idx} className="text-xs text-foreground/80 flex justify-between">
                      <span>
                        {item.quantity}x {item.product?.name} ({item.selectedSize?.name})
                        {item.addons?.length > 0 && ` + ${item.addons.map((a: any) => a.name).join(", ")}`}
                      </span>
                      {item.notes && <span className="text-muted-foreground text-[10px] ml-2">📝 {item.notes}</span>}
                    </div>
                  ))}
                </div>

                {order.notes && <p className="text-[10px] text-muted-foreground mb-3">📝 {order.notes}</p>}

                <div className="flex items-center gap-2">
                  {nextStatus && order.status !== "cancelled" && (
                    <Button size="sm" className="text-[10px] h-7 bg-primary text-primary-foreground" onClick={() => onUpdateStatus(order.id, nextStatus)}>
                      → {ORDER_STATUS_LABELS[nextStatus]}
                    </Button>
                  )}
                  {order.status !== "cancelled" && order.status !== "delivered" && (
                    <Button size="sm" variant="ghost" className="text-[10px] h-7 text-destructive" onClick={() => onUpdateStatus(order.id, "cancelled")}>
                      Cancelar
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
