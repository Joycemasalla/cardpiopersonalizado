import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Store, MasterCategory, MasterProduct, MasterProductSize, MasterAddon } from "@/types/store";
import {
  BarChart3, Settings, Package, LogOut, Plus, Store as StoreIcon,
  Pencil, Trash2, Upload, Eye, Copy, ExternalLink, Search, Layers, Cherry,
  ToggleLeft, ToggleRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<any>(null);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("stores");
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login"); return; }
      setUser(user);

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "platform_admin")
        .maybeSingle();

      if (!roleData) {
        // Check store admin fallback
        const { data: storeAdmin } = await supabase
          .from("store_admins")
          .select("store_id")
          .eq("user_id", user.id)
          .maybeSingle();
        if (storeAdmin) {
          setSelectedStoreId(storeAdmin.store_id);
        }
      } else {
        setIsPlatformAdmin(true);
      }
    };
    getUser();
  }, [navigate]);

  // All stores (for platform admin)
  const { data: stores = [] } = useQuery({
    queryKey: ["admin-stores"],
    queryFn: async () => {
      const { data, error } = await supabase.from("stores").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Store[];
    },
    enabled: isPlatformAdmin,
  });

  // Master catalog
  const { data: masterCategories = [] } = useQuery({
    queryKey: ["master-categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("master_categories").select("*").order("sort_order");
      if (error) throw error;
      return data as MasterCategory[];
    },
    enabled: isPlatformAdmin,
  });

  const { data: masterProducts = [] } = useQuery({
    queryKey: ["master-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("master_products").select("*").order("sort_order");
      if (error) throw error;
      return data as MasterProduct[];
    },
    enabled: isPlatformAdmin,
  });

  const { data: masterSizes = [] } = useQuery({
    queryKey: ["master-sizes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("master_product_sizes").select("*").order("sort_order");
      if (error) throw error;
      return data as MasterProductSize[];
    },
    enabled: isPlatformAdmin,
  });

  const { data: masterAddons = [] } = useQuery({
    queryKey: ["master-addons"],
    queryFn: async () => {
      const { data, error } = await supabase.from("master_addons").select("*").order("sort_order");
      if (error) throw error;
      return data as MasterAddon[];
    },
    enabled: isPlatformAdmin,
  });

  // Tenant products for selected store
  const { data: tenantProducts = [] } = useQuery({
    queryKey: ["tenant-products-admin", selectedStoreId],
    queryFn: async () => {
      const { data, error } = await supabase.from("tenant_products").select("*").eq("store_id", selectedStoreId!);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedStoreId,
  });

  const { data: tenantSizes = [] } = useQuery({
    queryKey: ["tenant-sizes-admin", selectedStoreId],
    queryFn: async () => {
      const { data, error } = await supabase.from("tenant_product_sizes").select("*").eq("store_id", selectedStoreId!);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedStoreId,
  });

  const { data: tenantAddonsData = [] } = useQuery({
    queryKey: ["tenant-addons-admin", selectedStoreId],
    queryFn: async () => {
      const { data, error } = await supabase.from("tenant_addons").select("*").eq("store_id", selectedStoreId!);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedStoreId,
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  // New store form
  const [newStoreName, setNewStoreName] = useState("");
  const [newStoreSlug, setNewStoreSlug] = useState("");
  const [newStoreWhatsapp, setNewStoreWhatsapp] = useState("");
  const [newStoreColor, setNewStoreColor] = useState("#D4A843");
  const [newStoreColorSecondary, setNewStoreColorSecondary] = useState("#1a1a2e");
  const [newStoreColorBg, setNewStoreColorBg] = useState("#0d0d0d");
  const [newStoreColorText, setNewStoreColorText] = useState("#f5f5f5");
  const [storeDialogOpen, setStoreDialogOpen] = useState(false);

  const handleCreateStore = async () => {
    if (!newStoreName || !newStoreSlug) { toast.error("Preencha nome e slug"); return; }
    const { data, error } = await supabase.from("stores").insert({
      name: newStoreName,
      slug: newStoreSlug.toLowerCase().replace(/[^a-z0-9-]/g, ""),
      whatsapp: newStoreWhatsapp || null,
      color_primary: newStoreColor,
    }).select().single();
    if (error) { toast.error(error.message); return; }
    toast.success("Loja criada!");
    setStoreDialogOpen(false);
    setNewStoreName(""); setNewStoreSlug(""); setNewStoreWhatsapp("");
    queryClient.invalidateQueries({ queryKey: ["admin-stores"] });
  };

  // Toggle product for store
  const handleToggleProduct = async (masterProductId: string) => {
    if (!selectedStoreId) return;
    const existing = tenantProducts.find((tp) => tp.master_product_id === masterProductId);
    if (existing) {
      await supabase.from("tenant_products").update({ is_enabled: !existing.is_enabled }).eq("id", existing.id);
    } else {
      // Enable product and create tenant sizes with default prices
      await supabase.from("tenant_products").insert({ store_id: selectedStoreId, master_product_id: masterProductId, is_enabled: true });
      const productSizes = masterSizes.filter((s) => s.product_id === masterProductId);
      if (productSizes.length > 0) {
        await supabase.from("tenant_product_sizes").insert(
          productSizes.map((s) => ({ store_id: selectedStoreId, master_size_id: s.id, price: s.default_price, is_enabled: true }))
        );
      }
    }
    queryClient.invalidateQueries({ queryKey: ["tenant-products-admin", selectedStoreId] });
    queryClient.invalidateQueries({ queryKey: ["tenant-sizes-admin", selectedStoreId] });
  };

  // Toggle addon for store
  const handleToggleAddon = async (masterAddonId: string) => {
    if (!selectedStoreId) return;
    const existing = tenantAddonsData.find((ta) => ta.master_addon_id === masterAddonId);
    if (existing) {
      await supabase.from("tenant_addons").update({ is_enabled: !existing.is_enabled }).eq("id", existing.id);
    } else {
      const addon = masterAddons.find((a) => a.id === masterAddonId);
      await supabase.from("tenant_addons").insert({
        store_id: selectedStoreId, master_addon_id: masterAddonId, price: addon?.default_price || 0, is_enabled: true,
      });
    }
    queryClient.invalidateQueries({ queryKey: ["tenant-addons-admin", selectedStoreId] });
  };

  // Update tenant size price
  const handleUpdateSizePrice = async (tenantSizeId: string, newPrice: number) => {
    await supabase.from("tenant_product_sizes").update({ price: newPrice }).eq("id", tenantSizeId);
    queryClient.invalidateQueries({ queryKey: ["tenant-sizes-admin", selectedStoreId] });
    toast.success("Preço atualizado");
  };

  const selectedStore = stores.find((s) => s.id === selectedStoreId);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground font-display italic">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="w-56 border-r border-border bg-sidebar flex flex-col hidden lg:flex">
        <div className="p-4 border-b border-sidebar-border">
          <span className="font-display text-lg font-bold italic text-primary">MenuLab</span>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">Super Admin</p>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          {[
            { id: "stores", icon: StoreIcon, label: "Lojas" },
            { id: "catalog", icon: Package, label: "Catálogo Mestre" },
            { id: "addons", icon: Cherry, label: "Adicionais" },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => { setActiveSection(id); setSelectedStoreId(null); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all ${
                activeSection === id
                  ? "bg-sidebar-accent text-foreground border-l-2 border-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 border-l-2 border-transparent"
              }`}
            >
              <Icon className={`h-4 w-4 ${activeSection === id ? "text-primary" : "text-muted-foreground"}`} />
              <span className="text-xs uppercase tracking-wide">{label}</span>
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <button onClick={handleSignOut} className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full">
            <LogOut className="h-3.5 w-3.5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b border-border px-4 lg:px-8 h-14 flex items-center justify-between shrink-0">
          <h1 className="text-lg font-display font-bold italic text-foreground">
            {activeSection === "stores" && !selectedStoreId && "Lojas"}
            {activeSection === "stores" && selectedStoreId && (selectedStore?.name || "Configurar Loja")}
            {activeSection === "catalog" && "Catálogo Mestre"}
            {activeSection === "addons" && "Adicionais Globais"}
          </h1>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <span className="text-xs font-bold text-foreground">{user?.email?.charAt(0).toUpperCase()}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {/* ═══ STORES LIST ═══ */}
          {activeSection === "stores" && !selectedStoreId && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Gerencie todas as lojas / clientes da plataforma.</p>
                </div>
                <Dialog open={storeDialogOpen} onOpenChange={setStoreDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs">
                      <Plus className="h-4 w-4 mr-1" /> Novo Cardápio
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card border-border">
                    <DialogHeader>
                      <DialogTitle className="font-display italic text-foreground">Criar Novo Cardápio</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-widest text-muted-foreground">Nome da Loja</Label>
                        <Input value={newStoreName} onChange={(e) => setNewStoreName(e.target.value)} placeholder="Ex: Espaço Imperial" className="bg-secondary border-border text-foreground" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-widest text-muted-foreground">Slug da URL</Label>
                        <Input value={newStoreSlug} onChange={(e) => setNewStoreSlug(e.target.value)} placeholder="espaco-imperial" className="bg-secondary border-border text-foreground" />
                        <p className="text-[10px] text-muted-foreground">Link: seusite.com/r/{newStoreSlug || "slug"}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-widest text-muted-foreground">WhatsApp</Label>
                        <Input value={newStoreWhatsapp} onChange={(e) => setNewStoreWhatsapp(e.target.value)} placeholder="5511999999999" className="bg-secondary border-border text-foreground" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-widest text-muted-foreground">Cor Principal</Label>
                        <div className="flex items-center gap-3">
                          <input type="color" value={newStoreColor} onChange={(e) => setNewStoreColor(e.target.value)} className="w-10 h-10 rounded border-0 cursor-pointer" />
                          <span className="text-sm text-muted-foreground font-mono">{newStoreColor}</span>
                        </div>
                      </div>
                      <Button onClick={handleCreateStore} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-xs uppercase tracking-widest">
                        Criar Cardápio
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stores.map((store) => (
                  <div
                    key={store.id}
                    className="bg-card border border-border rounded-lg p-5 hover:border-primary/30 transition-all cursor-pointer group"
                    onClick={() => { setSelectedStoreId(store.id); }}
                  >
                    <div className="flex items-start gap-3">
                      {store.logo_url ? (
                        <img src={store.logo_url} alt={store.name} className="w-12 h-12 rounded-lg object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: store.color_primary + "22" }}>
                          <StoreIcon className="h-5 w-5" style={{ color: store.color_primary }} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-semibold text-foreground">{store.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">/r/{store.slug}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-semibold px-2 py-1 rounded ${
                        store.is_open ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${store.is_open ? "bg-success" : "bg-muted-foreground"}`} />
                        {store.is_open ? "Aberto" : "Fechado"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs border-border text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(`${window.location.origin}/r/${store.slug}`);
                          toast.success("Link copiado!");
                        }}
                      >
                        <Copy className="h-3 w-3 mr-1" /> Copiar Link
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs border-border text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`/r/${store.slug}`, "_blank");
                        }}
                      >
                        <Eye className="h-3 w-3 mr-1" /> Ver
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ STORE CONFIG (products per tenant) ═══ */}
          {activeSection === "stores" && selectedStoreId && (
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => setSelectedStoreId(null)} className="text-muted-foreground hover:text-foreground text-xs">
                  ← Voltar
                </Button>
              </div>

              {/* Store info */}
              {selectedStore && (
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-lg flex items-center justify-center" style={{ backgroundColor: selectedStore.color_primary + "22" }}>
                      <StoreIcon className="h-6 w-6" style={{ color: selectedStore.color_primary }} />
                    </div>
                    <div>
                      <h2 className="text-xl font-display font-bold italic text-foreground">{selectedStore.name}</h2>
                      <p className="text-xs text-muted-foreground">
                        {window.location.origin}/r/{selectedStore.slug}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Products selection */}
              <div>
                <h3 className="text-lg font-display font-semibold text-foreground italic mb-4">Produtos do Cardápio</h3>
                <p className="text-xs text-muted-foreground mb-4">Ative os produtos do catálogo mestre que este cliente vende e defina os preços.</p>

                {masterCategories.map((cat) => {
                  const catProducts = masterProducts.filter((p) => p.category_id === cat.id);
                  if (catProducts.length === 0) return null;
                  return (
                    <div key={cat.id} className="mb-6">
                      <h4 className="text-xs uppercase tracking-widest text-primary font-semibold mb-3">{cat.name}</h4>
                      <div className="space-y-3">
                        {catProducts.map((product) => {
                          const tp = tenantProducts.find((t) => t.master_product_id === product.id);
                          const isEnabled = tp?.is_enabled ?? false;
                          const productSizes = masterSizes.filter((s) => s.product_id === product.id);

                          return (
                            <div key={product.id} className={`bg-card border rounded-lg p-4 transition-all ${isEnabled ? "border-primary/30" : "border-border opacity-60"}`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <button onClick={() => handleToggleProduct(product.id)}>
                                    {isEnabled ? (
                                      <ToggleRight className="h-6 w-6 text-primary" />
                                    ) : (
                                      <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                                    )}
                                  </button>
                                  <div>
                                    <p className="text-sm font-medium text-foreground">{product.name}</p>
                                    <p className="text-[10px] text-muted-foreground">{product.description}</p>
                                  </div>
                                </div>
                              </div>

                              {isEnabled && productSizes.length > 0 && (
                                <div className="mt-3 ml-9 grid grid-cols-2 md:grid-cols-4 gap-2">
                                  {productSizes.map((size) => {
                                    const ts = tenantSizes.find((t) => t.master_size_id === size.id);
                                    return (
                                      <div key={size.id} className="flex items-center gap-2 bg-secondary rounded-md p-2">
                                        <span className="text-xs text-muted-foreground w-12">{size.name}</span>
                                        <div className="flex items-center gap-1">
                                          <span className="text-xs text-muted-foreground">R$</span>
                                          <input
                                            type="number"
                                            step="0.01"
                                            defaultValue={ts ? Number(ts.price).toFixed(2) : Number(size.default_price).toFixed(2)}
                                            onBlur={(e) => {
                                              if (ts) handleUpdateSizePrice(ts.id, parseFloat(e.target.value));
                                            }}
                                            className="w-16 bg-transparent text-sm text-foreground outline-none font-mono"
                                          />
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Addons for this store */}
              <div>
                <h3 className="text-lg font-display font-semibold text-foreground italic mb-4">Adicionais</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {masterAddons.map((addon) => {
                    const ta = tenantAddonsData.find((t) => t.master_addon_id === addon.id);
                    const isEnabled = ta?.is_enabled ?? false;
                    return (
                      <button
                        key={addon.id}
                        onClick={() => handleToggleAddon(addon.id)}
                        className={`flex items-center gap-2 p-3 rounded-lg border transition-all text-left ${
                          isEnabled ? "border-primary bg-primary/10" : "border-border bg-card"
                        }`}
                      >
                        {isEnabled ? <ToggleRight className="h-4 w-4 text-primary shrink-0" /> : <ToggleLeft className="h-4 w-4 text-muted-foreground shrink-0" />}
                        <div>
                          <p className="text-xs font-medium text-foreground">{addon.name}</p>
                          <p className="text-[10px] text-muted-foreground">R$ {Number(addon.default_price).toFixed(2).replace(".", ",")}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ═══ MASTER CATALOG ═══ */}
          {activeSection === "catalog" && (
            <div className="space-y-6">
              <p className="text-muted-foreground text-sm">Catálogo global de produtos. Estes itens podem ser habilitados por loja.</p>
              {masterCategories.map((cat) => {
                const catProducts = masterProducts.filter((p) => p.category_id === cat.id);
                return (
                  <div key={cat.id} className="bg-card border border-border rounded-lg p-5">
                    <h3 className="text-sm font-display font-semibold text-primary italic uppercase tracking-wider mb-4">{cat.name}</h3>
                    <div className="space-y-3">
                      {catProducts.map((product) => {
                        const sizes = masterSizes.filter((s) => s.product_id === product.id);
                        return (
                          <div key={product.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                            <div>
                              <p className="text-sm font-medium text-foreground">{product.name}</p>
                              <p className="text-[10px] text-muted-foreground">{product.description}</p>
                            </div>
                            <div className="flex gap-2">
                              {sizes.map((s) => (
                                <span key={s.id} className="text-[10px] bg-secondary px-2 py-1 rounded text-muted-foreground">
                                  {s.name}: R$ {Number(s.default_price).toFixed(2).replace(".", ",")}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ═══ MASTER ADDONS ═══ */}
          {activeSection === "addons" && (
            <div className="space-y-6">
              <p className="text-muted-foreground text-sm">Adicionais globais disponíveis para todas as lojas.</p>
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="grid grid-cols-3 gap-4 px-6 py-3 border-b border-border text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                  <span>Nome</span>
                  <span>Preço Padrão</span>
                  <span>Status</span>
                </div>
                {masterAddons.map((addon) => (
                  <div key={addon.id} className="grid grid-cols-3 gap-4 px-6 py-3 border-b border-border items-center">
                    <span className="text-sm text-foreground">{addon.name}</span>
                    <span className="text-sm text-primary font-mono">R$ {Number(addon.default_price).toFixed(2).replace(".", ",")}</span>
                    <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-semibold px-2 py-1 rounded w-fit ${
                      addon.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${addon.is_active ? "bg-success" : "bg-muted-foreground"}`} />
                      {addon.is_active ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
