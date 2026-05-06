import { useState } from "react";
import type { StoreCategory } from "@/models/categoryModel";
import type { StoreProduct, StoreVariation } from "@/models/productModel";
import { Plus, Trash2, Upload, Image as ImageIcon, ToggleLeft, ToggleRight, Pencil, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PRODUCT_BADGE_LIST, getProductBadge } from "@/lib/productBadges";
import { ProductBadge } from "@/components/menu/ProductBadge";

interface ProductsTabProps {
  categories: StoreCategory[];
  products: StoreProduct[];
  variations: StoreVariation[];
  onCreateProduct: (data: { categoryId: string; name: string; description?: string; price: number; imageFile?: File | null; badge?: string | null }) => Promise<void>;
  onUpdateProduct: (id: string, fields: Partial<StoreProduct>) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onToggleProduct: (id: string, currentActive: boolean) => Promise<void>;
  onUploadProductImage: (productId: string, file: File) => Promise<void>;
  onCreateVariation: (productId: string, name: string, price: number) => Promise<void>;
  onDeleteVariation: (id: string) => Promise<void>;
}

export const ProductsTab = ({
  categories,
  products,
  variations,
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct,
  onToggleProduct,
  onUploadProductImage,
  onCreateVariation,
  onDeleteVariation,
}: ProductsTabProps) => {
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCatId, setNewCatId] = useState("");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newBadge, setNewBadge] = useState<string>("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCatId, setEditCatId] = useState("");
  const [editBadge, setEditBadge] = useState<string>("");

  const [varDialogOpen, setVarDialogOpen] = useState(false);
  const [varProductId, setVarProductId] = useState("");
  const [newVarName, setNewVarName] = useState("");
  const [newVarPrice, setNewVarPrice] = useState("");

  const startEdit = (p: StoreProduct) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditDesc(p.description || "");
    setEditPrice(String(p.price));
    setEditCatId(p.category_id);
    setEditBadge(p.badge || "");
  };

  const handleCreate = async () => {
    await onCreateProduct({
      categoryId: newCatId,
      name: newName,
      description: newDesc,
      price: parseFloat(newPrice) || 0,
      imageFile: newImageFile,
      badge: newBadge || null,
    });
    setNewName(""); setNewDesc(""); setNewPrice(""); setNewCatId(""); setNewImageFile(null); setNewBadge("");
    setProductDialogOpen(false);
  };

  const handleSave = async () => {
    if (!editingId) return;
    await onUpdateProduct(editingId, {
      name: editName,
      description: editDesc || null,
      price: parseFloat(editPrice) || 0,
      category_id: editCatId,
      badge: editBadge || null,
    });
    setEditingId(null);
  };

  const handleCreateVar = async () => {
    await onCreateVariation(varProductId, newVarName, parseFloat(newVarPrice) || 0);
    setNewVarName(""); setNewVarPrice("");
    setVarDialogOpen(false);
  };

  return (
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
                <select value={newCatId} onChange={(e) => setNewCatId(e.target.value)} className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground">
                  <option value="">Selecione...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Nome</Label>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ex: Açaí 500ml" className="bg-secondary border-border text-foreground" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Descrição</Label>
                <Textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Descrição opcional..." className="bg-secondary border-border text-foreground" rows={2} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Preço Base (R$)</Label>
                <Input type="number" step="0.01" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} placeholder="0.00" className="bg-secondary border-border text-foreground" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Selo</Label>
                <select value={newBadge} onChange={(e) => setNewBadge(e.target.value)} className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground">
                  <option value="">Sem selo</option>
                  {PRODUCT_BADGE_LIST.map(b => <option key={b.key} value={b.key}>{b.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Imagem do Produto</Label>
                <div className="flex items-center gap-3">
                  {newImageFile && <img src={URL.createObjectURL(newImageFile)} alt="" className="w-12 h-12 rounded-md object-cover" />}
                  <label className="flex items-center gap-2 px-3 py-2 bg-secondary border border-border rounded-md cursor-pointer hover:bg-muted transition-colors">
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{newImageFile ? "Trocar" : "Upload"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setNewImageFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
              </div>
              <Button onClick={handleCreate} className="w-full bg-primary text-primary-foreground text-xs uppercase tracking-widest">Criar Produto</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-lg text-muted-foreground text-sm">Crie categorias primeiro antes de adicionar produtos.</div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-lg text-muted-foreground text-sm">Nenhum produto. Adicione o primeiro!</div>
      ) : (
        categories.map(cat => {
          const catProducts = products.filter(p => p.category_id === cat.id);
          if (catProducts.length === 0) return null;
          return (
            <div key={cat.id} className="space-y-3">
              <h4 className="text-xs uppercase tracking-widest text-primary font-semibold">{cat.name}</h4>
              {catProducts.map(product => {
                const productVars = variations.filter(v => v.product_id === product.id);
                const isEditing = editingId === product.id;
                return (
                  <div key={product.id} className={`bg-card border rounded-lg p-4 transition-all ${product.is_active ? "border-border" : "border-border opacity-50"}`}>
                    <div className="flex items-start gap-3">
                      <div className="relative group flex-shrink-0">
                        {product.image_url ? (
                          <img src={product.image_url} alt="" className="w-12 h-12 rounded-md object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-md bg-secondary flex items-center justify-center"><ImageIcon className="h-4 w-4 text-muted-foreground" /></div>
                        )}
                        <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                          <Upload className="h-3.5 w-3.5 text-white" />
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) onUploadProductImage(product.id, file);
                          }} />
                        </label>
                      </div>

                      {isEditing ? (
                        <div className="flex-1 space-y-2">
                          <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="bg-secondary border-border text-foreground text-sm h-8" />
                          <Textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="bg-secondary border-border text-foreground text-xs" rows={2} />
                          <div className="flex gap-2">
                            <Input type="number" step="0.01" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="bg-secondary border-border text-foreground text-sm h-8 w-28" />
                            <select value={editCatId} onChange={(e) => setEditCatId(e.target.value)} className="bg-secondary border border-border rounded-md px-2 py-1 text-xs text-foreground">
                              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <select value={editBadge} onChange={(e) => setEditBadge(e.target.value)} className="bg-secondary border border-border rounded-md px-2 py-1 text-xs text-foreground">
                              <option value="">Sem selo</option>
                              {PRODUCT_BADGE_LIST.map(b => <option key={b.key} value={b.key}>{b.label}</option>)}
                            </select>
                          </div>
                          <div className="flex gap-1.5">
                            <Button size="sm" className="h-7 text-[10px]" onClick={handleSave}><Check className="h-3 w-3 mr-1" />Salvar</Button>
                            <Button size="sm" variant="ghost" className="h-7 text-[10px]" onClick={() => setEditingId(null)}><X className="h-3 w-3 mr-1" />Cancelar</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground">{product.name}</p>
                            <span className="text-xs text-primary font-mono">R$ {Number(product.price).toFixed(2).replace(".", ",")}</span>
                            {product.badge && <ProductBadge badge={product.badge} />}
                          </div>
                          {product.description && <p className="text-[10px] text-muted-foreground truncate">{product.description}</p>}
                        </div>
                      )}

                      {!isEditing && (
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button onClick={() => startEdit(product)} className="p-1.5 rounded-md hover:bg-secondary transition-colors">
                            <Pencil className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                          </button>
                          <Button variant="outline" size="sm" className="text-[10px] h-7" onClick={() => { setVarProductId(product.id); setVarDialogOpen(true); }}>
                            + Variação
                          </Button>
                          <button onClick={() => onToggleProduct(product.id, product.is_active)}>
                            {product.is_active ? <ToggleRight className="h-5 w-5 text-primary" /> : <ToggleLeft className="h-5 w-5 text-muted-foreground" />}
                          </button>
                          <button onClick={() => onDeleteProduct(product.id)} className="text-destructive hover:text-destructive/80 p-1">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                    {productVars.length > 0 && (
                      <div className="mt-3 ml-15 flex flex-wrap gap-2">
                        {productVars.map(v => (
                          <span key={v.id} className="inline-flex items-center gap-1 text-[10px] bg-secondary rounded-full px-2.5 py-1 text-muted-foreground">
                            {v.name} · R$ {Number(v.price).toFixed(2).replace(".", ",")}
                            <button onClick={() => onDeleteVariation(v.id)} className="text-destructive hover:text-destructive/80 ml-1">×</button>
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

      {/* Variation Dialog */}
      <Dialog open={varDialogOpen} onOpenChange={setVarDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle className="font-display italic text-foreground">Nova Variação</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Nome</Label>
              <Input value={newVarName} onChange={(e) => setNewVarName(e.target.value)} placeholder="Ex: 500ml, Grande..." className="bg-secondary border-border text-foreground" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Preço (R$)</Label>
              <Input type="number" step="0.01" value={newVarPrice} onChange={(e) => setNewVarPrice(e.target.value)} placeholder="0.00" className="bg-secondary border-border text-foreground" />
            </div>
            <Button onClick={handleCreateVar} className="w-full bg-primary text-primary-foreground text-xs uppercase tracking-widest">Criar Variação</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
