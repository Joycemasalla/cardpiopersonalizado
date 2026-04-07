import type { OrderStatus } from "@/types/store";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  preparing: "Preparando",
  ready: "Pronto",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  confirmed: "bg-blue-500/20 text-blue-400",
  preparing: "bg-orange-500/20 text-orange-400",
  ready: "bg-green-500/20 text-green-400",
  delivered: "bg-emerald-500/20 text-emerald-400",
  cancelled: "bg-red-500/20 text-red-400",
};

export const STATUS_FLOW: OrderStatus[] = ["pending", "confirmed", "preparing", "ready", "delivered"];

export const ORDER_TYPE_LABELS = {
  delivery: "🚚 Entrega",
  pickup: "🏪 Retirada",
  dine_in: "🍽️ Na Mesa",
} as const;

export const CART_KEY = (slug: string) => `cart_${slug}`;
