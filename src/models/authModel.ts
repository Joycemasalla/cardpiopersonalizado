import { supabase } from "@/integrations/supabase/client";

export const authModel = {
  async getUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  async isPlatformAdmin(userId: string): Promise<boolean> {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "platform_admin")
      .maybeSingle();
    return !!data;
  },

  async getStoreAdminStoreId(userId: string): Promise<string | null> {
    const { data } = await supabase
      .from("store_admins")
      .select("store_id")
      .eq("user_id", userId)
      .maybeSingle();
    return data?.store_id ?? null;
  },

  async signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },

  async signUp(email: string, password: string) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) throw error;
  },

  async signOut() {
    await supabase.auth.signOut();
  },
};
