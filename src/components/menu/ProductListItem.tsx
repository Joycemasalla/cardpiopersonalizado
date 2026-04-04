import type { MenuProduct } from "@/types/store";
import { Plus, UtensilsCrossed } from "lucide-react";

interface ProductListItemProps {
  product: MenuProduct;
  onClick: () => void;
}

export const ProductListItem = ({ product, onClick }: ProductListItemProps) => {
  const minPrice = product.sizes.length > 0
    ? Math.min(...product.sizes.map(s => Number(s.price)))
    : 0;
  const showFromPrice = product.sizes.length > 1;

  return (
    <div className="w-full bg-card border border-border rounded-lg p-3 flex gap-3 text-left transition-all active:scale-[0.98]">
      {/* Image + Info — clickable to open details */}
      <button onClick={onClick} className="flex gap-3 flex-1 min-w-0 text-left">
        <div className="relative overflow-hidden rounded-lg flex-shrink-0">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-20 h-20 object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
              <UtensilsCrossed className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-foreground line-clamp-1">
            {product.name}
          </h3>

          {product.description && (
            <p className="text-muted-foreground text-sm mt-0.5 line-clamp-2">
              {product.description}
            </p>
          )}

          <div className="mt-2 flex items-center gap-2">
            {showFromPrice && (
              <span className="text-muted-foreground text-xs">a partir de</span>
            )}
            <span className="text-primary font-bold">
              R$ {minPrice.toFixed(2).replace(".", ",")}
            </span>
          </div>
        </div>
      </button>

      {/* Quick add button */}
      <button
        onClick={onClick}
        className="flex-shrink-0 w-12 h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full flex items-center justify-center self-center transition-colors active:scale-95"
        aria-label="Ver opções"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
};
