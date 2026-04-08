import { MessageCircle } from "lucide-react";

interface WhatsAppButtonProps {
  phone: string;
  hasCart?: boolean;
}

export const WhatsAppButton = ({ phone, hasCart }: WhatsAppButtonProps) => {
  const cleanPhone = phone.replace(/\D/g, "");
  const message = encodeURIComponent("Olá! Gostaria de fazer um pedido.");
  const url = `https://wa.me/${cleanPhone}?text=${message}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed z-40 flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-3 rounded-full shadow-lg transition-all hover:scale-105 ${
        hasCart ? "bottom-20 right-4" : "bottom-6 right-4"
      }`}
      aria-label="Pedir pelo WhatsApp"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden sm:inline font-medium text-sm">Zap</span>
    </a>
  );
};
