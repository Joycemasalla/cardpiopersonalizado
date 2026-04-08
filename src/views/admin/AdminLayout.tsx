import { ReactNode, useState } from "react";
import {
  LogOut, Store as StoreIcon, Settings, Layers, Package, ClipboardList, Menu, X,
} from "lucide-react";

type StoreTab = "config" | "categories" | "products" | "orders";

interface AdminLayoutProps {
  user: any;
  isPlatformAdmin: boolean;
  selectedStoreId: string | null;
  selectedStoreName?: string;
  storeTab: StoreTab;
  onSelectStoreTab: (tab: StoreTab) => void;
  onGoToStores: () => void;
  onSignOut: () => void;
  children: ReactNode;
  headerTitle: string;
}

const TABS: { id: StoreTab; icon: typeof Settings; label: string }[] = [
  { id: "config", icon: Settings, label: "Configurações" },
  { id: "categories", icon: Layers, label: "Categorias" },
  { id: "products", icon: Package, label: "Produtos" },
  { id: "orders", icon: ClipboardList, label: "Pedidos" },
];

export const AdminLayout = ({
  user,
  selectedStoreId,
  storeTab,
  onSelectStoreTab,
  onGoToStores,
  onSignOut,
  children,
  headerTitle,
}: AdminLayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (action: () => void) => {
    action();
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Desktop Sidebar */}
      <aside className="w-56 border-r border-border bg-sidebar flex-col hidden lg:flex">
        <div className="p-4 border-b border-sidebar-border">
          <span className="font-display text-lg font-bold italic text-primary">MenuLab</span>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">Super Admin</p>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          <button
            onClick={onGoToStores}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all ${
              !selectedStoreId ? "bg-sidebar-accent text-foreground border-l-2 border-primary" : "text-sidebar-foreground hover:bg-sidebar-accent/50 border-l-2 border-transparent"
            }`}
          >
            <StoreIcon className={`h-4 w-4 ${!selectedStoreId ? "text-primary" : "text-muted-foreground"}`} />
            <span className="text-xs uppercase tracking-wide">Lojas</span>
          </button>
          {selectedStoreId && (
            <div className="ml-4 space-y-1 border-l border-border pl-3 mt-2">
              {TABS.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => onSelectStoreTab(id)}
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
          <button onClick={onSignOut} className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full">
            <LogOut className="h-3.5 w-3.5" /> Sair
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-border flex flex-col animate-in slide-in-from-left">
            <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
              <div>
                <span className="font-display text-lg font-bold italic text-primary">MenuLab</span>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">Super Admin</p>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="text-muted-foreground"><X className="h-5 w-5" /></button>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-1">
              <button
                onClick={() => handleNavClick(onGoToStores)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all ${
                  !selectedStoreId ? "bg-sidebar-accent text-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <StoreIcon className="h-4 w-4" />
                <span className="text-xs uppercase tracking-wide">Lojas</span>
              </button>
              {selectedStoreId && TABS.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => handleNavClick(() => onSelectStoreTab(id))}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-md text-xs transition-all ${
                    storeTab === id ? "bg-sidebar-accent text-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${storeTab === id ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="uppercase tracking-wide">{label}</span>
                </button>
              ))}
            </nav>
            <div className="p-3 border-t border-sidebar-border">
              <button onClick={() => handleNavClick(onSignOut)} className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground w-full">
                <LogOut className="h-3.5 w-3.5" /> Sair
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b border-border px-4 lg:px-8 h-14 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden text-foreground">
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-display font-bold italic text-foreground">{headerTitle}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <span className="text-xs font-bold text-foreground">{user?.email?.charAt(0).toUpperCase()}</span>
            </div>
          </div>
        </header>

        {/* Mobile tab bar when store selected */}
        {selectedStoreId && (
          <div className="lg:hidden flex border-b border-border bg-background overflow-x-auto">
            <button
              onClick={onGoToStores}
              className="shrink-0 px-4 py-2.5 text-xs uppercase tracking-wide text-muted-foreground hover:text-foreground border-b-2 border-transparent"
            >
              ← Lojas
            </button>
            {TABS.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => onSelectStoreTab(id)}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-2.5 text-xs uppercase tracking-wide border-b-2 transition-all ${
                  storeTab === id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
        )}

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
