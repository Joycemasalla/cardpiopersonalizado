import type { Store } from "@/types/store";
import { Upload, Image as ImageIcon, ToggleLeft, ToggleRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StoreConfigTabProps {
  store: Store;
  onUpdate: (id: string, fields: Record<string, unknown>) => Promise<void>;
  onUploadImage: (file: File, path: string) => Promise<string | null>;
  onToggleOpen: (store: Store) => Promise<void>;
}

export const StoreConfigTab = ({ store, onUpdate, onUploadImage, onToggleOpen }: StoreConfigTabProps) => {
  const handleFileUpload = async (file: File, path: string, field: string) => {
    const url = await onUploadImage(file, path);
    if (url) await onUpdate(store.id, { [field]: url });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-6">
      {/* Logo */}
      <div className="flex items-center gap-4 mb-2">
        <div className="relative group">
          {store.logo_url ? (
            <img src={store.logo_url} alt="" className="w-16 h-16 rounded-lg object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-lg flex items-center justify-center bg-secondary"><ImageIcon className="h-6 w-6 text-muted-foreground" /></div>
          )}
          <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <Upload className="h-5 w-5 text-white" />
            <input type="file" accept="image/*" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file, `logos/${store.id}`, "logo_url");
            }} />
          </label>
        </div>
        <div>
          <h2 className="text-xl font-display font-bold italic text-foreground">{store.name}</h2>
          <p className="text-xs text-muted-foreground">/r/{store.slug}</p>
        </div>
      </div>

      {/* Banner */}
      <div className="space-y-2">
        <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Banner da Loja</h3>
        <div className="relative group rounded-lg overflow-hidden border border-border h-32">
          {store.banner_url ? (
            <img src={store.banner_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-secondary flex items-center justify-center"><ImageIcon className="h-8 w-8 text-muted-foreground" /></div>
          )}
          <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <Upload className="h-6 w-6 text-white" />
            <input type="file" accept="image/*" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file, `banners/${store.id}`, "banner_url");
            }} />
          </label>
        </div>
      </div>

      {/* Colors */}
      <div>
        <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">Cores da Marca</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {([
            { label: "Principal", field: "color_primary", value: store.color_primary },
            { label: "Secundária", field: "color_secondary", value: store.color_secondary },
            { label: "Fundo", field: "color_background", value: store.color_background },
            { label: "Texto", field: "color_text", value: store.color_text },
          ] as const).map(({ label, field, value }) => (
            <div key={field} className="space-y-1">
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</Label>
              <div className="flex items-center gap-2">
                <input type="color" defaultValue={value} onBlur={(e) => {
                  if (e.target.value !== value) onUpdate(store.id, { [field]: e.target.value });
                }} className="w-8 h-8 rounded border-0 cursor-pointer" />
                <span className="text-[10px] text-muted-foreground font-mono">{value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">WhatsApp</Label>
          <Input defaultValue={store.whatsapp || ""} onBlur={(e) => onUpdate(store.id, { whatsapp: e.target.value || null })} placeholder="5511999999999" className="bg-secondary border-border text-foreground" />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Taxa de Entrega (R$)</Label>
          <Input type="number" step="0.01" defaultValue={store.delivery_fee ?? 0} onBlur={(e) => onUpdate(store.id, { delivery_fee: parseFloat(e.target.value) || 0 })} className="bg-secondary border-border text-foreground" />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Texto do Banner</Label>
        <Input defaultValue={store.banner_text || ""} onBlur={(e) => onUpdate(store.id, { banner_text: e.target.value || null })} placeholder="Ex: 🔥 Promoção de inauguração!" className="bg-secondary border-border text-foreground" />
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Endereço</Label>
        <Input defaultValue={store.address || ""} onBlur={(e) => onUpdate(store.id, { address: e.target.value || null })} placeholder="Ex: Rua das Flores, 123 - Centro" className="bg-secondary border-border text-foreground" />
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Mensagem de Loja Fechada</Label>
        <Input defaultValue={store.closed_message || ""} onBlur={(e) => onUpdate(store.id, { closed_message: e.target.value || null })} placeholder="Estamos fechados no momento." className="bg-secondary border-border text-foreground" />
      </div>

      {/* Toggle open/closed */}
      <div className="flex items-center gap-3">
        <button onClick={() => onToggleOpen(store)}>
          {store.is_open ? <ToggleRight className="h-6 w-6 text-primary" /> : <ToggleLeft className="h-6 w-6 text-muted-foreground" />}
        </button>
        <span className="text-sm text-foreground">{store.is_open ? "Loja Aberta" : "Loja Fechada"}</span>
      </div>
    </div>
  );
};
