import { supabase } from "@/integrations/supabase/client";

export interface StoreCategory {
  id: string;
  store_id: string;
  name: string;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoreCategoryAddon {
  id: string;
  category_id: string;
  name: string;
  price: number;
  sort_order: number;
  is_active: boolean;
}

export const categoryModel = {
  async fetchByStore(storeId: string): Promise<StoreCategory[]> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("store_id", storeId)
      .order("sort_order");
    if (error) throw error;
    return data as StoreCategory[];
  },

  async fetchActiveByStore(storeId: string): Promise<StoreCategory[]> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("store_id", storeId)
      .eq("is_active", true)
      .order("sort_order");
    if (error) throw error;
    return data as StoreCategory[];
  },

  async create(storeId: string, name: string, sortOrder: number) {
    const { error } = await supabase.from("categories").insert({
      store_id: storeId,
      name,
      sort_order: sortOrder,
    });
    if (error) throw error;
  },

  async delete(id: string) {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw error;
  },

  // Addons
  async fetchAddonsByCategories(categoryIds: string[]): Promise<StoreCategoryAddon[]> {
    if (categoryIds.length === 0) return [];
    const { data, error } = await supabase
      .from("category_addons")
      .select("*")
      .in("category_id", categoryIds)
      .order("sort_order");
    if (error) throw error;
    return data as StoreCategoryAddon[];
  },

  async fetchActiveAddonsByCategories(categoryIds: string[]): Promise<StoreCategoryAddon[]> {
    if (categoryIds.length === 0) return [];
    const { data, error } = await supabase
      .from("category_addons")
      .select("*")
      .in("category_id", categoryIds)
      .eq("is_active", true)
      .order("sort_order");
    if (error) throw error;
    return data as StoreCategoryAddon[];
  },

  async createAddon(categoryId: string, name: string, price: number, sortOrder: number) {
    const { error } = await supabase.from("category_addons").insert({
      category_id: categoryId,
      name,
      price,
      sort_order: sortOrder,
    });
    if (error) throw error;
  },

  async deleteAddon(id: string) {
    const { error } = await supabase.from("category_addons").delete().eq("id", id);
    if (error) throw error;
  },
};
