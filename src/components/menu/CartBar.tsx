import { ShoppingCart, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

interface CartBarProps {
  itemCount: number;
  total: number;
  slug: string;
}

export const CartBar = ({ itemCount, total, slug }: CartBarProps) => {
  if (itemCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4 lg:pl-60"
      >
        <Link
          to={`/r/${slug}/cart`}
          className="flex items-center justify-between w-full max-w-3xl mx-auto bg-primary text-primary-foreground rounded-lg px-5 py-3.5 shadow-lg hover:bg-primary/90 transition-colors"
        >
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-5 w-5" />
            <div>
              <span className="text-xs uppercase tracking-widest opacity-80">Seleção atual</span>
              <p className="text-sm font-semibold">{itemCount} {itemCount === 1 ? "item" : "itens"} selecionados</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest opacity-80">Total estimado</span>
            <span className="text-lg font-bold">R$ {total.toFixed(2).replace(".", ",")}</span>
            <ArrowRight className="h-5 w-5" />
          </div>
        </Link>
      </motion.div>
    </AnimatePresence>
  );
};
