import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { orderModel } from "@/models/orderModel";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import type { OrderStatus } from "@/types/store";
import { toast } from "sonner";

export function useOrderController(storeId: string | null, enabled: boolean) {
  const queryClient = useQueryClient();

  const { data: orders = [] } = useQuery({
    queryKey: ["store-orders", storeId],
    queryFn: () => orderModel.fetchByStore(storeId!),
    enabled: !!storeId && enabled,
    refetchInterval: 15000,
  });

  useEffect(() => {
    if (!storeId || !enabled) return;
    return orderModel.subscribe(storeId, () => {
      queryClient.invalidateQueries({ queryKey: ["store-orders", storeId] });
    });
  }, [storeId, enabled, queryClient]);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await orderModel.updateStatus(orderId, status);
      toast.success(`Pedido atualizado para ${ORDER_STATUS_LABELS[status]}`);
      queryClient.invalidateQueries({ queryKey: ["store-orders", storeId] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return { orders, updateStatus };
}
