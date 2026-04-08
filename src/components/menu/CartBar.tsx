import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

interface CartBarProps {
  itemCount: number;
  total: number;
  slug: string;
}

export const CartBar = ({ itemCount, total, slug }: CartBarProps) => {
  if (itemCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-background/95 backdrop-blur-md border-t border-border">
      <Link to={`/r/${slug}/cart`} className="block">
        <div className="flex items-center justify-between bg-primary text-primary-foreground px-5 py-3.5 rounded-xl shadow-lg hover:bg-primary/90 transition-all max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            <span className="bg-primary-foreground/20 rounded-full px-2 py-0.5 text-sm font-bold">{itemCount}</span>
          </div>
          <span className="font-semibold">Ver carrinho</span>
          <span className="font-bold">R$ {total.toFixed(2).replace(".", ",")}</span>
        </div>
      </Link>
    </div>
  );
};
