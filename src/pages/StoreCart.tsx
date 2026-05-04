import { useNavigate, useParams, Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useCartController } from "@/controllers/useCartController";
import { Minus, Plus, Trash2, MessageCircle, Truck, ShoppingBag, UtensilsCrossed, Lock, ArrowLeft, Banknote, CreditCard, QrCode, Utensils, PenLine, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { OrderPreviewModal } from "@/components/menu/OrderPreviewModal";
import { OrderSuccessModal } from "@/components/menu/OrderSuccessModal";
import { ClearCartModal } from "@/components/menu/ClearCartModal";

function ItemNoteField({ index, notes, onUpdate }: { index: number; notes?: string; onUpdate: (i: number, n: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [value, setValue] = useState(notes || "");
  const ref = useRef<HTMLTextAreaElement>(null);
  const hasNote = value.trim().length > 0;

  const expand = () => {
    setExpanded(true);
    setTimeout(() => { ref.current?.focus(); ref.current?.scrollIntoView({ behavior: "smooth", block: "center" }); }, 100);
  };
  const blur = () => {
    onUpdate(index, value.trim());
    setExpanded(false);
  };

  if (!expanded && !hasNote) {
    return (
      <button type="button" onClick={expand} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors mt-2">
        <PlusCircle className="h-3.5 w-3.5" /> Adicionar observação
      </button>
    );
  }
  if (!expanded && hasNote) {
    return (
      <button type="button" onClick={expand} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors mt-2">
        <PenLine className="h-3.5 w-3.5" /> <span className="italic">{value}</span>
      </button>
    );
  }
  return (
    <div className="mt-2">
      <Textarea ref={ref} value={value} onChange={(e) => setValue(e.target.value)} onBlur={blur} placeholder="Ex: sem cebola, ponto da carne..." rows={2} className="text-xs" />
    </div>
  );
}

const StoreCart = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const c = useCartController(slug);
  const {
    store, cart, name, setName, phone, setPhone, address, setAddress,
    addressComplement, setAddressComplement,
    tableNumber, setTableNumber, orderType, setOrderType,
    paymentMethod, setPaymentMethod, needChange, setNeedChange, changeAmount, setChangeAmount,
    acceptedTerms, setAcceptedTerms,
    updateQty, removeItem, updateItemNotes, clearCart,
    subtotal, deliveryFee, total, isSending,
    showPreview, setShowPreview, showSuccess, setShowSuccess, showClearCart, setShowClearCart,
    orderNumber, orderMessage, validateAndPreview, handleConfirmOrder,
  } = c;

  // Redirect home if cart empty (after success this allows return)
  useEffect(() => {
    if (!showSuccess && cart.length === 0) {
      // Don't auto-redirect immediately; the empty UI shows a back link
    }
  }, [cart.length, showSuccess]);

  if (!store) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-pulse text-muted-foreground">Carregando...</div></div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="bg-card border-b border-border sticky top-0 z-30">
        <div className="container py-4 flex items-center gap-4">
          <Link to={`/r/${slug}`} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Link>
          <h1 className="text-xl font-display font-semibold text-foreground">Meu Carrinho</h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-52">
        <div className="container py-6 max-w-3xl">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border border-border rounded-lg bg-card">
              <ShoppingBag className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>Seu carrinho está vazio</p>
              <Link to={`/r/${slug}`} className="text-primary text-sm hover:underline mt-2 inline-block">Voltar ao cardápio</Link>
            </div>
          ) : (
            <div className="space-y-4 mb-8">
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={() => setShowClearCart(true)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4 mr-2" /> Limpar Carrinho
                </Button>
              </div>

              {cart.map((item, index) => {
                const unitPrice = Number(item.selectedSize.price) + item.addons.reduce((a, addon) => a + Number(addon.price), 0);
                return (
                  <div key={`${item.product.id}-${item.selectedSize.id}-${index}`} className="bg-card border border-border rounded-lg p-4 flex gap-4">
                    {item.product.image_url ? (
                      <img src={item.product.image_url} alt={item.product.name} className="w-20 h-20 object-cover rounded-lg" />
                    ) : (
                      <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                        <Utensils className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {item.product.name}
                        {item.selectedSize.name && item.selectedSize.name !== "Único" && ` (${item.selectedSize.name})`}
                      </h3>
                      <p className="text-primary font-bold">R$ {(unitPrice * item.quantity).toFixed(2).replace(".", ",")}</p>
                      {item.addons.length > 0 && (
                        <div className="mt-1 space-y-0.5">
                          {item.addons.map((a) => (
                            <p key={a.id} className="text-xs text-muted-foreground">+ {a.name}</p>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateQty(index, -1)}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-medium text-foreground">{item.quantity}</span>
                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateQty(index, 1)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive ml-auto" onClick={() => removeItem(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <ItemNoteField index={index} notes={item.notes} onUpdate={updateItemNotes} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {cart.length > 0 && (
            <form onSubmit={(e) => { e.preventDefault(); validateAndPreview(); }} className="space-y-8">
              {/* Personal data */}
              <section>
                <h2 className="text-lg font-display font-semibold text-foreground mb-4">Informações Pessoais</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome *</Label>
                    <Input placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>WhatsApp</Label>
                    <Input placeholder="(00) 00000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                </div>
              </section>

              {/* Order type */}
              <section>
                <h2 className="text-lg font-display font-semibold text-foreground mb-4">Tipo de Pedido</h2>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { type: "delivery" as const, label: "Entrega", icon: Truck },
                    { type: "pickup" as const, label: "Retirada", icon: ShoppingBag },
                    { type: "dine_in" as const, label: "Na Mesa", icon: UtensilsCrossed },
                  ].map(({ type, label, icon: Icon }) => (
                    <button type="button" key={type} onClick={() => setOrderType(type)} className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all ${orderType === type ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:border-primary/30"}`}>
                      <Icon className="h-6 w-6" />
                      <span className="text-xs font-semibold uppercase tracking-widest">{label}</span>
                    </button>
                  ))}
                </div>

                {orderType === "delivery" && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label>Endereço de Entrega *</Label>
                      <Input placeholder="Rua, número, bairro..." value={address} onChange={(e) => setAddress(e.target.value)} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Complemento</Label>
                      <Input placeholder="Apto, bloco, referência..." value={addressComplement} onChange={(e) => setAddressComplement(e.target.value)} />
                    </div>
                  </div>
                )}
                {orderType === "dine_in" && (
                  <div className="mt-4 space-y-2">
                    <Label>Número da Mesa *</Label>
                    <Input placeholder="Ex: 5" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} />
                  </div>
                )}
              </section>

              {/* Payment */}
              <section>
                <h2 className="text-lg font-display font-semibold text-foreground mb-4">Forma de Pagamento</h2>
                <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { value: "pix" as const, label: "PIX", icon: QrCode },
                    { value: "cash" as const, label: "Dinheiro", icon: Banknote },
                    { value: "card" as const, label: "Cartão", icon: CreditCard },
                  ].map(({ value, label, icon: Icon }) => (
                    <div key={value} className="flex items-center">
                      <RadioGroupItem value={value} id={`pay-${value}`} className="peer sr-only" />
                      <Label htmlFor={`pay-${value}`} className="flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border border-border bg-card cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:text-primary transition-all text-sm font-semibold uppercase tracking-widest">
                        <Icon className="h-5 w-5" /> {label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                {paymentMethod === "cash" && (
                  <div className="mt-4 space-y-3 p-4 bg-muted/40 rounded-lg border border-border">
                    <div className="flex items-center gap-2">
                      <Checkbox id="need-change" checked={needChange} onCheckedChange={(v) => setNeedChange(!!v)} />
                      <Label htmlFor="need-change" className="cursor-pointer">Vou precisar de troco</Label>
                    </div>
                    {needChange && (
                      <div className="space-y-2">
                        <Label>Troco para quanto?</Label>
                        <Input type="number" min="0" step="0.01" placeholder="Ex: 50.00" value={changeAmount} onChange={(e) => setChangeAmount(e.target.value)} />
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* Summary */}
              <section className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-lg font-display font-semibold text-foreground mb-4">Resumo</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="text-foreground">R$ {subtotal.toFixed(2).replace(".", ",")}</span></div>
                  {orderType === "delivery" && (
                    <div className="flex justify-between"><span className="text-muted-foreground">Entrega</span><span className="text-foreground">R$ {deliveryFee.toFixed(2).replace(".", ",")}</span></div>
                  )}
                  <div className="border-t border-border pt-3 flex justify-between">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="text-2xl font-bold text-primary">R$ {total.toFixed(2).replace(".", ",")}</span>
                  </div>
                </div>
              </section>

              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <Checkbox id="terms" checked={acceptedTerms} onCheckedChange={(v) => setAcceptedTerms(!!v)} className="mt-0.5" />
                <Label htmlFor="terms" className="cursor-pointer leading-snug">
                  Li e aceito a <Link to="/privacidade" className="text-primary underline">Política de Privacidade</Link> e os <Link to="/termos" className="text-primary underline">Termos de Uso</Link>.
                </Label>
              </div>

              <Button type="submit" disabled={isSending} className="w-full py-6 text-base font-semibold">
                <MessageCircle className="mr-2 h-5 w-5" /> Revisar e Enviar pelo WhatsApp
              </Button>
              <p className="text-center text-[10px] text-muted-foreground uppercase tracking-widest flex items-center justify-center gap-1">
                <Lock className="h-3 w-3" /> Comunicação segura
              </p>
            </form>
          )}
        </div>
      </div>

      <ClearCartModal open={showClearCart} onOpenChange={setShowClearCart} onConfirm={clearCart} />
      <OrderPreviewModal open={showPreview} onOpenChange={setShowPreview} message={orderMessage} onConfirm={handleConfirmOrder} estimatedTime={store.estimated_delivery_time} orderType={orderType} isSending={isSending} />
      <OrderSuccessModal open={showSuccess} onClose={() => { setShowSuccess(false); navigate(`/r/${slug}`); }} orderNumber={orderNumber} pixKey={store.pix_key} whatsappNumber={store.whatsapp} total={total} paymentMethod={paymentMethod} />
    </div>
  );
};

export default StoreCart;
