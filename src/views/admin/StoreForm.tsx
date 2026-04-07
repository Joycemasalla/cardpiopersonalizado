import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { CreateStoreData } from "@/models/storeModel";

interface StoreFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateStoreData) => Promise<void>;
}

export const StoreForm = ({ open, onOpenChange, onSubmit }: StoreFormProps) => {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [colorPrimary, setColorPrimary] = useState("#D4A843");
  const [colorSecondary, setColorSecondary] = useState("#1a1a2e");
  const [colorBg, setColorBg] = useState("#0d0d0d");
  const [colorText, setColorText] = useState("#f5f5f5");

  const handleSubmit = async () => {
    await onSubmit({
      name,
      slug,
      whatsapp: whatsapp || null,
      color_primary: colorPrimary,
      color_secondary: colorSecondary,
      color_background: colorBg,
      color_text: colorText,
    });
    setName(""); setSlug(""); setWhatsapp("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border">
        <DialogHeader><DialogTitle className="font-display italic text-foreground">Criar Novo Cardápio</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Nome da Loja</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Espaço Imperial" className="bg-secondary border-border text-foreground" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Slug da URL</Label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="espaco-imperial" className="bg-secondary border-border text-foreground" />
            <p className="text-[10px] text-muted-foreground">Link: /r/{slug || "slug"}</p>
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">WhatsApp</Label>
            <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="5511999999999" className="bg-secondary border-border text-foreground" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Cor Principal", val: colorPrimary, set: setColorPrimary },
              { label: "Cor Secundária", val: colorSecondary, set: setColorSecondary },
              { label: "Cor de Fundo", val: colorBg, set: setColorBg },
              { label: "Cor do Texto", val: colorText, set: setColorText },
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
          <Button onClick={handleSubmit} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-xs uppercase tracking-widest">Criar Cardápio</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
