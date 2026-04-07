import { useParams, Link } from "react-router-dom";
import { useCartController } from "@/controllers/useCartController";
import { Minus, Plus, Trash2, MessageCircle, Truck, ShoppingBag, UtensilsCrossed, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const StoreCart = () => {
  const { slug } = useParams<{ slug: string }>();
  const {
    store, cart, name, setName, phone, setPhone, address, setAddress,
    tableNumber, setTableNumber, orderType, setOrderType,
    updateQty, removeItem, subtotal, deliveryFee, total, handleWhatsAppOrder,
  } = useCartController(slug);

  if (!store) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-pulse text-muted-foreground">Carregando...</div></div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="flex items-center justify-between h-14 px-4 lg:px-8">
          <div className="flex items-center gap-3">
            {store.logo_url && <img src={store.logo_url} alt={store.name} className="w-8 h-8 rounded-md object-cover" />}
            <span className="font-display text-lg font-bold italic text-primary">{store.name}</span>
          </div>
          <Link to={`/r/${slug}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">← Voltar ao cardápio</Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
        <h1 className="text-3xl font-display font-bold italic text-foreground mb-8">Sua Seleção</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border border-border rounded-lg bg-card">
                  <ShoppingBag className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p>Seu carrinho está vazio</p>
                  <Link to={`/r/${slug}`} className="text-primary text-sm hover:underline mt-2 inline-block">Voltar ao cardápio</Link>
                </div>
              ) : (
                cart.map((item, index) => (
                  <div key={`${item.product.id}-${item.selectedSize.id}-${index}`} className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg">
                    {item.product.image_url && <img src={item.product.image_url} alt="" className="w-16 h-16 rounded-md object-cover hidden sm:block" />}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-foreground">{item.product.name}</h3>
                      <p className="text-xs text-muted-foreground">{item.selectedSize.name}{item.addons.length > 0 ? ` · ${item.addons.map(a => a.name).join(", ")}` : ""}</p>
                      {item.notes && <p className="text-[10px] text-muted-foreground mt-0.5">📝 {item.notes}</p>}
                    </div>
                    <span className="text-primary font-bold text-sm">
                      R$ {((Number(item.selectedSize.price) + item.addons.reduce((a, addon) => a + Number(addon.price), 0)) * item.quantity).toFixed(2).replace(".", ",")}
                    </span>
                    <div className="flex items-center gap-1 bg-secondary rounded-md">
                      <button onClick={() => updateQty(index, -1)} className="px-2 py-1 text-foreground hover:text-primary"><Minus className="h-3 w-3" /></button>
                      <span className="text-sm font-medium w-6 text-center text-foreground">{item.quantity}</span>
                      <button onClick={() => updateQty(index, 1)} className="px-2 py-1 text-foreground hover:text-primary"><Plus className="h-3 w-3" /></button>
                    </div>
                    <button onClick={() => removeItem(index)} className="text-destructive hover:text-destructive/80"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                ))
              )}
            </div>

            <div>
              <h2 className="text-lg font-display font-semibold text-foreground mb-4">Informações Pessoais</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Nome *</Label>
                  <Input placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} className="bg-secondary border-border text-foreground" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">WhatsApp</Label>
                  <Input placeholder="(00) 00000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-secondary border-border text-foreground" />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-display font-semibold text-foreground mb-4">Tipo de Pedido</h2>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { type: "delivery" as const, label: "Entrega", icon: Truck },
                  { type: "pickup" as const, label: "Retirada", icon: ShoppingBag },
                  { type: "dine_in" as const, label: "Na Mesa", icon: UtensilsCrossed },
                ]).map(({ type, label, icon: Icon }) => (
                  <button key={type} onClick={() => setOrderType(type)} className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all ${orderType === type ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:border-primary/30"}`}>
                    <Icon className="h-6 w-6" />
                    <span className="text-xs font-semibold uppercase tracking-widest">{label}</span>
                  </button>
                ))}
              </div>
              {orderType === "delivery" && (
                <div className="mt-4 space-y-2">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Endereço de Entrega *</Label>
                  <Input placeholder="Rua, número, bairro..." value={address} onChange={(e) => setAddress(e.target.value)} className="bg-secondary border-border text-foreground" />
                </div>
              )}
              {orderType === "dine_in" && (
                <div className="mt-4 space-y-2">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Número da Mesa *</Label>
                  <Input placeholder="Ex: 5" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} className="bg-secondary border-border text-foreground" />
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-lg font-display font-semibold text-foreground mb-4">Resumo</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="text-foreground">R$ {subtotal.toFixed(2).replace(".", ",")}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Entrega</span><span className="text-foreground">R$ {deliveryFee.toFixed(2).replace(".", ",")}</span></div>
                  <div className="border-t border-border pt-3 flex justify-between"><span className="font-semibold text-foreground">Total</span><span className="text-2xl font-bold text-primary">R$ {total.toFixed(2).replace(".", ",")}</span></div>
                </div>
              </div>
              <Button onClick={handleWhatsAppOrder} disabled={cart.length === 0} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-base font-semibold">
                <MessageCircle className="mr-2 h-5 w-5" /> Enviar pelo WhatsApp
              </Button>
              <p className="text-center text-[10px] text-muted-foreground uppercase tracking-widest flex items-center justify-center gap-1">
                <Lock className="h-3 w-3" /> Comunicação segura
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreCart;
