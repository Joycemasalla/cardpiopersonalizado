import type { Store } from "@/types/store";
import { Plus, Copy, Eye, ChevronRight, Store as StoreIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface StoreListProps {
  stores: Store[];
  onSelectStore: (id: string) => void;
  onOpenCreateDialog: () => void;
}

export const StoreList = ({ stores, onSelectStore, onOpenCreateDialog }: StoreListProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">Gerencie todas as lojas / clientes.</p>
        <Button onClick={onOpenCreateDialog} className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs">
          <Plus className="h-4 w-4 mr-1" /> Novo Cardápio
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stores.map((store) => (
          <div
            key={store.id}
            className="bg-card border border-border rounded-lg p-5 hover:border-primary/30 transition-all cursor-pointer group"
            onClick={() => onSelectStore(store.id)}
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
  );
};
