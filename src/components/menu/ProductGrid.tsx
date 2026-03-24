import type { Product } from "@/types/store";

interface ProductGridProps {
  products: Product[];
  primaryColor: string;
}

export const ProductGrid = ({ products, primaryColor }: ProductGridProps) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-12 opacity-60">
        <p>Nenhum produto encontrado.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="flex gap-4 p-4 rounded-xl bg-white border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
        >
          {product.image_url && (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-24 h-24 rounded-lg object-cover shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display font-semibold text-sm leading-tight">
                {product.name}
              </h3>
              {product.is_featured && (
                <span
                  className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  ★
                </span>
              )}
            </div>
            {product.description && (
              <p className="text-xs opacity-60 mt-1 line-clamp-2">{product.description}</p>
            )}
            <p className="mt-2 font-bold text-sm" style={{ color: primaryColor }}>
              R$ {Number(product.price).toFixed(2).replace(".", ",")}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
