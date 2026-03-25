import type { Category } from "@/types/store";
import { Utensils, Wine, Sparkles, IceCream } from "lucide-react";

interface CategorySidebarProps {
  categories: Category[];
  activeCategory: string | null;
  onSelect: (id: string | null) => void;
}

const categoryIcons: Record<string, React.ReactNode> = {};

const getCategoryIcon = (name: string, isActive: boolean) => {
  const cls = `h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`;
  const lower = name.toLowerCase();
  if (lower.includes("prato") || lower.includes("principal") || lower.includes("course")) return <Utensils className={cls} />;
  if (lower.includes("bebida") || lower.includes("drink") || lower.includes("cocktail")) return <Wine className={cls} />;
  if (lower.includes("sobremesa") || lower.includes("doce") || lower.includes("sweet")) return <IceCream className={cls} />;
  return <Sparkles className={cls} />;
};

export const CategorySidebar = ({ categories, activeCategory, onSelect }: CategorySidebarProps) => {
  return (
    <aside className="w-56 shrink-0 border-r border-border bg-sidebar p-4 hidden lg:block">
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Categorias</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Seleção do dia</p>
      </div>
      <nav className="space-y-1">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(isActive ? null : cat.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                isActive
                  ? "bg-sidebar-accent text-foreground border-l-2 border-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 border-l-2 border-transparent"
              }`}
            >
              {getCategoryIcon(cat.name, isActive)}
              <span className="uppercase text-xs tracking-wide">{cat.name}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
