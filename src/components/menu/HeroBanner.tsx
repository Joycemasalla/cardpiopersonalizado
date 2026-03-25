import type { Store, Promotion } from "@/types/store";
import { motion } from "framer-motion";

interface HeroBannerProps {
  store: Store;
  featuredProduct?: { name: string; description: string; price: number; image_url: string | null };
  promotion?: Promotion;
}

export const HeroBanner = ({ store, featuredProduct, promotion }: HeroBannerProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {/* Main hero */}
      <motion.div
        className="md:col-span-2 relative rounded-lg overflow-hidden h-64 md:h-80"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {store.banner_url ? (
          <img src={store.banner_url} alt={store.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-secondary to-card" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          {featuredProduct ? (
            <>
              <span className="inline-block mb-2 text-[10px] uppercase tracking-widest text-primary font-semibold bg-primary/10 px-2 py-1 rounded">
                Sugestão do Chef
              </span>
              <h2 className="text-2xl md:text-3xl font-display font-bold italic text-foreground leading-tight">
                {featuredProduct.name}
              </h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">{featuredProduct.description}</p>
              <button className="mt-4 px-5 py-2 bg-primary/20 border border-primary/40 text-primary text-sm font-semibold rounded hover:bg-primary/30 transition-colors">
                Experimentar — R$ {Number(featuredProduct.price).toFixed(2).replace(".", ",")}
              </button>
            </>
          ) : (
            <>
              <h2 className="text-2xl md:text-3xl font-display font-bold italic text-foreground leading-tight">
                {store.banner_text || `Bem-vindo ao ${store.name}`}
              </h2>
              {store.address && (
                <p className="text-sm text-muted-foreground mt-1">{store.address}</p>
              )}
            </>
          )}
        </div>
      </motion.div>

      {/* Promo card */}
      <motion.div
        className="hidden md:flex flex-col gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        {promotion ? (
          <div className="rounded-lg bg-card border border-border p-5 flex-1 flex flex-col justify-center">
            <span className="text-2xl font-display font-bold text-primary italic">
              {promotion.discount_percent}% Off
            </span>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
              {promotion.title}
            </p>
          </div>
        ) : (
          <div className="rounded-lg bg-card border border-border p-5 flex-1 flex flex-col justify-center">
            <span className="text-xl font-display font-bold text-primary italic">
              Peça agora
            </span>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
              Pelo WhatsApp
            </p>
          </div>
        )}
        <div className="rounded-lg overflow-hidden flex-1 relative">
          <div className="w-full h-full bg-gradient-to-br from-secondary to-card flex items-center justify-center">
            <span className="text-sm font-display italic text-muted-foreground">Destaques</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
