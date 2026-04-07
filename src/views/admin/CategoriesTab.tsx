import { useState } from "react";
import type { StoreCategory, StoreCategoryAddon } from "@/models/categoryModel";
import type { StoreProduct } from "@/models/productModel";
import { Plus, Trash2, Cherry } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface CategoriesTabProps {
  categories: StoreCategory[];
  categoryAddons: StoreCategoryAddon[];
  products: StoreProduct[];
  onCreateCategory: (name: string) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
  onCreateAddon: (categoryId: string, name: string, price: number) => Promise<void>;
  onDeleteAddon: (id: string) => Promise<void>;
}

export const CategoriesTab = ({
  categories,
  categoryAddons,
  products,
  onCreateCategory,
  onDeleteCategory,
  onCreateAddon,
  onDeleteAddon,
}: CategoriesTabProps) => {
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [addonDialogOpen, setAddonDialogOpen] = useState(false);
  const [addonCatId, setAddonCatId] = useState("");
  const [newAddonName, setNewAddonName] = useState("");
  const [newAddonPrice, setNewAddonPrice] = useState("");

  const handleCreateCategory = async () => {
    await onCreateCategory(newCatName);
    setNewCatName("");
    setCatDialogOpen(false);
  };

  const handleCreateAddon = async () => {
    await onCreateAddon(addonCatId, newAddonName, parseFloat(newAddonPrice) || 0);
    setNewAddonName("");
    setNewAddonPrice("");
    setAddonDialogOpen(false);
  };

  return (
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

      {categories.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-lg text-muted-foreground text-sm">Nenhuma categoria. Crie a primeira!</div>
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => {
            const addons = categoryAddons.filter(a => a.category_id === cat.id);
            return (
              <div key={cat.id} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">{cat.name}</h4>
                    <p className="text-[10px] text-muted-foreground">{products.filter(p => p.category_id === cat.id).length} produtos · {addons.length} adicionais</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => { setAddonCatId(cat.id); setAddonDialogOpen(true); }}>
                      <Cherry className="h-3 w-3 mr-1" /> Adicional
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => onDeleteCategory(cat.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                {addons.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {addons.map(addon => (
                      <span key={addon.id} className="inline-flex items-center gap-1 text-[10px] bg-secondary rounded-full px-2.5 py-1 text-muted-foreground">
                        {addon.name} · R$ {Number(addon.price).toFixed(2).replace(".", ",")}
                        <button onClick={() => onDeleteAddon(addon.id)} className="text-destructive hover:text-destructive/80 ml-1">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Addon Dialog */}
      <Dialog open={addonDialogOpen} onOpenChange={setAddonDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle className="font-display italic text-foreground">Novo Adicional</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Nome</Label>
              <Input value={newAddonName} onChange={(e) => setNewAddonName(e.target.value)} placeholder="Ex: Queijo extra" className="bg-secondary border-border text-foreground" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Preço (R$)</Label>
              <Input type="number" step="0.01" value={newAddonPrice} onChange={(e) => setNewAddonPrice(e.target.value)} placeholder="0.00" className="bg-secondary border-border text-foreground" />
            </div>
            <Button onClick={handleCreateAddon} className="w-full bg-primary text-primary-foreground text-xs uppercase tracking-widest">Criar Adicional</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
