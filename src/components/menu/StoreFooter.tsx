import type { Store } from "@/types/store";

interface StoreFooterProps {
  store: Store;
}

export const StoreFooter = ({ store }: StoreFooterProps) => {
  return (
    <footer className="bg-background border-t border-border py-6 mt-auto">
      <div className="container">
        <div className="flex flex-col items-center gap-2">
          <p className="text-muted-foreground text-sm text-center">
            © {new Date().getFullYear()} {store.name}
          </p>
          <p className="text-muted-foreground/50 text-xs">
            Cardápio Digital
          </p>
        </div>
      </div>
    </footer>
  );
};
