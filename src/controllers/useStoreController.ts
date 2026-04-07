import { useQuery, useQueryClient } from "@tanstack/react-query";
import { storeModel, type CreateStoreData } from "@/models/storeModel";
import { imageModel } from "@/models/imageModel";
import type { Store } from "@/types/store";
import { toast } from "sonner";

export function useStoreController(enabled: boolean) {
  const queryClient = useQueryClient();

  const { data: stores = [] } = useQuery({
    queryKey: ["admin-stores"],
    queryFn: () => storeModel.fetchAll(),
    enabled,
  });

  const createStore = async (data: CreateStoreData) => {
    if (!data.name || !data.slug) { toast.error("Preencha nome e slug"); return; }
    try {
      await storeModel.create(data);
      toast.success("Loja criada!");
      queryClient.invalidateQueries({ queryKey: ["admin-stores"] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const updateStore = async (id: string, fields: Record<string, unknown>) => {
    try {
      await storeModel.update(id, fields);
      queryClient.invalidateQueries({ queryKey: ["admin-stores"] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const uploadImage = async (file: File, path: string): Promise<string | null> => {
    try {
      return await imageModel.upload(file, path);
    } catch (error: any) {
      toast.error("Erro no upload: " + error.message);
      return null;
    }
  };

  const toggleStoreOpen = async (store: Store) => {
    await updateStore(store.id, { is_open: !store.is_open });
    toast.success(store.is_open ? "Loja fechada" : "Loja aberta");
  };

  return { stores, createStore, updateStore, uploadImage, toggleStoreOpen };
}
