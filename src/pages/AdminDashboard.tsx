import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import type { Store, Category, Product } from "@/types/store";
import {
  BarChart3, Settings, Package, LogOut, HelpCircle, Sparkles, Search,
  Plus, MoreVertical, Utensils, Wine, IceCream, Upload, Pencil
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [storeId, setStoreId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }
      setUser(user);

      // Get store admin association
      const { data: adminData } = await supabase
        .from("store_admins")
        .select("store_id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (adminData) {
        setStoreId(adminData.store_id);
      }
    };
    getUser();
  }, [navigate]);

  const { data: store } = useQuery({
    queryKey: ["admin-store", storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("id", storeId!)
        .single();
      if (error) throw error;
      return data as Store;
    },
    enabled: !!storeId,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories", storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("store_id", storeId!)
        .order("sort_order");
      if (error) throw error;
      return data as Category[];
    },
    enabled: !!storeId,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["admin-products", storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("store_id", storeId!)
        .order("sort_order");
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!storeId,
  });

  const [activeSection, setActiveSection] = useState<string>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || "—";
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground font-display italic">Carregando painel...</div>
      </div>
    );
  }

  if (!storeId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold italic text-foreground">Nenhuma loja associada</h1>
          <p className="mt-2 text-muted-foreground text-sm">Sua conta ainda não está vinculada a nenhum restaurante.</p>
          <Button onClick={handleSignOut} variant="outline" className="mt-4 border-border text-foreground">
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="w-56 border-r border-border bg-sidebar flex flex-col hidden lg:flex">
        <div className="p-4 border-b border-sidebar-border">
          <span className="font-display text-lg font-bold italic text-primary">
            {store?.name || "MenuLab"}
          </span>
        </div>

        <div className="p-4">
          <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Categorias</h3>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Seleção do menu</p>
        </div>

        <nav className="flex-1 px-2 space-y-1">
          {categories.slice(0, 6).map((cat) => {
            const isActive = activeSection === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveSection(cat.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all ${
                  isActive
                    ? "bg-sidebar-accent text-foreground border-l-2 border-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 border-l-2 border-transparent"
                }`}
              >
                <Utensils className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-xs uppercase tracking-wide">{cat.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border space-y-1">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 border-primary text-primary hover:bg-primary/10 text-xs"
            onClick={() => store && navigate(`/r/${store.slug}`)}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Ver Cardápio
          </Button>
          <button onClick={() => {}} className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full">
            <HelpCircle className="h-3.5 w-3.5" />
            Ajuda
          </button>
          <button onClick={handleSignOut} className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full">
            <LogOut className="h-3.5 w-3.5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top nav */}
        <header className="border-b border-border px-4 lg:px-8 h-14 flex items-center justify-between">
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => setActiveSection("dashboard")}
              className={`text-sm transition-colors ${activeSection === "dashboard" ? "text-primary border-b border-primary pb-0.5 font-medium" : "text-muted-foreground hover:text-foreground"}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveSection("products")}
              className={`text-sm transition-colors ${activeSection === "products" ? "text-primary border-b border-primary pb-0.5 font-medium" : "text-muted-foreground hover:text-foreground"}`}
            >
              Produtos
            </button>
            <button
              onClick={() => setActiveSection("settings")}
              className={`text-sm transition-colors ${activeSection === "settings" ? "text-primary border-b border-primary pb-0.5 font-medium" : "text-muted-foreground hover:text-foreground"}`}
            >
              Configurações
            </button>
          </nav>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <span className="text-xs font-bold text-foreground">{user?.email?.charAt(0).toUpperCase()}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {activeSection === "dashboard" && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-display font-bold italic text-foreground">Painel do Lojista</h1>
                <p className="text-muted-foreground mt-1">Gerencie seu cardápio e acompanhe seus pedidos.</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-lg p-5">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Produtos Ativos</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{products.filter((p) => p.is_active).length}</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-5">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Categorias</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{categories.length}</p>
                </div>
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-5">
                  <p className="text-[10px] uppercase tracking-widest text-primary">Status</p>
                  <p className="text-xl font-bold text-primary mt-1">{store?.is_open ? "Aberto" : "Fechado"}</p>
                </div>
              </div>

              {/* Brand settings card */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-lg font-display font-semibold text-primary italic mb-1">Configurações da Marca</h3>
                  <p className="text-xs text-muted-foreground mb-6">Atualize a identidade visual do seu cardápio.</p>

                  <div className="space-y-4">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">Logo do Estabelecimento</p>
                      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Arraste e solte seu logo aqui</p>
                        <p className="text-[10px] text-muted-foreground mt-1">PNG, SVG até 2MB</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">Cor de Destaque</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border-2 border-primary" style={{ backgroundColor: store?.color_primary || "#d4a843" }} />
                        <div className="flex items-center gap-2 bg-secondary rounded-md px-3 py-2">
                          <span className="text-sm text-foreground font-mono">{store?.color_primary || "#D4A843"}</span>
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        {["#D4A843", "#4CAF50", "#F2CA50", "#E57A44", "#7B8CDE"].map((color) => (
                          <div
                            key={color}
                            className="w-8 h-8 rounded-full cursor-pointer border-2 border-transparent hover:border-foreground transition-colors"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button className="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold uppercase tracking-widest text-xs">
                    Publicar Alterações
                  </Button>
                </div>

                {/* Placeholder chart area */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-display font-semibold text-foreground">Volume de Pedidos</h3>
                    <span className="text-xs text-muted-foreground border border-border rounded px-2 py-1">Últimos 7 dias</span>
                  </div>
                  <div className="h-48 flex items-end gap-2 px-2">
                    {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day, i) => {
                      const heights = [45, 55, 50, 65, 80, 70, 40];
                      return (
                        <div key={day} className="flex-1 flex flex-col items-center gap-2">
                          <div
                            className="w-full rounded-t-sm transition-all"
                            style={{
                              height: `${heights[i]}%`,
                              backgroundColor: i === 4 ? "hsl(43, 72%, 55%)" : "hsl(30, 6%, 25%)",
                            }}
                          />
                          <span className="text-[10px] text-muted-foreground uppercase">{day}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {(activeSection === "products" || activeSection === "dashboard") && (
            <div className={activeSection === "dashboard" ? "mt-8" : ""}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display font-semibold text-foreground italic">Gerenciamento de Produtos</h2>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-secondary rounded-md px-3 py-1.5">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Buscar produtos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-40"
                    />
                  </div>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs">
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar Produto
                  </Button>
                </div>
              </div>

              {/* Products table */}
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-border text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                  <span className="col-span-4">Detalhes do Item</span>
                  <span className="col-span-2">Categoria</span>
                  <span className="col-span-2">Preço</span>
                  <span className="col-span-2">Status</span>
                  <span className="col-span-2 text-right">Ações</span>
                </div>
                {filteredProducts.slice(0, 10).map((product) => (
                  <div key={product.id} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-border items-center hover:bg-secondary/50 transition-colors">
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-secondary overflow-hidden shrink-0">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <Package className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{product.name}</p>
                        <p className="text-[10px] text-muted-foreground line-clamp-1">{product.description || "Sem descrição"}</p>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm text-muted-foreground">{getCategoryName(product.category_id)}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm font-mono text-primary">R$ {Number(product.price).toFixed(2).replace(".", ",")}</span>
                    </div>
                    <div className="col-span-2">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-semibold px-2 py-1 rounded ${
                        product.is_active
                          ? "bg-success/10 text-success"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${product.is_active ? "bg-success" : "bg-muted-foreground"}`} />
                        {product.is_active ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <button className="p-1 hover:bg-secondary rounded transition-colors">
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-3">
                Exibindo {Math.min(filteredProducts.length, 10)} de {filteredProducts.length} itens
              </p>
            </div>
          )}

          {activeSection === "settings" && (
            <div className="max-w-2xl">
              <h1 className="text-3xl font-display font-bold italic text-foreground mb-2">Configurações</h1>
              <p className="text-muted-foreground mb-8">Gerencie as configurações do seu restaurante.</p>

              <div className="space-y-6">
                <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                  <h3 className="font-display font-semibold text-foreground">Informações Gerais</h3>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-muted-foreground">Nome do Restaurante</label>
                    <Input defaultValue={store?.name} className="bg-secondary border-border text-foreground" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-muted-foreground">WhatsApp</label>
                    <Input defaultValue={store?.whatsapp || ""} className="bg-secondary border-border text-foreground" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-muted-foreground">Endereço</label>
                    <Input defaultValue={store?.address || ""} className="bg-secondary border-border text-foreground" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
