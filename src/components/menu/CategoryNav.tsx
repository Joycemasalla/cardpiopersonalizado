import type { Category } from "@/types/store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CategoryNavProps {
  categories: Category[];
  activeCategory: string | null;
  onSelect: (id: string | null) => void;
}

export const CategoryNav = ({ categories, activeCategory, onSelect }: CategoryNavProps) => {
  return (
    <div className="flex justify-center py-6 lg:hidden">
      <Select
        value={activeCategory || "all"}
        onValueChange={(v) => onSelect(v === "all" ? null : v)}
      >
        <SelectTrigger className="w-[280px] bg-card border-border text-foreground">
          <SelectValue placeholder="Todas as Categorias" />
        </SelectTrigger>
        <SelectContent className="bg-card border-border">
          <SelectItem value="all">Todas as Categorias</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
