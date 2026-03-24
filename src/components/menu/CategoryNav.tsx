import type { Category } from "@/types/store";

interface CategoryNavProps {
  categories: Category[];
  activeCategory: string | null;
  onSelect: (id: string | null) => void;
  primaryColor: string;
}

export const CategoryNav = ({ categories, activeCategory, onSelect, primaryColor }: CategoryNavProps) => {
  return (
    <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b">
      <div className="container max-w-5xl px-4">
        <div className="flex gap-2 py-3 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => onSelect(null)}
            className="shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all"
            style={{
              backgroundColor: !activeCategory ? primaryColor : "transparent",
              color: !activeCategory ? "#fff" : undefined,
              border: !activeCategory ? "none" : "1px solid #e2e2e2",
            }}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className="shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all"
              style={{
                backgroundColor: activeCategory === cat.id ? primaryColor : "transparent",
                color: activeCategory === cat.id ? "#fff" : undefined,
                border: activeCategory === cat.id ? "none" : "1px solid #e2e2e2",
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
