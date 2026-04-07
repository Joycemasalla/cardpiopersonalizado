import { supabase } from "@/integrations/supabase/client";
import type { Store } from "@/types/store";

export interface CreateStoreData {
  name: string;
  slug: string;
  whatsapp?: string | null;
  color_primary: string;
  color_secondary: string;
  color_background: string;
  color_text: string;
}

export const storeModel = {
  async fetchAll(): Promise<Store[]> {
    const { data, error } = await supabase
      .from("stores")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as Store[];
  },

  async fetchBySlug(slug: string): Promise<Store> {
    const { data, error } = await supabase
      .from("stores")
      .select("*")
      .eq("slug", slug)
      .single();
    if (error) throw error;
    return data as Store;
  },

  async create(store: CreateStoreData) {
    const { error } = await supabase.from("stores").insert({
      name: store.name,
      slug: store.slug.toLowerCase().replace(/[^a-z0-9-]/g, ""),
      whatsapp: store.whatsapp || null,
      color_primary: store.color_primary,
      color_secondary: store.color_secondary,
      color_background: store.color_background,
      color_text: store.color_text,
    });
    if (error) throw error;
  },

  async update(id: string, fields: Record<string, unknown>) {
    const { error } = await supabase.from("stores").update(fields as any).eq("id", id);
    if (error) throw error;
  },

  async delete(id: string) {
    const { error } = await supabase.from("stores").delete().eq("id", id);
    if (error) throw error;
  },
};
