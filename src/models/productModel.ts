import { supabase } from "@/integrations/supabase/client";

export interface StoreProduct {
  id: string;
  store_id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  badge: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface StoreVariation {
  id: string;
  product_id: string;
  name: string;
  price: number;
  sort_order: number;
  is_active: boolean;
}

export const productModel = {
  async fetchByStore(storeId: string): Promise<StoreProduct[]> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("store_id", storeId)
      .order("sort_order");
    if (error) throw error;
    return data as StoreProduct[];
  },

  async fetchActiveByStore(storeId: string): Promise<StoreProduct[]> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("store_id", storeId)
      .eq("is_active", true)
      .order("sort_order");
    if (error) throw error;
    return data as StoreProduct[];
  },

  async create(data: {
    store_id: string;
    category_id: string;
    name: string;
    description?: string | null;
    price: number;
    image_url?: string | null;
    sort_order: number;
  }) {
    const { error } = await supabase.from("products").insert(data);
    if (error) throw error;
  },

  async update(id: string, fields: Partial<StoreProduct>) {
    const { error } = await supabase.from("products").update(fields).eq("id", id);
    if (error) throw error;
  },

  async delete(id: string) {
    await supabase.from("product_variations").delete().eq("product_id", id);
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
  },

  async toggleActive(id: string, currentActive: boolean) {
    await supabase.from("products").update({ is_active: !currentActive }).eq("id", id);
  },

  // Variations
  async fetchVariationsByProducts(productIds: string[]): Promise<StoreVariation[]> {
    if (productIds.length === 0) return [];
    const { data, error } = await supabase
      .from("product_variations")
      .select("*")
      .in("product_id", productIds)
      .order("sort_order");
    if (error) throw error;
    return data as StoreVariation[];
  },

  async fetchActiveVariationsByProducts(productIds: string[]): Promise<StoreVariation[]> {
    if (productIds.length === 0) return [];
    const { data, error } = await supabase
      .from("product_variations")
      .select("*")
      .in("product_id", productIds)
      .eq("is_active", true)
      .order("sort_order");
    if (error) throw error;
    return data as StoreVariation[];
  },

  async createVariation(productId: string, name: string, price: number, sortOrder: number) {
    const { error } = await supabase.from("product_variations").insert({
      product_id: productId,
      name,
      price,
      sort_order: sortOrder,
    });
    if (error) throw error;
  },

  async deleteVariation(id: string) {
    await supabase.from("product_variations").delete().eq("id", id);
  },
};
