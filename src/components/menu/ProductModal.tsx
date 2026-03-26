import type { MenuProduct, MenuProductSize, MenuAddon } from "@/types/store";
import { X, Minus, Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";

interface ProductModalProps {
  product: MenuProduct;
  addons: MenuAddon[];
  onClose: () => void;
  onAddToCart: (product: MenuProduct, size: MenuProductSize, addons: MenuAddon[], quantity: number) => void;
}

export const ProductModal = ({ product, addons, onClose, onAddToCart }: ProductModalProps) => {
  const [selectedSize, setSelectedSize] = useState<MenuProductSize | null>(
    product.sizes.length > 0 ? product.sizes[0] : null
  );
  const [selectedAddons, setSelectedAddons] = useState<MenuAddon[]>([]);
  const [quantity, setQuantity] = useState(1);

  const toggleAddon = (addon: MenuAddon) => {
    setSelectedAddons((prev) =>
      prev.find((a) => a.id === addon.id)
        ? prev.filter((a) => a.id !== addon.id)
        : [...prev, addon]
    );
  };

  const sizePrice = selectedSize ? Number(selectedSize.price) : 0;
  const addonsTotal = selectedAddons.reduce((sum, a) => sum + Number(a.price), 0);
  const itemTotal = (sizePrice + addonsTotal) * quantity;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

        {/* Modal */}
        <motion.div
          className="relative bg-card border border-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
        >
          {/* Header image */}
          {product.image_url && (
            <div className="relative h-56 overflow-hidden rounded-t-xl">
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
            </div>
          )}

          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="p-6 space-y-6">
            {/* Product info */}
            <div>
              <p className="text-[10px] text-primary uppercase tracking-widest font-semibold">{product.category_name}</p>
              <h2 className="text-2xl font-display font-bold italic text-foreground mt-1">{product.name}</h2>
              {product.description && (
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{product.description}</p>
              )}
            </div>

            {/* Sizes */}
            {product.sizes.length > 0 && (
              <div>
                <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">
                  Escolha o tamanho
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size)}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                        selectedSize?.id === size.id
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border bg-secondary/50 text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      <span className="text-sm font-medium">{size.name}</span>
                      <span className="text-sm font-bold text-primary">
                        R$ {Number(size.price).toFixed(2).replace(".", ",")}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Addons */}
            {addons.length > 0 && (
              <div>
                <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">
                  Adicionais
                </h3>
                <div className="space-y-2">
                  {addons.map((addon) => {
                    const isSelected = selectedAddons.some((a) => a.id === addon.id);
                    return (
                      <button
                        key={addon.id}
                        onClick={() => toggleAddon(addon)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10"
                            : "border-border bg-secondary/50 hover:border-primary/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox checked={isSelected} className="pointer-events-none" />
                          <span className="text-sm text-foreground">{addon.name}</span>
                        </div>
                        <span className="text-sm text-primary font-medium">
                          + R$ {Number(addon.price).toFixed(2).replace(".", ",")}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Quantidade</h3>
              <div className="flex items-center gap-3 bg-secondary rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-foreground hover:text-primary transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-foreground font-bold w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 text-foreground hover:text-primary transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Add to cart */}
            <Button
              onClick={() => selectedSize && onAddToCart(product, selectedSize, selectedAddons, quantity)}
              disabled={!selectedSize}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-base font-semibold"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Adicionar — R$ {itemTotal.toFixed(2).replace(".", ",")}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
