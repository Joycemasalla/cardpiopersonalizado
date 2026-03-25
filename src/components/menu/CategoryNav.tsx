import type { Category } from "@/types/store";

interface CategoryNavProps {
  categories: Category[];
  activeCategory: string | null;
  onSelect: (id: string | null) => void;
  primaryColor?: string;
}

export const CategoryNav = ({ categories, activeCategory, onSelect }: CategoryNavProps) => {
  return (
    <div className="lg:hidden sticky top-14 z-40 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="flex gap-2 py-3 px-4 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => onSelect(null)}
          className={`shrink-0 px-4 py-2 rounded-md text-xs font-medium uppercase tracking-wide transition-all ${
            !activeCategory
              ? "bg-primary text-primary-foreground"
              : "border border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(activeCategory === cat.id ? null : cat.id)}
            className={`shrink-0 px-4 py-2 rounded-md text-xs font-medium uppercase tracking-wide transition-all ${
              activeCategory === cat.id
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
};
