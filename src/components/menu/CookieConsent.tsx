import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";

interface CookieConsentProps {
  storageKey: string;
}

export function CookieConsent({ storageKey }: CookieConsentProps) {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(storageKey);
    if (!consent) {
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [storageKey]);

  const accept = () => {
    localStorage.setItem(storageKey, "accepted");
    setShowBanner(false);
  };
  const decline = () => {
    localStorage.setItem(storageKey, "declined");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] p-4 bg-card border-t border-border shadow-lg animate-in slide-in-from-bottom duration-300">
      <div className="container max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Cookie className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">
              Utilizamos armazenamento local para salvar suas informações de contato e facilitar pedidos futuros. Ao continuar navegando, você concorda com nossa{" "}
              <Link to="/privacidade" className="text-primary hover:underline">
                Política de Privacidade
              </Link>
              .
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="outline" size="sm" onClick={decline} className="gap-1">
              <X className="h-4 w-4" /> Recusar
            </Button>
            <Button size="sm" onClick={accept}>
              Aceitar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}