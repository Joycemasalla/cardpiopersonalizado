import { getProductBadge } from "@/lib/productBadges";

interface ProductBadgeProps {
  badge?: string | null;
  className?: string;
}

export const ProductBadge = ({ badge, className = "" }: ProductBadgeProps) => {
  const def = getProductBadge(badge);
  if (!def) return null;
  const Icon = def.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-primary/90 text-primary-foreground text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 shadow-sm backdrop-blur-sm ${className}`}
    >
      <Icon className="h-3 w-3" />
      {def.label}
    </span>
  );
};