import { ReactNode } from "react";
import {
  LogOut, Store as StoreIcon, Settings, Layers, Package, ClipboardList, ChevronRight,
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

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b border-border px-4 lg:px-8 h-14 flex items-center justify-between shrink-0">
          <h1 className="text-lg font-display font-bold italic text-foreground">{headerTitle}</h1>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <span className="text-xs font-bold text-foreground">{user?.email?.charAt(0).toUpperCase()}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
