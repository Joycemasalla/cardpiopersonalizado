import type { Store } from "@/types/store";
import { MapPin, ShoppingCart, User, Search } from "lucide-react";
import { Link } from "react-router-dom";

interface StoreHeaderProps {
  store: Store;
  cartCount?: number;
}

export const StoreHeader = ({ store, cartCount = 0 }: StoreHeaderProps) => {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="flex items-center justify-between h-14 px-4 lg:px-8">
        <div className="flex items-center gap-3">
          {store.logo_url ? (
            <img src={store.logo_url} alt={store.name} className="w-8 h-8 rounded-md object-cover" />
          ) : null}
          <span className="font-display text-lg font-bold italic text-primary">
            {store.name}
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <span className="text-sm text-primary font-medium border-b border-primary pb-0.5">Categorias</span>
          <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Sobre</span>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-secondary rounded-md px-3 py-1.5">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar no cardápio..."
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-40"
            />
          </div>
          <Link
            to={`/r/${store.slug}/cart`}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border hover:bg-secondary transition-colors text-sm"
          >
            <ShoppingCart className="h-4 w-4 text-primary" />
            <span className="text-primary font-medium">Carrinho ({cartCount})</span>
          </Link>
          <button className="p-2 rounded-md hover:bg-secondary transition-colors">
            <User className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </header>
  );
};
