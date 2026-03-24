import type { Store } from "@/types/store";
import { MapPin } from "lucide-react";

interface StoreHeaderProps {
  store: Store;
}

export const StoreHeader = ({ store }: StoreHeaderProps) => {
  return (
    <header className="relative">
      {store.banner_url ? (
        <div className="h-48 md:h-64 overflow-hidden">
          <img
            src={store.banner_url}
            alt={store.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      ) : (
        <div
          className="h-48 md:h-64"
          style={{ background: `linear-gradient(135deg, ${store.color_primary}, ${store.color_secondary})` }}
        />
      )}

      <div className="container max-w-5xl px-4 relative">
        <div className="flex items-end gap-4 -mt-12">
          {store.logo_url ? (
            <img
              src={store.logo_url}
              alt={store.name}
              className="w-24 h-24 rounded-xl border-4 border-white shadow-lg object-cover bg-white"
            />
          ) : (
            <div
              className="w-24 h-24 rounded-xl border-4 border-white shadow-lg flex items-center justify-center text-white text-2xl font-display font-bold"
              style={{ backgroundColor: store.color_primary }}
            >
              {store.name.charAt(0)}
            </div>
          )}
          <div className="pb-2">
            <h1 className="text-2xl font-display font-bold" style={{ color: store.color_text }}>
              {store.name}
            </h1>
            {store.address && (
              <p className="flex items-center gap-1 text-sm opacity-70 mt-1">
                <MapPin className="h-3.5 w-3.5" />
                {store.address}
              </p>
            )}
          </div>
        </div>

        {store.banner_text && (
          <div
            className="mt-4 p-3 rounded-lg text-sm font-medium text-center"
            style={{ backgroundColor: store.color_primary + "15", color: store.color_primary }}
          >
            {store.banner_text}
          </div>
        )}
      </div>
    </header>
  );
};
