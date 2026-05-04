import type { Store } from "@/types/store";
import { Link } from "react-router-dom";

interface StoreFooterProps {
  store: Store;
}

export const StoreFooter = ({ store }: StoreFooterProps) => {
  return (
    <footer className="bg-background border-t border-border py-6 mt-auto">
      <div className="container">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-4 text-sm">
            <Link to="/privacidade" className="text-muted-foreground hover:text-primary transition-colors">
              Política de Privacidade
            </Link>
            <span className="text-muted-foreground/50">•</span>
            <Link to="/termos" className="text-muted-foreground hover:text-primary transition-colors">
              Termos de Uso
            </Link>
          </div>
          <p className="text-muted-foreground text-sm text-center">
            © {new Date().getFullYear()} {store.name} — Cardápio Digital
          </p>
        </div>
      </div>
    </footer>
  );
};
