import { supabase } from "@/integrations/supabase/client";

export const imageModel = {
  async upload(file: File, path: string): Promise<string | null> {
    const ext = file.name.split(".").pop();
    const filePath = `${path}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("store-assets").upload(filePath, file);
    if (error) throw error;
    const { data } = supabase.storage.from("store-assets").getPublicUrl(filePath);
    return data.publicUrl;
  },
};
