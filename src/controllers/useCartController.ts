import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { storeModel } from "@/models/storeModel";
import { CART_KEY } from "@/lib/constants";
import type { Store, CartItem } from "@/types/store";
import { toast } from "sonner";

export function useCartController(slug: string | undefined) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [orderType, setOrderType] = useState<"delivery" | "pickup" | "dine_in">("delivery");

  const { data: store } = useQuery({
    queryKey: ["store", slug],
    queryFn: () => storeModel.fetchBySlug(slug!),
    enabled: !!slug,
  });

  useEffect(() => {
    if (!slug) return;
    try {
      const saved = localStorage.getItem(CART_KEY(slug));
      if (saved) setCart(JSON.parse(saved));
    } catch {}
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    localStorage.setItem(CART_KEY(slug), JSON.stringify(cart));
  }, [cart, slug]);

  const updateQty = (index: number, delta: number) => {
    setCart(prev => prev.map((item, i) => i === index ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item).filter(item => item.quantity > 0));
  };

  const removeItem = (index: number) => setCart(prev => prev.filter((_, i) => i !== index));

  const subtotal = cart.reduce((sum, item) => sum + (Number(item.selectedSize.price) + item.addons.reduce((a, addon) => a + Number(addon.price), 0)) * item.quantity, 0);
  const deliveryFee = orderType === "delivery" ? Number(store?.delivery_fee || 0) : 0;
  const total = subtotal + deliveryFee;

  const handleWhatsAppOrder = () => {
    if (!name.trim()) { toast.error("Informe seu nome"); return; }
    if (orderType === "delivery" && !address.trim()) { toast.error("Informe o endereço de entrega"); return; }
    if (orderType === "dine_in" && !tableNumber.trim()) { toast.error("Informe o número da mesa"); return; }
    if (!store?.whatsapp) { toast.error("WhatsApp não configurado"); return; }

    const orderTypeLabel = { delivery: "🚚 Entrega", pickup: "🏪 Retirada", dine_in: "🍽️ Na Mesa" }[orderType];
    const itemsText = cart.map(item => {
      let line = `• ${item.quantity}x ${item.product.name} (${item.selectedSize.name})`;
      if (item.addons.length > 0) line += ` + ${item.addons.map(a => a.name).join(", ")}`;
      line += ` — R$ ${((Number(item.selectedSize.price) + item.addons.reduce((a, addon) => a + Number(addon.price), 0)) * item.quantity).toFixed(2).replace(".", ",")}`;
      if (item.notes) line += `\n  📝 ${item.notes}`;
      return line;
    }).join("\n");

    const message = `🛒 *Novo Pedido — ${store.name}*\n\n👤 *Nome:* ${name}\n📱 *Tel:* ${phone || "Não informado"}\n${orderTypeLabel}${orderType === "delivery" ? `\n📍 *Endereço:* ${address}` : ""}${orderType === "dine_in" ? `\n🪑 *Mesa:* ${tableNumber}` : ""}\n\n─────────────────\n${itemsText}\n─────────────────\n\n💰 Subtotal: R$ ${subtotal.toFixed(2).replace(".", ",")}\n🚚 Entrega: R$ ${deliveryFee.toFixed(2).replace(".", ",")}\n✅ *TOTAL: R$ ${total.toFixed(2).replace(".", ",")}*`;

    window.open(`https://wa.me/${store.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`, "_blank");

    setCart([]);
    localStorage.removeItem(CART_KEY(slug!));
    toast.success("Pedido enviado pelo WhatsApp!");
  };

  return {
    store,
    cart,
    name, setName,
    phone, setPhone,
    address, setAddress,
    tableNumber, setTableNumber,
    orderType, setOrderType,
    updateQty,
    removeItem,
    subtotal,
    deliveryFee,
    total,
    handleWhatsAppOrder,
  };
}
