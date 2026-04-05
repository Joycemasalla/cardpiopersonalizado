import { useState } from "react";
import type { Store, Category } from "@/types/store";
import { ShoppingCart, Menu, X, Search } from "lucide-react";
import { Link } from "react-router-dom";

interface StoreHeaderProps {
  store: Store;
  cartCount?: number;
  categories?: Category[];
  activeCategory?: string | null;
  onCategorySelect?: (id: string | null) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const StoreHeader = ({ store, cartCount = 0, categories = [], activeCategory, onCategorySelect, searchQuery = "", onSearchChange }: StoreHeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleCategoryClick = (categoryId?: string | null) => {
    onCategorySelect?.(categoryId ?? null);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container py-3">
        <div className="flex items-center justify-between">
          <Link to={`/r/${store.slug}`} className="flex-shrink-0 flex items-center gap-3">
            {store.logo_url ? (
              <img src={store.logo_url} alt={store.name} className="h-12 md:h-14 w-auto rounded-md object-contain" />
            ) : (
              <span className="font-display text-xl font-bold italic text-primary">
                {store.name}
              </span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center overflow-x-auto scrollbar-hide">
            <button
              onClick={() => handleCategoryClick(null)}
              className={`px-3 py-2 text-xs font-medium uppercase tracking-wide whitespace-nowrap transition-colors hover:text-primary ${
                !activeCategory ? "text-primary" : "text-foreground/80"
              }`}
            >
              Todos
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`px-3 py-2 text-xs font-medium uppercase tracking-wide whitespace-nowrap transition-colors hover:text-primary ${
                  activeCategory === category.id ? "text-primary" : "text-foreground/80"
                }`}
              >
                {category.name}
              </button>
            ))}
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-2">
            <button
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="h-5 w-5 text-foreground" />
            </button>
            <Link
              to={`/r/${store.slug}/cart`}
              className="relative p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ShoppingCart className="h-5 w-5 text-foreground" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              className="p-2 hover:bg-muted rounded-lg transition-colors lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="mt-3 pb-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Buscar no cardápio..."
              className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              autoFocus
            />
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="lg:hidden mt-4 pb-4 border-t border-border pt-4">
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleCategoryClick(null)}
                className={`px-4 py-2 text-sm font-medium uppercase tracking-wide text-left transition-colors hover:text-primary ${
                  !activeCategory ? "text-primary" : "text-foreground/80"
                }`}
              >
                Todos
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`px-4 py-2 text-sm font-medium uppercase tracking-wide text-left transition-colors hover:text-primary ${
                    activeCategory === category.id ? "text-primary" : "text-foreground/80"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};
