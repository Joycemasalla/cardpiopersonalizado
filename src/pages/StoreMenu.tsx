import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Store, MasterCategory, MasterProduct, MasterProductSize, MenuProduct, MenuProductSize, MenuAddon, CartItem, TenantProduct, TenantProductSize, TenantAddon, MasterAddon } from "@/types/store";
import { StoreHeader } from "@/components/menu/StoreHeader";
import { CategorySidebar } from "@/components/menu/CategorySidebar";
import { CategoryNav } from "@/components/menu/CategoryNav";
import { ProductGrid } from "@/components/menu/ProductGrid";
import { CartBar } from "@/components/menu/CartBar";
import { WhatsAppButton } from "@/components/menu/WhatsAppButton";
import { ClosedOverlay } from "@/components/menu/ClosedOverlay";
import { ProductModal } from "@/components/menu/ProductModal";
import { useState, useCallback, useMemo, useEffect } from "react";
import { toast } from "sonner";

function hexToHsl(hex: string): string {
  let r = 0, g = 0, b = 0;
  hex = hex.replace("#", "");
  if (hex.length === 3) { hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2]; }
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

const StoreMenu = () => {
  const { slug } = useParams<{ slug: string }>();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<MenuProduct | null>(null);

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

  // Fetch master catalog
  const { data: masterCategories = [] } = useQuery({
    queryKey: ["master-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("master_categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data as MasterCategory[];
    },
    enabled: !!store?.id,
  });

  const { data: masterProducts = [] } = useQuery({
    queryKey: ["master-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("master_products")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data as MasterProduct[];
    },
    enabled: !!store?.id,
  });

  const { data: masterSizes = [] } = useQuery({
    queryKey: ["master-sizes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("master_product_sizes")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data as MasterProductSize[];
    },
    enabled: !!store?.id,
  });

  const { data: masterAddons = [] } = useQuery({
    queryKey: ["master-addons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("master_addons")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data as MasterAddon[];
    },
    enabled: !!store?.id,
  });

  // Fetch tenant config
  const { data: tenantProducts = [] } = useQuery({
    queryKey: ["tenant-products", store?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenant_products")
        .select("*")
        .eq("store_id", store!.id)
        .eq("is_enabled", true);
      if (error) throw error;
      return data as TenantProduct[];
    },
    enabled: !!store?.id,
  });

  const { data: tenantSizes = [] } = useQuery({
    queryKey: ["tenant-sizes", store?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenant_product_sizes")
        .select("*")
        .eq("store_id", store!.id)
        .eq("is_enabled", true);
      if (error) throw error;
      return data as TenantProductSize[];
    },
    enabled: !!store?.id,
  });

  const { data: tenantAddons = [] } = useQuery({
    queryKey: ["tenant-addons", store?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenant_addons")
        .select("*")
        .eq("store_id", store!.id)
        .eq("is_enabled", true);
      if (error) throw error;
      return data as TenantAddon[];
    },
    enabled: !!store?.id,
  });

  // Build menu products from master + tenant config
  const menuProducts: MenuProduct[] = useMemo(() => {
    const enabledProductIds = new Set(tenantProducts.map((tp) => tp.master_product_id));
    const tenantSizeMap = new Map(tenantSizes.map((ts) => [ts.master_size_id, ts]));
    const tenantProductMap = new Map(tenantProducts.map((tp) => [tp.master_product_id, tp]));
    const categoryMap = new Map(masterCategories.map((c) => [c.id, c.name]));

    return masterProducts
      .filter((mp) => enabledProductIds.has(mp.id))
      .map((mp) => {
        const productSizes = masterSizes
          .filter((ms) => ms.product_id === mp.id)
          .map((ms) => {
            const tenantSize = tenantSizeMap.get(ms.id);
            return {
              id: ms.id,
              name: ms.name,
              price: tenantSize ? Number(tenantSize.price) : Number(ms.default_price),
            } as MenuProductSize;
          })
          .filter((s) => {
            const tenantSize = tenantSizeMap.get(s.id);
            return tenantSize ? tenantSize.is_enabled : true;
          });

        const tp = tenantProductMap.get(mp.id);

        return {
          id: mp.id,
          name: mp.name,
          description: mp.description,
          image_url: tp?.custom_image_url || mp.image_url,
          category_id: mp.category_id,
          category_name: categoryMap.get(mp.category_id) || "",
          sizes: productSizes,
          custom_image_url: tp?.custom_image_url || null,
        } as MenuProduct;
      });
  }, [masterProducts, masterCategories, masterSizes, tenantProducts, tenantSizes]);

  const menuAddons: MenuAddon[] = useMemo(() => {
    const tenantAddonMap = new Map(tenantAddons.map((ta) => [ta.master_addon_id, ta]));
    return masterAddons
      .filter((ma) => tenantAddonMap.has(ma.id))
      .map((ma) => {
        const ta = tenantAddonMap.get(ma.id)!;
        return { id: ma.id, name: ma.name, price: Number(ta.price) };
      });
  }, [masterAddons, tenantAddons]);

  // Categories that have products
  const activeCategories = useMemo(() => {
    const catIds = new Set(menuProducts.map((p) => p.category_id));
    return masterCategories.filter((c) => catIds.has(c.id));
  }, [masterCategories, menuProducts]);

  const handleAddToCart = useCallback((product: MenuProduct, size: MenuProductSize, addons: MenuAddon[], quantity: number) => {
    setCart((prev) => {
      const key = `${product.id}-${size.id}-${addons.map((a) => a.id).sort().join(",")}`;
      const existing = prev.find(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize.id === size.id &&
          item.addons.map((a) => a.id).sort().join(",") === addons.map((a) => a.id).sort().join(",")
      );
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id && item.selectedSize.id === size.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, selectedSize: size, addons, quantity }];
    });
    toast.success(`${product.name} adicionado ao carrinho`);
    setSelectedProduct(null);
  }, []);

  const cartTotal = cart.reduce(
    (sum, item) =>
      sum +
      (Number(item.selectedSize.price) + item.addons.reduce((a, addon) => a + Number(addon.price), 0)) *
        item.quantity,
    0
  );
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const filteredProducts = activeCategory
    ? menuProducts.filter((p) => p.category_id === activeCategory)
    : menuProducts;

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      {(!store.is_open || store.maintenance_mode) && (
        <ClosedOverlay message={store.closed_message} />
      )}

      <StoreHeader store={store} cartCount={cartCount} />

      <CategoryNav
        categories={activeCategories.map((c) => ({ ...c, store_id: store.id, updated_at: c.created_at, image_url: null }))}
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
      />

      <div className="flex min-h-[calc(100vh-3.5rem)]">
        <CategorySidebar
          categories={activeCategories.map((c) => ({ ...c, store_id: store.id, updated_at: c.created_at, image_url: null }))}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
        />

        <main className="flex-1 p-4 lg:p-8 pb-32">
          <ProductGrid
            products={filteredProducts}
            categoryName={
              activeCategory
                ? activeCategories.find((c) => c.id === activeCategory)?.name
                : "Todos os Itens"
            }
            onSelectProduct={setSelectedProduct}
          />
        </main>
      </div>

      <CartBar itemCount={cartCount} total={cartTotal} slug={store.slug} />

      {store.whatsapp && <WhatsAppButton phone={store.whatsapp} />}

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          addons={menuAddons}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  );
};

export default StoreMenu;
