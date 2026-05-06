import { useState } from "react";
import { useAuthController } from "@/controllers/useAuthController";
import { useStoreController } from "@/controllers/useStoreController";
import { useCategoryController } from "@/controllers/useCategoryController";
import { useProductController } from "@/controllers/useProductController";
import { useOrderController } from "@/controllers/useOrderController";
import { AdminLayout } from "@/views/admin/AdminLayout";
import { StoreList } from "@/views/admin/StoreList";
import { StoreForm } from "@/views/admin/StoreForm";
import { StoreConfigTab } from "@/views/admin/StoreConfigTab";
import { CategoriesTab } from "@/views/admin/CategoriesTab";
import { ProductsTab } from "@/views/admin/ProductsTab";
import { OrdersTab } from "@/views/admin/OrdersTab";
import { Button } from "@/components/ui/button";

type StoreTab = "config" | "categories" | "products" | "orders";

const AdminDashboard = () => {
  const { user, isPlatformAdmin, defaultStoreId, loading, handleSignOut } = useAuthController();
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [storeTab, setStoreTab] = useState<StoreTab>("config");
  const [storeDialogOpen, setStoreDialogOpen] = useState(false);

  // Use defaultStoreId for store_admin users
  const activeStoreId = selectedStoreId || defaultStoreId;

  const { stores, createStore, updateStore, uploadImage, toggleStoreOpen } = useStoreController(isPlatformAdmin);
  const { categories, categoryAddons, createCategory, updateCategory, deleteCategory, createAddon, deleteAddon } = useCategoryController(activeStoreId);
  const { products, variations, createProduct, updateProduct, deleteProduct, toggleProduct, uploadProductImage, createVariation, deleteVariation } = useProductController(activeStoreId);
  const { orders, updateStatus } = useOrderController(activeStoreId, storeTab === "orders");

  const selectedStore = stores.find((s) => s.id === activeStoreId);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-pulse text-muted-foreground font-display italic">Carregando...</div></div>;
  }

  const headerTitle = !activeStoreId ? "Lojas" : (selectedStore?.name || "Loja");

  return (
    <AdminLayout
      user={user}
      isPlatformAdmin={isPlatformAdmin}
      selectedStoreId={activeStoreId}
      selectedStoreName={selectedStore?.name}
      storeTab={storeTab}
      onSelectStoreTab={setStoreTab}
      onGoToStores={() => setSelectedStoreId(null)}
      onSignOut={handleSignOut}
      headerTitle={headerTitle}
    >
      {/* Store List */}
      {!activeStoreId && (
        <>
          <StoreList
            stores={stores}
            onSelectStore={(id) => { setSelectedStoreId(id); setStoreTab("config"); }}
            onOpenCreateDialog={() => setStoreDialogOpen(true)}
          />
          <StoreForm
            open={storeDialogOpen}
            onOpenChange={setStoreDialogOpen}
            onSubmit={createStore}
          />
        </>
      )}

      {/* Store Detail */}
      {activeStoreId && selectedStore && (
        <div className="space-y-6">
          {isPlatformAdmin && (
            <Button variant="ghost" size="sm" onClick={() => setSelectedStoreId(null)} className="text-muted-foreground hover:text-foreground text-xs mb-2">← Voltar às lojas</Button>
          )}

          {/* Mobile tab selector */}
          <div className="flex gap-2 lg:hidden flex-wrap">
            {(["config", "categories", "products", "orders"] as StoreTab[]).map((t) => (
              <button key={t} onClick={() => setStoreTab(t)} className={`px-3 py-1.5 rounded-md text-xs uppercase tracking-widest font-semibold transition-all ${storeTab === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                {t === "config" ? "Config" : t === "categories" ? "Categorias" : t === "products" ? "Produtos" : "Pedidos"}
              </button>
            ))}
          </div>

          {storeTab === "config" && (
            <StoreConfigTab
              store={selectedStore}
              onUpdate={updateStore}
              onUploadImage={uploadImage}
              onToggleOpen={toggleStoreOpen}
            />
          )}

          {storeTab === "categories" && (
            <CategoriesTab
              categories={categories}
              categoryAddons={categoryAddons}
              products={products}
              onCreateCategory={createCategory}
              onUpdateCategory={updateCategory}
              onDeleteCategory={deleteCategory}
              onCreateAddon={createAddon}
              onDeleteAddon={deleteAddon}
            />
          )}

          {storeTab === "products" && (
            <ProductsTab
              categories={categories}
              products={products}
              variations={variations}
              onCreateProduct={createProduct}
              onUpdateProduct={updateProduct}
              onDeleteProduct={deleteProduct}
              onToggleProduct={toggleProduct}
              onUploadProductImage={uploadProductImage}
              onCreateVariation={createVariation}
              onDeleteVariation={deleteVariation}
            />
          )}

          {storeTab === "orders" && (
            <OrdersTab
              orders={orders}
              onUpdateStatus={updateStatus}
            />
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
