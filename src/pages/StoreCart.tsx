import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Store } from "@/types/store";
import { ArrowLeft, Minus, Plus, Trash2, MessageCircle, Truck, ShoppingBag, UtensilsCrossed, Lock } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface CartPageItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  quantity: number;
}

const StoreCart = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: store } = useQuery({
    queryKey: ["store", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data as Store;
    },
    enabled: !!slug,
  });

  // Demo cart items for now
  const [items, setItems] = useState<CartPageItem[]>([
    { id: "1", name: "Exemplo de Produto", description: "Descrição do produto", price: 34, image_url: null, quantity: 1 },
  ]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [orderType, setOrderType] = useState<"delivery" | "pickup" | "dine_in">("delivery");

  const updateQty = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id: string) => setItems((prev) => prev.filter((item) => item.id !== id));

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = orderType === "delivery" ? (store?.delivery_fee || 5) : 0;
  const total = subtotal + deliveryFee;

  const handleWhatsAppOrder = () => {
    if (!name.trim()) {
      toast.error("Informe seu nome");
      return;
    }
    if (!store?.whatsapp) {
      toast.error("WhatsApp não configurado");
      return;
    }

    const orderTypeLabel = { delivery: "Entrega", pickup: "Retirada", dine_in: "Mesa" }[orderType];
    const itemsText = items.map((item) => `• ${item.quantity}x ${item.name} — R$ ${(item.price * item.quantity).toFixed(2).replace(".", ",")}`).join("\n");

    const message = `🛒 *Novo Pedido — ${store.name}*\n\n👤 ${name}\n📱 ${phone || "Não informado"}\n📍 ${orderTypeLabel}\n\n${itemsText}\n\n💰 Subtotal: R$ ${subtotal.toFixed(2).replace(".", ",")}\n🚚 Entrega: R$ ${deliveryFee.toFixed(2).replace(".", ",")}\n✅ *Total: R$ ${total.toFixed(2).replace(".", ",")}*`;

    const url = `https://wa.me/${store.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="flex items-center justify-between h-14 px-4 lg:px-8">
          <div className="flex items-center gap-3">
            {store.logo_url && <img src={store.logo_url} alt={store.name} className="w-8 h-8 rounded-md object-cover" />}
            <span className="font-display text-lg font-bold italic text-primary">{store.name}</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link to={`/r/${slug}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Categorias</Link>
            <span className="text-sm text-muted-foreground">Sobre</span>
          </nav>
          <div className="flex items-center gap-2 text-primary text-sm font-medium">
            <ShoppingBag className="h-4 w-4" />
            Carrinho ({items.reduce((s, i) => s + i.quantity, 0)})
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest mb-2">
          <Link to={`/r/${slug}`} className="hover:text-primary transition-colors">Cardápio</Link>
          <span>›</span>
          <span className="text-primary">Checkout</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-bold italic text-foreground mb-8">Sua Seleção</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Cart items */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-display font-semibold text-foreground">Itens do Carrinho</h2>
                <span className="text-sm text-muted-foreground">{items.reduce((s, i) => s + i.quantity, 0)} itens selecionados</span>
              </div>
              <div className="space-y-4">
                {items.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground border border-border rounded-lg bg-card">
                    <ShoppingBag className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p>Seu carrinho está vazio</p>
                    <Link to={`/r/${slug}`} className="text-primary text-sm hover:underline mt-2 inline-block">Voltar ao cardápio</Link>
                  </div>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg">
                      <div className="w-20 h-20 rounded-md bg-secondary shrink-0 overflow-hidden">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">Sem img</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-semibold text-foreground">{item.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                      </div>
                      <span className="text-primary font-bold text-sm">R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}</span>
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1 bg-secondary rounded-md">
                          <button onClick={() => updateQty(item.id, -1)} className="px-2 py-1 text-foreground hover:text-primary transition-colors">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-sm font-medium w-6 text-center text-foreground">{item.quantity}</span>
                          <button onClick={() => updateQty(item.id, 1)} className="px-2 py-1 text-foreground hover:text-primary transition-colors">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="text-destructive hover:text-destructive/80 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Personal info */}
            <div>
              <h2 className="text-lg font-display font-semibold text-foreground mb-4">Informações Pessoais</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Nome Completo</Label>
                  <Input
                    placeholder="ex: João Silva"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">WhatsApp / Telefone</Label>
                  <Input
                    placeholder="(00) 00000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Order type */}
            <div>
              <h2 className="text-lg font-display font-semibold text-foreground mb-4">Opção de Pedido</h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { type: "delivery" as const, label: "Entrega", icon: Truck },
                  { type: "pickup" as const, label: "Retirada", icon: ShoppingBag },
                  { type: "dine_in" as const, label: "Na Mesa", icon: UtensilsCrossed },
                ].map(({ type, label, icon: Icon }) => (
                  <button
                    key={type}
                    onClick={() => setOrderType(type)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all ${
                      orderType === type
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-xs font-semibold uppercase tracking-widest">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right column - Order summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-lg font-display font-semibold text-foreground mb-4">Resumo do Pedido</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">R$ {subtotal.toFixed(2).replace(".", ",")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taxa de entrega</span>
                    <span className="text-foreground">R$ {deliveryFee.toFixed(2).replace(".", ",")}</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="text-2xl font-bold text-primary">R$ {total.toFixed(2).replace(".", ",")}</span>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-primary/20 rounded-lg p-4 flex items-start gap-3">
                <MessageCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Pedidos são finalizados via WhatsApp para confirmação em tempo real.
                </p>
              </div>

              <Button
                onClick={handleWhatsAppOrder}
                disabled={items.length === 0}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-base font-semibold"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Enviar Pedido pelo WhatsApp
              </Button>

              <p className="text-center text-[10px] text-muted-foreground uppercase tracking-widest flex items-center justify-center gap-1">
                <Lock className="h-3 w-3" />
                Comunicação segura e criptografada
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreCart;
