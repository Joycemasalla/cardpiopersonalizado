import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Store } from "@/types/store";
import {
  LogOut, Plus, Store as StoreIcon, Trash2, Eye, Copy, Settings, Layers, Package, Cherry,
  ToggleLeft, ToggleRight, ChevronRight, Upload, Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

interface StoreCategory {
  id: string; store_id: string; name: string; image_url: string | null; sort_order: number; is_active: boolean;
}
interface StoreProduct {
  id: string; store_id: string; category_id: string; name: string; description: string | null; price: number; image_url: string | null; is_active: boolean; sort_order: number;
}
interface StoreVariation {
  id: string; product_id: string; name: string; price: number; sort_order: number; is_active: boolean;
}
interface StoreCategoryAddon {
  id: string; category_id: string; name: string; price: number; sort_order: number; is_active: boolean;
}

type StoreTab = "config" | "categories" | "products";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<any>(null);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [storeTab, setStoreTab] = useState<StoreTab>("config");

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login"); return; }
      setUser(user);
      const { data: roleData } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "platform_admin").maybeSingle();
      if (roleData) setIsPlatformAdmin(true);
      else {
        const { data: storeAdmin } = await supabase.from("store_admins").select("store_id").eq("user_id", user.id).maybeSingle();
        if (storeAdmin) setSelectedStoreId(storeAdmin.store_id);
      }
    };
    getUser();
  }, [navigate]);

  const { data: stores = [] } = useQuery({
    queryKey: ["admin-stores"],
    queryFn: async () => {
      const { data, error } = await supabase.from("stores").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Store[];
    },
    enabled: isPlatformAdmin,
  });

  // Per-store data
  const { data: storeCategories = [] } = useQuery({
    queryKey: ["store-categories", selectedStoreId],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").eq("store_id", selectedStoreId!).order("sort_order");
      if (error) throw error;
      return data as StoreCategory[];
    },
    enabled: !!selectedStoreId,
  });

  const { data: storeProducts = [] } = useQuery({
    queryKey: ["store-products", selectedStoreId],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("store_id", selectedStoreId!).order("sort_order");
      if (error) throw error;
      return data as StoreProduct[];
    },
    enabled: !!selectedStoreId,
  });

  const { data: storeVariations = [] } = useQuery({
    queryKey: ["store-variations", selectedStoreId],
    queryFn: async () => {
      const productIds = storeProducts.map(p => p.id);
      if (productIds.length === 0) return [];
      const { data, error } = await supabase.from("product_variations").select("*").in("product_id", productIds).order("sort_order");
      if (error) throw error;
      return data as StoreVariation[];
    },
    enabled: storeProducts.length > 0,
  });

  const { data: storeCategoryAddons = [] } = useQuery({
    queryKey: ["store-category-addons", selectedStoreId],
    queryFn: async () => {
      const catIds = storeCategories.map(c => c.id);
      if (catIds.length === 0) return [];
      const { data, error } = await supabase.from("category_addons").select("*").in("category_id", catIds).order("sort_order");
      if (error) throw error;
      return data as StoreCategoryAddon[];
    },
    enabled: storeCategories.length > 0,
  });

  const handleSignOut = async () => { await supabase.auth.signOut(); navigate("/login"); };

  const selectedStore = stores.find((s) => s.id === selectedStoreId);

  // ─── Create Store ───
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
    const { error } = await supabase.from("stores").insert({
      name: newStoreName,
      slug: newStoreSlug.toLowerCase().replace(/[^a-z0-9-]/g, ""),
      whatsapp: newStoreWhatsapp || null,
      color_primary: newStoreColor,
      color_secondary: newStoreColorSecondary,
      color_background: newStoreColorBg,
      color_text: newStoreColorText,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Loja criada!");
    setStoreDialogOpen(false);
    setNewStoreName(""); setNewStoreSlug(""); setNewStoreWhatsapp("");
    queryClient.invalidateQueries({ queryKey: ["admin-stores"] });
  };

  // ─── Category CRUD ───
  const [newCatName, setNewCatName] = useState("");
  const [catDialogOpen, setCatDialogOpen] = useState(false);

  const handleCreateCategory = async () => {
    if (!newCatName || !selectedStoreId) return;
    const { error } = await supabase.from("categories").insert({ store_id: selectedStoreId, name: newCatName, sort_order: storeCategories.length });
    if (error) { toast.error(error.message); return; }
    toast.success("Categoria criada!");
    setNewCatName(""); setCatDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ["store-categories", selectedStoreId] });
  };

  const handleDeleteCategory = async (id: string) => {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Categoria removida!");
    queryClient.invalidateQueries({ queryKey: ["store-categories", selectedStoreId] });
  };

  // ─── Product CRUD ───
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newProductDesc, setNewProductDesc] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductCatId, setNewProductCatId] = useState("");
  const [newProductImageUrl, setNewProductImageUrl] = useState("");

  const handleCreateProduct = async () => {
    if (!newProductName || !newProductCatId || !selectedStoreId) { toast.error("Preencha nome e categoria"); return; }
    const { error } = await supabase.from("products").insert({
      store_id: selectedStoreId, category_id: newProductCatId, name: newProductName,
      description: newProductDesc || null, price: parseFloat(newProductPrice) || 0,
      image_url: newProductImageUrl || null, sort_order: storeProducts.length,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Produto criado!");
    setNewProductName(""); setNewProductDesc(""); setNewProductPrice(""); setNewProductCatId(""); setNewProductImageUrl("");
    setProductDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ["store-products", selectedStoreId] });
  };

  const handleDeleteProduct = async (id: string) => {
    await supabase.from("product_variations").delete().eq("product_id", id);
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Produto removido!");
    queryClient.invalidateQueries({ queryKey: ["store-products", selectedStoreId] });
  };

  const handleToggleProduct = async (id: string, current: boolean) => {
    await supabase.from("products").update({ is_active: !current }).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["store-products", selectedStoreId] });
  };

  // ─── Variation CRUD ───
  const [variationDialogOpen, setVariationDialogOpen] = useState(false);
  const [variationProductId, setVariationProductId] = useState("");
  const [newVarName, setNewVarName] = useState("");
  const [newVarPrice, setNewVarPrice] = useState("");

  const handleCreateVariation = async () => {
    if (!newVarName || !variationProductId) return;
    const { error } = await supabase.from("product_variations").insert({
      product_id: variationProductId, name: newVarName, price: parseFloat(newVarPrice) || 0,
      sort_order: storeVariations.filter(v => v.product_id === variationProductId).length,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Variação criada!");
    setNewVarName(""); setNewVarPrice(""); setVariationDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ["store-variations", selectedStoreId] });
  };

  const handleDeleteVariation = async (id: string) => {
    await supabase.from("product_variations").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["store-variations", selectedStoreId] });
    toast.success("Variação removida!");
  };

  // ─── Category Addon CRUD ───
  const [addonDialogOpen, setAddonDialogOpen] = useState(false);
  const [addonCatId, setAddonCatId] = useState("");
  const [newAddonName, setNewAddonName] = useState("");
  const [newAddonPrice, setNewAddonPrice] = useState("");

  const handleCreateAddon = async () => {
    if (!newAddonName || !addonCatId) return;
    const { error } = await supabase.from("category_addons").insert({
      category_id: addonCatId, name: newAddonName, price: parseFloat(newAddonPrice) || 0,
      sort_order: storeCategoryAddons.filter(a => a.category_id === addonCatId).length,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Adicional criado!");
    setNewAddonName(""); setNewAddonPrice(""); setAddonDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ["store-category-addons", selectedStoreId] });
  };

  const handleDeleteAddon = async (id: string) => {
    await supabase.from("category_addons").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["store-category-addons", selectedStoreId] });
    toast.success("Adicional removido!");
  };

  // ─── Image Upload ───
  const handleImageUpload = async (file: File, path: string): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const filePath = `${path}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("store-assets").upload(filePath, file);
    if (error) { toast.error("Erro no upload: " + error.message); return null; }
    const { data } = supabase.storage.from("store-assets").getPublicUrl(filePath);
    return data.publicUrl;
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-pulse text-muted-foreground font-display italic">Carregando...</div></div>;
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
          <button
            onClick={() => { setSelectedStoreId(null); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all ${
              !selectedStoreId ? "bg-sidebar-accent text-foreground border-l-2 border-primary" : "text-sidebar-foreground hover:bg-sidebar-accent/50 border-l-2 border-transparent"
            }`}
          >
            <StoreIcon className={`h-4 w-4 ${!selectedStoreId ? "text-primary" : "text-muted-foreground"}`} />
            <span className="text-xs uppercase tracking-wide">Lojas</span>
          </button>
          {selectedStoreId && (
            <div className="ml-4 space-y-1 border-l border-border pl-3 mt-2">
              {([
                { id: "config" as StoreTab, icon: Settings, label: "Configurações" },
                { id: "categories" as StoreTab, icon: Layers, label: "Categorias" },
                { id: "products" as StoreTab, icon: Package, label: "Produtos" },
              ]).map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setStoreTab(id)}
                  className={`w-full flex items-center gap-2 px-2 py-2 rounded-md text-xs transition-all ${
                    storeTab === id ? "bg-sidebar-accent text-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${storeTab === id ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="uppercase tracking-wide">{label}</span>
                </button>
              ))}
            </div>
          )}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <button onClick={handleSignOut} className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full">
            <LogOut className="h-3.5 w-3.5" /> Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b border-border px-4 lg:px-8 h-14 flex items-center justify-between shrink-0">
          <h1 className="text-lg font-display font-bold italic text-foreground">
            {!selectedStoreId ? "Lojas" : (selectedStore?.name || "Loja")}
          </h1>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <span className="text-xs font-bold text-foreground">{user?.email?.charAt(0).toUpperCase()}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">

          {/* ═══ STORES LIST ═══ */}
          {!selectedStoreId && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-sm">Gerencie todas as lojas / clientes.</p>
                <Dialog open={storeDialogOpen} onOpenChange={setStoreDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs"><Plus className="h-4 w-4 mr-1" /> Novo Cardápio</Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card border-border">
                    <DialogHeader><DialogTitle className="font-display italic text-foreground">Criar Novo Cardápio</DialogTitle></DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-widest text-muted-foreground">Nome da Loja</Label>
                        <Input value={newStoreName} onChange={(e) => setNewStoreName(e.target.value)} placeholder="Ex: Espaço Imperial" className="bg-secondary border-border text-foreground" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-widest text-muted-foreground">Slug da URL</Label>
                        <Input value={newStoreSlug} onChange={(e) => setNewStoreSlug(e.target.value)} placeholder="espaco-imperial" className="bg-secondary border-border text-foreground" />
                        <p className="text-[10px] text-muted-foreground">Link: /r/{newStoreSlug || "slug"}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-widest text-muted-foreground">WhatsApp</Label>
                        <Input value={newStoreWhatsapp} onChange={(e) => setNewStoreWhatsapp(e.target.value)} placeholder="5511999999999" className="bg-secondary border-border text-foreground" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: "Cor Principal", val: newStoreColor, set: setNewStoreColor },
                          { label: "Cor Secundária", val: newStoreColorSecondary, set: setNewStoreColorSecondary },
                          { label: "Cor de Fundo", val: newStoreColorBg, set: setNewStoreColorBg },
                          { label: "Cor do Texto", val: newStoreColorText, set: setNewStoreColorText },
                        ].map(({ label, val, set }) => (
                          <div key={label} className="space-y-1">
                            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</Label>
                            <div className="flex items-center gap-2">
                              <input type="color" value={val} onChange={(e) => set(e.target.value)} className="w-8 h-8 rounded border-0 cursor-pointer" />
                              <span className="text-[10px] text-muted-foreground font-mono">{val}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button onClick={handleCreateStore} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-xs uppercase tracking-widest">Criar Cardápio</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stores.map((store) => (
                  <div
                    key={store.id}
                    className="bg-card border border-border rounded-lg p-5 hover:border-primary/30 transition-all cursor-pointer group"
                    onClick={() => { setSelectedStoreId(store.id); setStoreTab("config"); }}
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
                        <div className="flex gap-1 mt-2">
                          {[store.color_primary, store.color_secondary, store.color_background, store.color_text].map((c, i) => (
                            <span key={i} className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <Button variant="outline" size="sm" className="text-xs border-border text-muted-foreground hover:text-foreground" onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(`${window.location.origin}/r/${store.slug}`); toast.success("Link copiado!"); }}>
                        <Copy className="h-3 w-3 mr-1" /> Link
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs border-border text-muted-foreground hover:text-foreground" onClick={(e) => { e.stopPropagation(); window.open(`/r/${store.slug}`, "_blank"); }}>
                        <Eye className="h-3 w-3 mr-1" /> Ver
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ STORE DETAIL ═══ */}
          {selectedStoreId && selectedStore && (
            <div className="space-y-6">
              <Button variant="ghost" size="sm" onClick={() => setSelectedStoreId(null)} className="text-muted-foreground hover:text-foreground text-xs mb-2">← Voltar às lojas</Button>

              {/* Mobile tab selector */}
              <div className="flex gap-2 lg:hidden">
                {(["config", "categories", "products"] as StoreTab[]).map((t) => (
                  <button key={t} onClick={() => setStoreTab(t)} className={`px-3 py-1.5 rounded-md text-xs uppercase tracking-widest font-semibold transition-all ${storeTab === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                    {t === "config" ? "Config" : t === "categories" ? "Categorias" : "Produtos"}
                  </button>
                ))}
              </div>

              {/* ── CONFIG TAB ── */}
              {storeTab === "config" && (
                <div className="bg-card border border-border rounded-lg p-6 space-y-6">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="relative group">
                      {selectedStore.logo_url ? (
                        <img src={selectedStore.logo_url} alt="" className="w-16 h-16 rounded-lg object-cover" />
                      ) : (
                        <div className="w-16 h-16 rounded-lg flex items-center justify-center bg-secondary"><ImageIcon className="h-6 w-6 text-muted-foreground" /></div>
                      )}
                      <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Upload className="h-5 w-5 text-white" />
                        <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const url = await handleImageUpload(file, `logos/${selectedStoreId}`);
                          if (url) {
                            await supabase.from("stores").update({ logo_url: url }).eq("id", selectedStoreId!);
                            queryClient.invalidateQueries({ queryKey: ["admin-stores"] });
                            toast.success("Logo atualizada!");
                          }
                        }} />
                      </label>
                    </div>
                    <div>
                      <h2 className="text-xl font-display font-bold italic text-foreground">{selectedStore.name}</h2>
                      <p className="text-xs text-muted-foreground">/r/{selectedStore.slug}</p>
                    </div>
                  </div>

                  {/* Colors */}
                  <div>
                    <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">Cores da Marca</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {([
                        { label: "Principal", field: "color_primary" as const, value: selectedStore.color_primary },
                        { label: "Secundária", field: "color_secondary" as const, value: selectedStore.color_secondary },
                        { label: "Fundo", field: "color_background" as const, value: selectedStore.color_background },
                        { label: "Texto", field: "color_text" as const, value: selectedStore.color_text },
                      ]).map(({ label, field, value }) => (
                        <div key={field} className="space-y-1">
                          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</Label>
                          <div className="flex items-center gap-2">
                            <input type="color" defaultValue={value} onBlur={async (e) => {
                              if (e.target.value !== value) {
                                await supabase.from("stores").update({ [field]: e.target.value }).eq("id", selectedStore.id);
                                queryClient.invalidateQueries({ queryKey: ["admin-stores"] });
                                toast.success(`${label} atualizada!`);
                              }
                            }} className="w-8 h-8 rounded border-0 cursor-pointer" />
                            <span className="text-[10px] text-muted-foreground font-mono">{value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* WhatsApp & Delivery */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">WhatsApp</Label>
                      <Input defaultValue={selectedStore.whatsapp || ""} onBlur={async (e) => {
                        await supabase.from("stores").update({ whatsapp: e.target.value || null }).eq("id", selectedStore.id);
                        queryClient.invalidateQueries({ queryKey: ["admin-stores"] });
                      }} placeholder="5511999999999" className="bg-secondary border-border text-foreground" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Taxa de Entrega (R$)</Label>
                      <Input type="number" step="0.01" defaultValue={selectedStore.delivery_fee ?? 0} onBlur={async (e) => {
                        await supabase.from("stores").update({ delivery_fee: parseFloat(e.target.value) || 0 }).eq("id", selectedStore.id);
                        queryClient.invalidateQueries({ queryKey: ["admin-stores"] });
                      }} className="bg-secondary border-border text-foreground" />
                    </div>
                  </div>

                  {/* Banner */}
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Texto do Banner</Label>
                    <Input defaultValue={selectedStore.banner_text || ""} onBlur={async (e) => {
                      await supabase.from("stores").update({ banner_text: e.target.value || null }).eq("id", selectedStore.id);
                      queryClient.invalidateQueries({ queryKey: ["admin-stores"] });
                    }} placeholder="Ex: 🔥 Promoção de inauguração!" className="bg-secondary border-border text-foreground" />
                  </div>

                  {/* Toggle open/closed */}
                  <div className="flex items-center gap-3">
                    <button onClick={async () => {
                      await supabase.from("stores").update({ is_open: !selectedStore.is_open }).eq("id", selectedStore.id);
                      queryClient.invalidateQueries({ queryKey: ["admin-stores"] });
                      toast.success(selectedStore.is_open ? "Loja fechada" : "Loja aberta");
                    }}>
                      {selectedStore.is_open ? <ToggleRight className="h-6 w-6 text-primary" /> : <ToggleLeft className="h-6 w-6 text-muted-foreground" />}
                    </button>
                    <span className="text-sm text-foreground">{selectedStore.is_open ? "Loja Aberta" : "Loja Fechada"}</span>
                  </div>
                </div>
              )}

              {/* ── CATEGORIES TAB ── */}
              {storeTab === "categories" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-display font-semibold text-foreground italic">Categorias</h3>
                    <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-primary text-primary-foreground text-xs"><Plus className="h-3.5 w-3.5 mr-1" /> Nova Categoria</Button>
                      </DialogTrigger>
                      <DialogContent className="bg-card border-border">
                        <DialogHeader><DialogTitle className="font-display italic text-foreground">Nova Categoria</DialogTitle></DialogHeader>
                        <div className="space-y-4 mt-4">
                          <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Nome</Label>
                            <Input value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Ex: Pizzas, Bebidas..." className="bg-secondary border-border text-foreground" />
                          </div>
                          <Button onClick={handleCreateCategory} className="w-full bg-primary text-primary-foreground text-xs uppercase tracking-widest">Criar</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {storeCategories.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-border rounded-lg text-muted-foreground text-sm">Nenhuma categoria. Crie a primeira!</div>
                  ) : (
                    <div className="space-y-3">
                      {storeCategories.map((cat) => {
                        const addons = storeCategoryAddons.filter(a => a.category_id === cat.id);
                        return (
                          <div key={cat.id} className="bg-card border border-border rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-sm font-semibold text-foreground">{cat.name}</h4>
                                <p className="text-[10px] text-muted-foreground">{storeProducts.filter(p => p.category_id === cat.id).length} produtos · {addons.length} adicionais</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" className="text-xs" onClick={() => { setAddonCatId(cat.id); setAddonDialogOpen(true); }}>
                                  <Cherry className="h-3 w-3 mr-1" /> Adicional
                                </Button>
                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteCategory(cat.id)}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                            {addons.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {addons.map(addon => (
                                  <span key={addon.id} className="inline-flex items-center gap-1 text-[10px] bg-secondary rounded-full px-2.5 py-1 text-muted-foreground">
                                    {addon.name} · R$ {Number(addon.price).toFixed(2).replace(".", ",")}
                                    <button onClick={() => handleDeleteAddon(addon.id)} className="text-destructive hover:text-destructive/80 ml-1">×</button>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ── PRODUCTS TAB ── */}
              {storeTab === "products" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-display font-semibold text-foreground italic">Produtos</h3>
                    <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-primary text-primary-foreground text-xs"><Plus className="h-3.5 w-3.5 mr-1" /> Novo Produto</Button>
                      </DialogTrigger>
                      <DialogContent className="bg-card border-border">
                        <DialogHeader><DialogTitle className="font-display italic text-foreground">Novo Produto</DialogTitle></DialogHeader>
                        <div className="space-y-4 mt-4">
                          <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Categoria</Label>
                            <select value={newProductCatId} onChange={(e) => setNewProductCatId(e.target.value)} className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground">
                              <option value="">Selecione...</option>
                              {storeCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Nome</Label>
                            <Input value={newProductName} onChange={(e) => setNewProductName(e.target.value)} placeholder="Ex: Açaí 500ml" className="bg-secondary border-border text-foreground" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Descrição</Label>
                            <Textarea value={newProductDesc} onChange={(e) => setNewProductDesc(e.target.value)} placeholder="Descrição opcional..." className="bg-secondary border-border text-foreground" rows={2} />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Preço Base (R$)</Label>
                            <Input type="number" step="0.01" value={newProductPrice} onChange={(e) => setNewProductPrice(e.target.value)} placeholder="0.00" className="bg-secondary border-border text-foreground" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-widest text-muted-foreground">URL da Imagem (opcional)</Label>
                            <Input value={newProductImageUrl} onChange={(e) => setNewProductImageUrl(e.target.value)} placeholder="https://..." className="bg-secondary border-border text-foreground" />
                          </div>
                          <Button onClick={handleCreateProduct} className="w-full bg-primary text-primary-foreground text-xs uppercase tracking-widest">Criar Produto</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {storeCategories.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-border rounded-lg text-muted-foreground text-sm">Crie categorias primeiro antes de adicionar produtos.</div>
                  ) : storeProducts.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-border rounded-lg text-muted-foreground text-sm">Nenhum produto. Adicione o primeiro!</div>
                  ) : (
                    storeCategories.map(cat => {
                      const catProducts = storeProducts.filter(p => p.category_id === cat.id);
                      if (catProducts.length === 0) return null;
                      return (
                        <div key={cat.id} className="space-y-3">
                          <h4 className="text-xs uppercase tracking-widest text-primary font-semibold">{cat.name}</h4>
                          {catProducts.map(product => {
                            const variations = storeVariations.filter(v => v.product_id === product.id);
                            return (
                              <div key={product.id} className={`bg-card border rounded-lg p-4 transition-all ${product.is_active ? "border-border" : "border-border opacity-50"}`}>
                                <div className="flex items-center gap-3">
                                  {product.image_url ? (
                                    <img src={product.image_url} alt="" className="w-12 h-12 rounded-md object-cover" />
                                  ) : (
                                    <div className="w-12 h-12 rounded-md bg-secondary flex items-center justify-center"><ImageIcon className="h-4 w-4 text-muted-foreground" /></div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm font-medium text-foreground">{product.name}</p>
                                      <span className="text-xs text-primary font-mono">R$ {Number(product.price).toFixed(2).replace(".", ",")}</span>
                                    </div>
                                    {product.description && <p className="text-[10px] text-muted-foreground truncate">{product.description}</p>}
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    {/* Upload image */}
                                    <label className="cursor-pointer p-1.5 rounded-md hover:bg-secondary transition-colors">
                                      <Upload className="h-3.5 w-3.5 text-muted-foreground" />
                                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const url = await handleImageUpload(file, `products/${selectedStoreId}`);
                                        if (url) {
                                          await supabase.from("products").update({ image_url: url }).eq("id", product.id);
                                          queryClient.invalidateQueries({ queryKey: ["store-products", selectedStoreId] });
                                          toast.success("Imagem atualizada!");
                                        }
                                      }} />
                                    </label>
                                    <Button variant="outline" size="sm" className="text-[10px] h-7" onClick={() => { setVariationProductId(product.id); setVariationDialogOpen(true); }}>
                                      + Variação
                                    </Button>
                                    <button onClick={() => handleToggleProduct(product.id, product.is_active)}>
                                      {product.is_active ? <ToggleRight className="h-5 w-5 text-primary" /> : <ToggleLeft className="h-5 w-5 text-muted-foreground" />}
                                    </button>
                                    <button onClick={() => handleDeleteProduct(product.id)} className="text-destructive hover:text-destructive/80 p-1">
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                                {variations.length > 0 && (
                                  <div className="mt-3 ml-15 flex flex-wrap gap-2">
                                    {variations.map(v => (
                                      <span key={v.id} className="inline-flex items-center gap-1 text-[10px] bg-secondary rounded-full px-2.5 py-1 text-muted-foreground">
                                        {v.name} · R$ {Number(v.price).toFixed(2).replace(".", ",")}
                                        <button onClick={() => handleDeleteVariation(v.id)} className="text-destructive hover:text-destructive/80 ml-1">×</button>
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ─── DIALOGS ─── */}
      {/* Addon Dialog */}
      <Dialog open={addonDialogOpen} onOpenChange={setAddonDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle className="font-display italic text-foreground">Novo Adicional</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Nome</Label>
              <Input value={newAddonName} onChange={(e) => setNewAddonName(e.target.value)} placeholder="Ex: Borda recheada" className="bg-secondary border-border text-foreground" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Preço (R$)</Label>
              <Input type="number" step="0.01" value={newAddonPrice} onChange={(e) => setNewAddonPrice(e.target.value)} placeholder="0.00" className="bg-secondary border-border text-foreground" />
            </div>
            <Button onClick={handleCreateAddon} className="w-full bg-primary text-primary-foreground text-xs uppercase tracking-widest">Criar Adicional</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Variation Dialog */}
      <Dialog open={variationDialogOpen} onOpenChange={setVariationDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle className="font-display italic text-foreground">Nova Variação</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Nome</Label>
              <Input value={newVarName} onChange={(e) => setNewVarName(e.target.value)} placeholder="Ex: Grande, Pequeno" className="bg-secondary border-border text-foreground" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Preço (R$)</Label>
              <Input type="number" step="0.01" value={newVarPrice} onChange={(e) => setNewVarPrice(e.target.value)} placeholder="0.00" className="bg-secondary border-border text-foreground" />
            </div>
            <Button onClick={handleCreateVariation} className="w-full bg-primary text-primary-foreground text-xs uppercase tracking-widest">Criar Variação</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
