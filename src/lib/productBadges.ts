import { Sparkles, Flame, Star, Tag, type LucideIcon } from "lucide-react";

export type ProductBadgeKey = "novo" | "destaque" | "mais_pedido" | "promocao";

export interface ProductBadgeDef {
  key: ProductBadgeKey;
  label: string;
  icon: LucideIcon;
}

export const PRODUCT_BADGES: Record<ProductBadgeKey, ProductBadgeDef> = {
  novo: { key: "novo", label: "Novo", icon: Sparkles },
  destaque: { key: "destaque", label: "Destaque do Chef", icon: Star },
  mais_pedido: { key: "mais_pedido", label: "Mais Pedido", icon: Flame },
  promocao: { key: "promocao", label: "Promoção", icon: Tag },
};

export const PRODUCT_BADGE_LIST = Object.values(PRODUCT_BADGES);

export function getProductBadge(key?: string | null): ProductBadgeDef | null {
  if (!key) return null;
  return PRODUCT_BADGES[key as ProductBadgeKey] ?? null;
}