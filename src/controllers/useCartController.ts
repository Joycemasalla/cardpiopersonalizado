import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { storeModel } from "@/models/storeModel";
import { CART_KEY } from "@/lib/constants";
import { applyStoreTheme, removeStoreTheme } from "@/lib/colors";
import type { CartItem } from "@/types/store";
import { toast } from "sonner";

export type PaymentMethod = "cash" | "pix" | "card";
export type OrderType = "delivery" | "pickup" | "dine_in";

const CUSTOMER_KEY = (slug: string) => `customer_${slug}`;

interface CustomerData {
  name: string;
  phone: string;
  address: string;
  addressComplement: string;
}

export function useCartController(slug: string | undefined) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [addressComplement, setAddressComplement] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [orderType, setOrderType] = useState<OrderType>("delivery");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [needChange, setNeedChange] = useState(false);
  const [changeAmount, setChangeAmount] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Order flow modals
  const [showPreview, setShowPreview] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showClearCart, setShowClearCart] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const { data: store } = useQuery({
    queryKey: ["store", slug],
    queryFn: () => storeModel.fetchBySlug(slug!),
    enabled: !!slug,
  });

  // Apply store theme
  useEffect(() => {
    if (store) {
      applyStoreTheme(store);
    }
    return () => removeStoreTheme();
  }, [store]);

  useEffect(() => {
    if (!slug) return;
    try {
      const saved = localStorage.getItem(CART_KEY(slug));
      if (saved) setCart(JSON.parse(saved));
      const customer = localStorage.getItem(CUSTOMER_KEY(slug));
      if (customer) {
        const data: CustomerData = JSON.parse(customer);
        setName(data.name || "");
        setPhone(data.phone || "");
        setAddress(data.address || "");
        setAddressComplement(data.addressComplement || "");
      }
    } catch {}
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    localStorage.setItem(CART_KEY(slug), JSON.stringify(cart));
  }, [cart, slug]);

  const saveCustomerData = () => {
    if (!slug) return;
    const data: CustomerData = { name, phone, address, addressComplement };
    localStorage.setItem(CUSTOMER_KEY(slug), JSON.stringify(data));
  };

  const updateQty = (index: number, delta: number) => {
    setCart(prev => prev.map((item, i) => i === index ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item).filter(item => item.quantity > 0));
  };

  const removeItem = (index: number) => setCart(prev => prev.filter((_, i) => i !== index));

  const updateItemNotes = (index: number, notes: string) => {
    setCart(prev => prev.map((item, i) => i === index ? { ...item, notes } : item));
  };

  const clearCart = () => {
    setCart([]);
    if (slug) localStorage.removeItem(CART_KEY(slug));
  };

  const subtotal = cart.reduce((sum, item) => sum + (Number(item.selectedSize.price) + item.addons.reduce((a, addon) => a + Number(addon.price), 0)) * item.quantity, 0);
  const deliveryFee = orderType === "delivery" ? Number(store?.delivery_fee || 0) : 0;
  const total = subtotal + deliveryFee;

  const formatPaymentMethod = () => {
    switch (paymentMethod) {
      case "cash":
        if (needChange && changeAmount) return `Dinheiro (Troco para R$ ${changeAmount})`;
        if (!needChange) return "Dinheiro (Sem troco)";
        return "Dinheiro";
      case "pix":
        return "PIX";
      case "card":
        return "Cartão";
    }
  };

  const generateOrderNumber = () => {
    const ts = Date.now().toString().slice(-4);
    const r = Math.floor(Math.random() * 100).toString().padStart(2, "0");
    return `${ts}${r}`;
  };

  const formatDateTime = () =>
    new Date().toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const orderMessage = useMemo(() => {
    if (!store) return "";
    const lines: string[] = [];
    lines.push(`*${store.name}*`);
    lines.push("========================", "");
    lines.push(`*PEDIDO #${orderNumber || "------"}*`);
    lines.push(formatDateTime(), "");
    lines.push("------------------------", "*CLIENTE*", "------------------------");
    lines.push(`Nome: ${name}`);
    if (phone) lines.push(`WhatsApp: ${phone}`);
    lines.push("");
    lines.push("------------------------", "*ITENS DO PEDIDO*", "------------------------");
    cart.forEach((item) => {
      const unit = Number(item.selectedSize.price) + item.addons.reduce((a, addon) => a + Number(addon.price), 0);
      const sizeLabel = item.selectedSize.name && item.selectedSize.name !== "Único" ? ` (${item.selectedSize.name})` : "";
      lines.push(`${item.quantity}x ${item.product.name}${sizeLabel} — R$ ${(unit * item.quantity).toFixed(2)}`);
      item.addons.forEach((a) => lines.push(`   + ${a.name}`));
      if (item.notes && item.notes.trim()) lines.push(`   Obs: ${item.notes.trim()}`);
    });
    lines.push("");
    lines.push("------------------------");
    if (orderType === "delivery") {
      lines.push("*ENTREGA*", "------------------------");
      lines.push(address);
      if (addressComplement) lines.push(addressComplement);
    } else if (orderType === "dine_in") {
      lines.push("*NO LOCAL*", "------------------------");
      if (tableNumber) lines.push(`Mesa: ${tableNumber}`);
    } else {
      lines.push("*RETIRADA NO LOCAL*", "------------------------");
    }
    lines.push("");
    lines.push("------------------------", "*VALORES*", "------------------------");
    lines.push(`Subtotal: R$ ${subtotal.toFixed(2)}`);
    if (orderType === "delivery") lines.push(`Entrega: R$ ${deliveryFee.toFixed(2)}`);
    lines.push(`*TOTAL: R$ ${total.toFixed(2)}*`, "");
    lines.push("------------------------", "*PAGAMENTO*", "------------------------");
    lines.push(formatPaymentMethod() ?? "");
    if (paymentMethod === "pix") {
      lines.push("", "_Envie o comprovante PIX após a confirmação do seu pedido nesta conversa_");
    }
    lines.push("", "------------------------", "Obrigado pela preferência!", "========================");
    return lines.join("\n");
  }, [store, orderNumber, name, phone, cart, orderType, address, addressComplement, tableNumber, subtotal, deliveryFee, total, paymentMethod, needChange, changeAmount]);

  const validateAndPreview = () => {
    if (!name.trim()) { toast.error("Informe seu nome"); return; }
    if (orderType === "delivery" && !address.trim()) { toast.error("Informe o endereço de entrega"); return; }
    if (orderType === "dine_in" && !tableNumber.trim()) { toast.error("Informe o número da mesa"); return; }
    if (paymentMethod === "cash" && needChange && !changeAmount.trim()) { toast.error("Informe o valor para troco"); return; }
    if (!acceptedTerms) { toast.error("Você precisa aceitar a Política de Privacidade"); return; }
    if (!store?.whatsapp) { toast.error("WhatsApp não configurado"); return; }
    setOrderNumber(generateOrderNumber());
    setShowPreview(true);
  };

  const handleConfirmOrder = async () => {
    if (!store) return;
    setIsSending(true);
    saveCustomerData();

    const allNotes = cart
      .filter(i => i.notes && i.notes.trim())
      .map(i => `${i.product.name}: ${i.notes!.trim()}`)
      .join(" | ");

    const { error } = await supabase.from("orders").insert({
      store_id: store.id,
      customer_name: name,
      customer_phone: phone || null,
      order_type: orderType,
      table_number: orderType === "dine_in" ? tableNumber : null,
      address: orderType === "delivery" ? `${address}${addressComplement ? " — " + addressComplement : ""}` : null,
      items: cart.map(item => ({
        product_name: item.product.name,
        size_name: item.selectedSize.name,
        size_price: item.selectedSize.price,
        addons: item.addons.map(a => ({ name: a.name, price: a.price })),
        quantity: item.quantity,
        notes: item.notes || null,
      })) as any,
      subtotal,
      delivery_fee: deliveryFee,
      total,
      notes: [allNotes, `Pagamento: ${formatPaymentMethod()}`].filter(Boolean).join(" | ") || null,
    });

    if (error) {
      console.error("Erro ao salvar pedido:", error);
      if (error.message?.includes("row-level security")) {
        toast.error("A loja está fechada ou em manutenção. Não é possível enviar o pedido.");
        setIsSending(false);
        return;
      } else {
        toast.error("Erro ao registrar pedido. O WhatsApp será aberto mesmo assim.");
      }
    }

    const wa = store.whatsapp!.replace(/\D/g, "");
    const url = `https://wa.me/${wa}?text=${encodeURIComponent(orderMessage)}`;

    const win = window.open("", "_blank");
    if (win) win.location.href = url;
    else window.location.href = url;

    setShowPreview(false);
    clearCart();
    setShowSuccess(true);
    setIsSending(false);
  };

  return {
    store,
    cart,
    name, setName,
    phone, setPhone,
    address, setAddress,
    addressComplement, setAddressComplement,
    tableNumber, setTableNumber,
    orderType, setOrderType,
    paymentMethod, setPaymentMethod,
    needChange, setNeedChange,
    changeAmount, setChangeAmount,
    acceptedTerms, setAcceptedTerms,
    updateQty,
    removeItem,
    updateItemNotes,
    clearCart,
    subtotal,
    deliveryFee,
    total,
    isSending,
    showPreview, setShowPreview,
    showSuccess, setShowSuccess,
    showClearCart, setShowClearCart,
    orderNumber,
    orderMessage,
    validateAndPreview,
    handleConfirmOrder,
  };
}
