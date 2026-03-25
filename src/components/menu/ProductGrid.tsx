import type { Product } from "@/types/store";
import type { CartItem } from "@/types/store";
import { Plus } from "lucide-react";

interface ProductGridProps {
  products: Product[];
  categoryName?: string;
  onAddToCart?: (product: Product) => void;
}

export const ProductGrid = ({ products, categoryName, onAddToCart }: ProductGridProps) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p>Nenhum produto encontrado.</p>
      </div>
    );
  }

  return (
    <div>
      {categoryName && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold italic text-foreground">{categoryName}</h2>
          <span className="text-xs text-muted-foreground uppercase tracking-widest">
            {products.length} {products.length === 1 ? "item disponível" : "itens disponíveis"}
          </span>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {products.map((product) => (
          <div
            key={product.id}
            className="group rounded-lg bg-card border border-border overflow-hidden hover:border-primary/30 transition-all duration-300 cursor-pointer"
            onClick={() => onAddToCart?.(product)}
          >
            {product.image_url ? (
              <div className="relative h-48 overflow-hidden">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {product.is_featured && (
                  <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                    Destaque
                  </span>
                )}
              </div>
            ) : (
              <div className="h-48 bg-secondary flex items-center justify-center">
                <span className="text-muted-foreground text-sm">Sem imagem</span>
                {product.is_featured && (
                  <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                    Destaque
                  </span>
                )}
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display font-semibold text-foreground text-base">
                  {product.name}
                </h3>
                <span className="text-primary font-bold text-sm shrink-0">
                  R$ {Number(product.price).toFixed(2).replace(".", ",")}
                </span>
              </div>
              {product.description && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                  {product.description}
                </p>
              )}
              <div className="flex items-center justify-between mt-4">
                <div className="flex gap-1">
                  {product.is_featured && (
                    <span className="text-[10px] uppercase tracking-wider border border-border rounded px-2 py-0.5 text-muted-foreground">
                      Popular
                    </span>
                  )}
                </div>
                <button
                  className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/80 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart?.(product);
                  }}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
