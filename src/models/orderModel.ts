import { supabase } from "@/integrations/supabase/client";
import type { Order, OrderStatus } from "@/types/store";

export const orderModel = {
  async fetchByStore(storeId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("store_id", storeId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as unknown as Order[];
  },

  async updateStatus(orderId: string, status: OrderStatus) {
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (error) throw error;
  },

  subscribe(storeId: string, onEvent: () => void) {
    const channel = supabase
      .channel(`orders-${storeId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders", filter: `store_id=eq.${storeId}` },
        onEvent
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  },
};
