import { useQuery, useQueryClient } from "@tanstack/react-query";
import { categoryModel } from "@/models/categoryModel";
import { toast } from "sonner";

export function useCategoryController(storeId: string | null) {
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ["store-categories", storeId],
    queryFn: () => categoryModel.fetchByStore(storeId!),
    enabled: !!storeId,
  });

  const { data: categoryAddons = [] } = useQuery({
    queryKey: ["store-category-addons", storeId],
    queryFn: () => categoryModel.fetchAddonsByCategories(categories.map(c => c.id)),
    enabled: categories.length > 0,
  });

  const createCategory = async (name: string) => {
    if (!name || !storeId) return;
    try {
      await categoryModel.create(storeId, name, categories.length);
      toast.success("Categoria criada!");
      queryClient.invalidateQueries({ queryKey: ["store-categories", storeId] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await categoryModel.delete(id);
      toast.success("Categoria removida!");
      queryClient.invalidateQueries({ queryKey: ["store-categories", storeId] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const createAddon = async (categoryId: string, name: string, price: number) => {
    try {
      const addons = categoryAddons.filter(a => a.category_id === categoryId);
      await categoryModel.createAddon(categoryId, name, price, addons.length);
      toast.success("Adicional criado!");
      queryClient.invalidateQueries({ queryKey: ["store-category-addons", storeId] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const deleteAddon = async (id: string) => {
    try {
      await categoryModel.deleteAddon(id);
      toast.success("Adicional removido!");
      queryClient.invalidateQueries({ queryKey: ["store-category-addons", storeId] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return { categories, categoryAddons, createCategory, deleteCategory, createAddon, deleteAddon };
}
