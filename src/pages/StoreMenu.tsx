import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Store, Category, Product, Promotion, CartItem } from "@/types/store";
import { StoreHeader } from "@/components/menu/StoreHeader";
import { CategorySidebar } from "@/components/menu/CategorySidebar";
import { CategoryNav } from "@/components/menu/CategoryNav";
import { ProductGrid } from "@/components/menu/ProductGrid";
import { HeroBanner } from "@/components/menu/HeroBanner";
import { CartBar } from "@/components/menu/CartBar";
import { WhatsAppButton } from "@/components/menu/WhatsAppButton";
import { ClosedOverlay } from "@/components/menu/ClosedOverlay";
import { useState, useCallback } from "react";
import { toast } from "sonner";

const StoreMenu = () => {
  const { slug } = useParams<{ slug: string }>();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  const { data: store, isLoading: storeLoading } = useQuery({
    queryKey: ["store", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data as Store;
    },
    enabled: !!slug,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories", store?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("store_id", store!.id)
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data as Category[];
    },
    enabled: !!store?.id,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products", store?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("store_id", store!.id)
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!store?.id,
  });

  const { data: promotions = [] } = useQuery({
    queryKey: ["promotions", store?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promotions")
        .select("*")
        .eq("store_id", store!.id)
        .eq("is_active", true);
      if (error) throw error;
      return data as Promotion[];
    },
    enabled: !!store?.id,
  });

  const handleAddToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, addons: [], quantity: 1 }];
    });
    toast.success(`${product.name} adicionado ao carrinho`);
  }, []);

  const cartTotal = cart.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

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
          <h1 className="text-2xl font-display font-bold italic text-foreground">Restaurante não encontrado</h1>
          <p className="mt-2 text-muted-foreground">Verifique o link e tente novamente.</p>
        </div>
      </div>
    );
  }

  const filteredProducts = activeCategory
    ? products.filter((p) => p.category_id === activeCategory)
    : products;

  const featuredProduct = products.find((p) => p.is_featured);
  const activePromotion = promotions[0];
  const activeCategoryName = activeCategory
    ? categories.find((c) => c.id === activeCategory)?.name
    : "Todos os Itens";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {(!store.is_open || store.maintenance_mode) && (
        <ClosedOverlay message={store.closed_message} />
      )}

      <StoreHeader store={store} cartCount={cartCount} />

      <CategoryNav
        categories={categories}
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
      />

      <div className="flex min-h-[calc(100vh-3.5rem)]">
        <CategorySidebar
          categories={categories}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
        />

        <main className="flex-1 p-4 lg:p-8 pb-32">
          <HeroBanner
            store={store}
            featuredProduct={featuredProduct ? {
              name: featuredProduct.name,
              description: featuredProduct.description || "",
              price: featuredProduct.price,
              image_url: featuredProduct.image_url,
            } : undefined}
            promotion={activePromotion}
          />

          <ProductGrid
            products={filteredProducts}
            categoryName={activeCategoryName || undefined}
            onAddToCart={handleAddToCart}
          />
        </main>
      </div>

      <CartBar itemCount={cartCount} total={cartTotal} slug={store.slug} />

      {store.whatsapp && <WhatsAppButton phone={store.whatsapp} />}
    </div>
  );
};

export default StoreMenu;
