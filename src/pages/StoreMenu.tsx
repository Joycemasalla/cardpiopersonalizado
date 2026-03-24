import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Store, Category, Product } from "@/types/store";
import { StoreHeader } from "@/components/menu/StoreHeader";
import { CategoryNav } from "@/components/menu/CategoryNav";
import { ProductGrid } from "@/components/menu/ProductGrid";
import { WhatsAppButton } from "@/components/menu/WhatsAppButton";
import { ClosedOverlay } from "@/components/menu/ClosedOverlay";
import { useState } from "react";

const StoreMenu = () => {
  const { slug } = useParams<{ slug: string }>();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

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

  if (storeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Carregando cardápio...</div>
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

  const storeStyles = {
    "--store-primary": store.color_primary,
    "--store-secondary": store.color_secondary,
    "--store-bg": store.color_background,
    "--store-text": store.color_text,
  } as React.CSSProperties;

  const filteredProducts = activeCategory
    ? products.filter((p) => p.category_id === activeCategory)
    : products;

  return (
    <div className="min-h-screen" style={{ ...storeStyles, backgroundColor: store.color_background, color: store.color_text }}>
      {(!store.is_open || store.maintenance_mode) && (
        <ClosedOverlay message={store.closed_message} />
      )}
      <StoreHeader store={store} />
      {categories.length > 0 && (
        <CategoryNav
          categories={categories}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
          primaryColor={store.color_primary}
        />
      )}
      <main className="container max-w-5xl py-6 px-4">
        <ProductGrid products={filteredProducts} primaryColor={store.color_primary} />
      </main>
      {store.whatsapp && <WhatsAppButton phone={store.whatsapp} />}
    </div>
  );
};

export default StoreMenu;
