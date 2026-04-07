import { useQuery, useQueryClient } from "@tanstack/react-query";
import { productModel, type StoreProduct } from "@/models/productModel";
import { imageModel } from "@/models/imageModel";
import { toast } from "sonner";

export function useProductController(storeId: string | null) {
  const queryClient = useQueryClient();

  const { data: products = [] } = useQuery({
    queryKey: ["store-products", storeId],
    queryFn: () => productModel.fetchByStore(storeId!),
    enabled: !!storeId,
  });

  const { data: variations = [] } = useQuery({
    queryKey: ["store-variations", storeId],
    queryFn: () => productModel.fetchVariationsByProducts(products.map(p => p.id)),
    enabled: products.length > 0,
  });

  const createProduct = async (data: {
    categoryId: string;
    name: string;
    description?: string;
    price: number;
    imageFile?: File | null;
  }) => {
    if (!data.name || !data.categoryId || !storeId) {
      toast.error("Preencha nome e categoria");
      return;
    }
    try {
      let imageUrl: string | null = null;
      if (data.imageFile) {
        imageUrl = await imageModel.upload(data.imageFile, `products/${storeId}`);
      }
      await productModel.create({
        store_id: storeId,
        category_id: data.categoryId,
        name: data.name,
        description: data.description || null,
        price: data.price,
        image_url: imageUrl,
        sort_order: products.length,
      });
      toast.success("Produto criado!");
      queryClient.invalidateQueries({ queryKey: ["store-products", storeId] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const updateProduct = async (id: string, fields: Partial<StoreProduct>) => {
    try {
      await productModel.update(id, fields);
      toast.success("Produto atualizado!");
      queryClient.invalidateQueries({ queryKey: ["store-products", storeId] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await productModel.delete(id);
      toast.success("Produto removido!");
      queryClient.invalidateQueries({ queryKey: ["store-products", storeId] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const toggleProduct = async (id: string, currentActive: boolean) => {
    await productModel.toggleActive(id, currentActive);
    queryClient.invalidateQueries({ queryKey: ["store-products", storeId] });
  };

  const uploadProductImage = async (productId: string, file: File) => {
    try {
      const url = await imageModel.upload(file, `products/${storeId}`);
      if (url) {
        await productModel.update(productId, { image_url: url });
        queryClient.invalidateQueries({ queryKey: ["store-products", storeId] });
        toast.success("Imagem atualizada!");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const createVariation = async (productId: string, name: string, price: number) => {
    try {
      const existing = variations.filter(v => v.product_id === productId);
      await productModel.createVariation(productId, name, price, existing.length);
      toast.success("Variação criada!");
      queryClient.invalidateQueries({ queryKey: ["store-variations", storeId] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const deleteVariation = async (id: string) => {
    await productModel.deleteVariation(id);
    queryClient.invalidateQueries({ queryKey: ["store-variations", storeId] });
    toast.success("Variação removida!");
  };

  return {
    products,
    variations,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProduct,
    uploadProductImage,
    createVariation,
    deleteVariation,
  };
}
