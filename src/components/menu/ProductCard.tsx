import type { MenuProduct } from "@/types/store";
import { Plus, UtensilsCrossed } from "lucide-react";
import { ProductBadge } from "./ProductBadge";

interface ProductCardProps {
  product: MenuProduct;
  onClick?: () => void;
}

export const ProductCard = ({ product, onClick }: ProductCardProps) => {
  const minPrice = product.sizes.length > 0
    ? Math.min(...product.sizes.map(s => Number(s.price)))
    : 0;
  const showFromPrice = product.sizes.length > 1;

  return (
    <button
      onClick={onClick}
      className="card-glow group text-left w-full relative"
    >
      {/* Glow effect overlay */}
      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-t from-primary/10 to-transparent" />

      <div className="relative aspect-[4/3] overflow-hidden">
        {product.badge && (
          <div className="absolute top-2 left-2 z-10">
            <ProductBadge badge={product.badge} />
          </div>
        )}
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <UtensilsCrossed className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-4 relative">
        <h3 className="font-display font-semibold text-base text-foreground line-clamp-1 group-hover:text-primary transition-colors duration-300">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-muted-foreground text-sm mt-1 line-clamp-2 min-h-[2.5rem]">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-4">
          <div className="flex flex-col">
            {showFromPrice && (
              <span className="text-muted-foreground text-xs">a partir de</span>
            )}
            <span className="text-primary font-bold text-lg group-hover:animate-pulse">
              R$ {minPrice.toFixed(2).replace(".", ",")}
            </span>
          </div>

          <div className="bg-primary text-primary-foreground rounded-full p-2 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/40 transition-all duration-300">
            <Plus className="h-5 w-5" />
          </div>
        </div>
      </div>
    </button>
  );
};
