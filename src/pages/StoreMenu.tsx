import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { useMenuController } from "@/controllers/useMenuController";
import { applyStoreTheme, removeStoreTheme } from "@/lib/colors";
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

const StoreMenu = () => {
  const { slug } = useParams<{ slug: string }>();
  const {
    store, storeLoading, categories, filteredProducts, selectedProduct, setSelectedProduct,
    activeCategory, setActiveCategory, searchQuery, setSearchQuery,
    cartTotal, cartCount, categoryName, handleAddToCart, getAddonsForProduct,
  } = useMenuController(slug);

  useEffect(() => {
    if (!store) return;
    applyStoreTheme(store);
    return removeStoreTheme;
  }, [store]);

  if (storeLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-pulse text-muted-foreground font-display italic">Carregando cardápio...</div></div>;
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
        categories={categories.map(c => ({ ...c, store_id: store.id, updated_at: c.created_at || c.updated_at, image_url: c.image_url }))}
        activeCategory={activeCategory}
        onCategorySelect={setActiveCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <HeroBanner store={store} />

      <CategoryNav
        categories={categories.map(c => ({ ...c, store_id: store.id, updated_at: c.created_at || c.updated_at, image_url: c.image_url }))}
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
      />

      <main className="container flex-1 pb-32 my-2">
        <h2 className="text-2xl font-display font-semibold mb-6 text-center text-foreground">{categoryName}</h2>
        {filteredProducts.length === 0 ? (
          <p className="text-center py-12 text-muted-foreground">
            {searchQuery ? "Nenhum produto encontrado para esta busca" : "Nenhum produto cadastrado nesta categoria"}
          </p>
        ) : (
          <ProductGrid products={filteredProducts} onSelectProduct={setSelectedProduct} />
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
