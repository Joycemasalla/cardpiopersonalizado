import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface CartBarProps {
  itemCount: number;
  total: number;
  slug: string;
}

export const CartBar = ({ itemCount, total, slug }: CartBarProps) => {
  if (itemCount === 0) return null;

  return (
    <Link to={`/r/${slug}/cart`}>
      <Button
        className="fixed bottom-24 right-6 z-40 flex items-center gap-3 bg-card text-foreground px-5 py-3 rounded-full shadow-2xl border border-border hover:border-primary transition-all"
      >
        <ShoppingCart className="h-5 w-5" />
        <span className="font-semibold">{itemCount}</span>
        <span className="hidden sm:inline">• R$ {total.toFixed(2).replace(".", ",")}</span>
      </Button>
    </Link>
  );
};
