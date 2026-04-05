import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Store, MenuProduct, MenuProductSize, MenuAddon, CartItem } from "@/types/store";
import { StoreHeader } from "@/components/menu/StoreHeader";
import { HeroBanner } from "@/components/menu/HeroBanner";
import { CategoryNav } from "@/components/menu/CategoryNav";
import { ProductGrid } from "@/components/menu/ProductGrid";
import { CartBar } from "@/components/menu/CartBar";
import { WhatsAppButton } from "@/components/menu/WhatsAppButton";
import { ClosedOverlay } from "@/components/menu/ClosedOverlay";
import { ProductModal } from "@/components/menu/ProductModal";
import { ScrollToTopButton } from "@/components/menu/ScrollToTopButton";
import { StoreFooter } from "@/components/menu/StoreFooter";
import { useState, useCallback, useMemo, useEffect } from "react";
import { toast } from "sonner";

function hexToHsl(hex: string): string {
  let r = 0, g = 0, b = 0;
  hex = hex.replace("#", "");
  if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  r = parseInt(hex.substring(0, 2), 16) / 255;
  g = parseInt(hex.substring(2, 4), 16) / 255;
  b = parseInt(hex.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

const CART_KEY = (slug: string) => `cart_${slug}`;

const StoreMenu = () => {
  const { slug } = useParams<{ slug: string }>();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<MenuProduct | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!slug) return;
    try {
      const saved = localStorage.getItem(CART_KEY(slug));
      if (saved) setCart(JSON.parse(saved));
    } catch {}
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    localStorage.setItem(CART_KEY(slug), JSON.stringify(cart));
  }, [cart, slug]);

  const { data: store, isLoading: storeLoading } = useQuery({
    queryKey: ["store", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("stores").select("*").eq("slug", slug).single();
      if (error) throw error;
      return data as Store;
    },
    enabled: !!slug,
  });

  useEffect(() => {
    if (!store) return;
    const root = document.documentElement;
    root.style.setProperty("--primary", hexToHsl(store.color_primary));
    root.style.setProperty("--background", hexToHsl(store.color_background));
    root.style.setProperty("--foreground", hexToHsl(store.color_text));
    root.style.setProperty("--card", hexToHsl(store.color_background));
    root.style.setProperty("--secondary", hexToHsl(store.color_secondary));
    root.style.setProperty("--sidebar", hexToHsl(store.color_secondary));
    root.style.setProperty("--sidebar-accent", hexToHsl(store.color_primary));
    const primaryL = parseInt(hexToHsl(store.color_primary).split(" ")[2]);
    root.style.setProperty("--primary-foreground", primaryL > 50 ? "0 0% 5%" : "0 0% 98%");
    const bgL = parseInt(hexToHsl(store.color_background).split(" ")[2]);
    const textHue = hexToHsl(store.color_text).split(" ")[0];
    root.style.setProperty("--border", bgL < 30 ? `${textHue} 10% 20%` : `${textHue} 10% 85%`);
    root.style.setProperty("--muted-foreground", bgL < 30 ? `${textHue} 10% 55%` : `${textHue} 10% 45%`);
    root.style.setProperty("--muted", bgL < 30 ? `${textHue} 10% 18%` : `${textHue} 10% 96%`);
    root.style.setProperty("--sidebar-foreground", hexToHsl(store.color_text));
    root.style.setProperty("--sidebar-border", bgL < 30 ? `${textHue} 10% 20%` : `${textHue} 10% 85%`);
    return () => {
      ["--primary","--background","--foreground","--card","--secondary","--sidebar","--sidebar-accent","--primary-foreground","--border","--muted-foreground","--muted","--sidebar-foreground","--sidebar-border"].forEach(p => root.style.removeProperty(p));
    };
  }, [store]);

  const { data: categories = [] } = useQuery({
    queryKey: ["menu-categories", store?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").eq("store_id", store!.id).eq("is_active", true).order("sort_order");
      if (error) throw error;
      return data;
    },
    enabled: !!store?.id,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["menu-products", store?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("store_id", store!.id).eq("is_active", true).order("sort_order");
      if (error) throw error;
      return data;
    },
    enabled: !!store?.id,
  });

  const { data: variations = [] } = useQuery({
    queryKey: ["menu-variations", store?.id],
    queryFn: async () => {
      const productIds = products.map(p => p.id);
      if (productIds.length === 0) return [];
      const { data, error } = await supabase.from("product_variations").select("*").in("product_id", productIds).eq("is_active", true).order("sort_order");
      if (error) throw error;
      return data;
    },
    enabled: products.length > 0,
  });

  const { data: categoryAddons = [] } = useQuery({
    queryKey: ["menu-addons", store?.id],
    queryFn: async () => {
      const catIds = categories.map(c => c.id);
      if (catIds.length === 0) return [];
      const { data, error } = await supabase.from("category_addons").select("*").in("category_id", catIds).eq("is_active", true).order("sort_order");
      if (error) throw error;
      return data;
    },
    enabled: categories.length > 0,
  });

  const menuProducts: MenuProduct[] = useMemo(() => {
    const categoryMap = new Map(categories.map(c => [c.id, c.name]));
    return products.map(p => {
      const productVariations = variations.filter(v => v.product_id === p.id);
      const sizes: MenuProductSize[] = productVariations.length > 0
        ? productVariations.map(v => ({ id: v.id, name: v.name, price: Number(v.price) }))
        : [{ id: p.id, name: "Único", price: Number(p.price) }];

      return {
        id: p.id,
        name: p.name,
        description: p.description,
        image_url: p.image_url,
        category_id: p.category_id,
        category_name: categoryMap.get(p.category_id) || "",
        sizes,
      };
    });
  }, [products, categories, variations]);

  const getAddonsForProduct = useCallback((product: MenuProduct): MenuAddon[] => {
    return categoryAddons
      .filter(a => a.category_id === product.category_id)
      .map(a => ({ id: a.id, name: a.name, price: Number(a.price) }));
  }, [categoryAddons]);

  const activeCategories = useMemo(() => {
    const catIds = new Set(menuProducts.map(p => p.category_id));
    return categories.filter(c => catIds.has(c.id));
  }, [categories, menuProducts]);

  const handleAddToCart = useCallback((product: MenuProduct, size: MenuProductSize, addons: MenuAddon[], quantity: number, notes?: string) => {
    setCart(prev => {
      const existing = prev.find(
        item => item.product.id === product.id && item.selectedSize.id === size.id &&
          item.addons.map(a => a.id).sort().join(",") === addons.map(a => a.id).sort().join(",")
      );
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id && item.selectedSize.id === size.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, selectedSize: size, addons, quantity, notes }];
    });
    setSelectedProduct(null);
  }, []);

  const cartTotal = cart.reduce(
    (sum, item) => sum + (Number(item.selectedSize.price) + item.addons.reduce((a, addon) => a + Number(addon.price), 0)) * item.quantity, 0
  );
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Filter by category AND search query
  const filteredProducts = useMemo(() => {
    let filtered = menuProducts;
    if (activeCategory) {
      filtered = filtered.filter(p => p.category_id === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        p.category_name.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [menuProducts, activeCategory, searchQuery]);

  const categoryName = activeCategory
    ? activeCategories.find(c => c.id === activeCategory)?.name
    : searchQuery ? `Resultados para "${searchQuery}"` : "Cardápio Completo";

  if (storeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground font-display italic">Carregando cardápio...</div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-foreground">Restaurante não encontrado</h1>
          <p className="mt-2 text-muted-foreground">Verifique o link e tente novamente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {(!store.is_open || store.maintenance_mode) && <ClosedOverlay message={store.closed_message} />}

      <StoreHeader
        store={store}
        cartCount={cartCount}
        categories={activeCategories.map(c => ({ ...c, store_id: store.id, updated_at: c.created_at, image_url: c.image_url }))}
        activeCategory={activeCategory}
        onCategorySelect={setActiveCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <HeroBanner store={store} />

      <CategoryNav
        categories={activeCategories.map(c => ({ ...c, store_id: store.id, updated_at: c.created_at, image_url: c.image_url }))}
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
      />

      <main className="container flex-1 pb-32 my-2">
        <h2 className="text-2xl font-display font-semibold mb-6 text-center text-foreground">
          {categoryName}
        </h2>

        {filteredProducts.length === 0 ? (
          <p className="text-center py-12 text-muted-foreground">
            {searchQuery ? "Nenhum produto encontrado para esta busca" : "Nenhum produto cadastrado nesta categoria"}
          </p>
        ) : (
          <ProductGrid
            products={filteredProducts}
            onSelectProduct={setSelectedProduct}
          />
        )}
      </main>

      <StoreFooter store={store} />

      <CartBar itemCount={cartCount} total={cartTotal} slug={store.slug} />
      <ScrollToTopButton />
      {store.whatsapp && <WhatsAppButton phone={store.whatsapp} />}

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          addons={getAddonsForProduct(selectedProduct)}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  );
};

export default StoreMenu;
