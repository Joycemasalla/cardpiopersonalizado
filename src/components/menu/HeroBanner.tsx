import type { Store } from "@/types/store";
import { MapPin } from "lucide-react";
import { StoreInfoBar } from "./StoreInfoBar";

interface HeroBannerProps {
  store: Store;
}

export const HeroBanner = ({ store }: HeroBannerProps) => {
  return (
    <section className="relative h-[300px] md:h-[400px] overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={store.banner_url ? { backgroundImage: `url(${store.banner_url})` } : undefined}
      >
        {!store.banner_url && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30" />
        )}
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
        {store.logo_url && (
          <img src={store.logo_url} alt={store.name} className="h-16 md:h-20 w-auto mb-4 rounded-lg" />
        )}
        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-3 drop-shadow-lg">
          {store.name}
        </h1>
        {store.banner_text && (
          <p className="text-primary text-lg md:text-2xl font-display italic drop-shadow-md">
            {store.banner_text}
          </p>
        )}
        {store.address && (
          <p className="text-foreground/70 text-sm md:text-base mt-3 flex items-center gap-2 justify-center">
            <MapPin className="h-4 w-4 text-primary" />
            {store.address}
          </p>
        )}
        <div className="mt-4">
          <StoreInfoBar store={store} />
        </div>
      </div>
    </section>
  );
};
