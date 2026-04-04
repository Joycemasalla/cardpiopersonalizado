import type { MenuProduct } from "@/types/store";
import { ProductCard } from "./ProductCard";
import { ProductListItem } from "./ProductListItem";

interface ProductGridProps {
  products: MenuProduct[];
  categoryName?: string;
  onSelectProduct?: (product: MenuProduct) => void;
}

export const ProductGrid = ({ products, categoryName, onSelectProduct }: ProductGridProps) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p>Nenhum produto cadastrado nesta categoria</p>
      </div>
    );
  }

  return (
    <div>
      {categoryName && (
        <h2 className="text-2xl font-display font-semibold mb-6 text-center text-foreground">
          {categoryName}
        </h2>
      )}

      {/* Mobile: list view */}
      <div className="space-y-3 md:hidden">
        {products.map((product) => (
          <ProductListItem
            key={product.id}
            product={product}
            onClick={() => onSelectProduct?.(product)}
          />
        ))}
      </div>

      {/* Desktop: grid view */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={() => onSelectProduct?.(product)}
          />
        ))}
      </div>
    </div>
  );
};
