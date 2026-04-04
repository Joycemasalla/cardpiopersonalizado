import { useState, useMemo } from "react";
import type { MenuProduct, MenuProductSize, MenuAddon } from "@/types/store";
import { Plus, Minus, UtensilsCrossed, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface ProductModalProps {
  product: MenuProduct;
  addons: MenuAddon[];
  onClose: () => void;
  onAddToCart: (product: MenuProduct, size: MenuProductSize, addons: MenuAddon[], quantity: number) => void;
}

export const ProductModal = ({ product, addons, onClose, onAddToCart }: ProductModalProps) => {
  const [selectedSize, setSelectedSize] = useState<MenuProductSize | undefined>(
    product.sizes.length > 0 ? product.sizes[0] : undefined
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

  const currentPrice = useMemo(() => {
    return selectedSize ? Number(selectedSize.price) : 0;
  }, [selectedSize]);

  const addonsTotal = useMemo(() => {
    return selectedAddons.reduce((sum, a) => sum + Number(a.price), 0);
  }, [selectedAddons]);

  const finalPrice = currentPrice + addonsTotal;

  const handleAddToCart = () => {
    if (!selectedSize) return;
    onAddToCart(product, selectedSize, selectedAddons, quantity);
    toast.success(`${product.name} adicionado ao carrinho!`);
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] p-0 glass-effect border-primary/20 flex flex-col overflow-hidden">
        {/* Scrollable area */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Image */}
          <div className="relative aspect-video">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <UtensilsCrossed className="h-20 w-20 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="p-4 space-y-4">
            <DialogHeader className="p-0">
              <DialogTitle className="text-xl font-display">{product.name}</DialogTitle>
            </DialogHeader>

            {product.description && (
              <p className="text-muted-foreground text-sm">{product.description}</p>
            )}

            {/* Size variations */}
            {product.sizes.length > 1 && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">Escolha o tamanho</Label>
                <RadioGroup
                  value={selectedSize?.id}
                  onValueChange={(id) => {
                    const v = product.sizes.find((s) => s.id === id);
                    setSelectedSize(v);
                  }}
                  className="space-y-2"
                >
                  {product.sizes.map((size) => (
                    <div key={size.id} className="flex items-center">
                      <RadioGroupItem value={size.id} id={size.id} className="peer sr-only" />
                      <Label
                        htmlFor={size.id}
                        className="flex-1 flex items-center justify-between p-3 rounded-lg border border-border bg-card cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 transition-all"
                      >
                        <span className="font-medium">{size.name}</span>
                        <span className="text-primary font-bold">R$ {Number(size.price).toFixed(2).replace(".", ",")}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Addons */}
            {addons.length > 0 && (
              <Collapsible>
                <div className="border-t border-border pt-4">
                  <CollapsibleTrigger className="flex items-center justify-between w-full">
                    <Label className="text-base font-semibold cursor-pointer">Adicionais</Label>
                    <div className="flex items-center gap-2">
                      {selectedAddons.length > 0 && (
                        <span className="text-xs text-primary font-medium">
                          {selectedAddons.length} selecionado(s)
                        </span>
                      )}
                      <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3 space-y-2">
                    {addons.map((addon) => (
                      <div
                        key={addon.id}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                          selectedAddons.find((a) => a.id === addon.id)
                            ? "border-primary bg-primary/10"
                            : "border-border bg-card hover:border-primary/50"
                        }`}
                        onClick={() => toggleAddon(addon)}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={!!selectedAddons.find((a) => a.id === addon.id)}
                            onCheckedChange={() => toggleAddon(addon)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="font-medium">{addon.name}</span>
                        </div>
                        <span className="text-primary font-bold">
                          +R$ {Number(addon.price).toFixed(2).replace(".", ",")}
                        </span>
                      </div>
                    ))}
                  </CollapsibleContent>
                </div>
              </Collapsible>
            )}
          </div>
        </div>

        {/* Fixed footer — quantity + button */}
        <div className="sticky bottom-0 border-t border-border bg-background p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Quantidade</Label>
            <div className="flex items-center gap-3">
              <Button
                size="icon"
                variant="outline"
                className="h-10 w-10"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-bold text-lg">{quantity}</span>
              <Button
                size="icon"
                variant="outline"
                className="h-10 w-10"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Button
            onClick={handleAddToCart}
            size="lg"
            className="w-full text-base"
            disabled={!selectedSize}
          >
            Adicionar • R$ {(finalPrice * quantity).toFixed(2).replace(".", ",")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
