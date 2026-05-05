import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { storeModel } from "@/models/storeModel";
import { categoryModel } from "@/models/categoryModel";
import { productModel } from "@/models/productModel";
import { CART_KEY } from "@/lib/constants";
import type { MenuProduct, MenuProductSize, MenuAddon, CartItem } from "@/types/store";
import { DEMO_PRODUCTS, DEMO_CATEGORIES } from "@/lib/demoProducts";

export function useMenuController(slug: string | undefined) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<MenuProduct | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!slug) return;
    try {
      const saved = localStorage.getItem(CART_KEY(slug));
      if (saved) setCart(JSON.parse(saved));
    } catch {}
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    localStorage.setItem(CART_KEY(slug), JSON.stringify(cart));
  }, [cart, slug]);

  const { data: store, isLoading: storeLoading, isError: storeError, error: storeErrorObj } = useQuery({
    queryKey: ["store", slug],
    queryFn: () => storeModel.fetchBySlug(slug!),
    enabled: !!slug,
  });

  const { data: categories = [], isError: categoriesError } = useQuery({
    queryKey: ["menu-categories", store?.id],
    queryFn: () => categoryModel.fetchActiveByStore(store!.id),
    enabled: !!store?.id,
  });

  const { data: products = [], isError: productsError } = useQuery({
    queryKey: ["menu-products", store?.id],
    queryFn: () => productModel.fetchActiveByStore(store!.id),
    enabled: !!store?.id,
  });

  const productIds = useMemo(() => products.map(p => p.id), [products]);
  const categoryIds = useMemo(() => categories.map(c => c.id), [categories]);

  const { data: variations = [] } = useQuery({
    queryKey: ["menu-variations", store?.id, productIds],
    queryFn: () => productModel.fetchActiveVariationsByProducts(productIds),
    enabled: productIds.length > 0,
  });

  const { data: categoryAddons = [] } = useQuery({
    queryKey: ["menu-addons", store?.id, categoryIds],
    queryFn: () => categoryModel.fetchActiveAddonsByCategories(categoryIds),
    enabled: categoryIds.length > 0,
  });

  const hasError = storeError || categoriesError || productsError;
  const errorMessage = storeErrorObj?.message || "Erro ao carregar o cardápio. Tente novamente.";

  const menuProducts: MenuProduct[] = useMemo(() => {
    const categoryMap = new Map(categories.map(c => [c.id, c.name]));
    const real = products.map(p => {
      const productVariations = variations.filter(v => v.product_id === p.id);
      const sizes: MenuProductSize[] = productVariations.length > 0
        ? productVariations.map(v => ({ id: v.id, name: v.name, price: Number(v.price) }))
        : [{ id: p.id, name: "Único", price: Number(p.price) }];
      return {
        id: p.id,
        name: p.name,
        description: p.description,
        image_url: p.image_url,
        category_id: p.category_id,
        category_name: categoryMap.get(p.category_id) || "",
        sizes,
      };
    });
    if (store?.show_demo_products) return [...real, ...DEMO_PRODUCTS];
    return real;
  }, [products, categories, variations, store?.show_demo_products]);

  const getAddonsForProduct = useCallback((product: MenuProduct): MenuAddon[] => {
    return categoryAddons
      .filter(a => a.category_id === product.category_id)
      .map(a => ({ id: a.id, name: a.name, price: Number(a.price) }));
  }, [categoryAddons]);

  const activeCategories = useMemo(() => {
    const catIds = new Set(menuProducts.map(p => p.category_id));
    const real = categories.filter(c => catIds.has(c.id));
    if (!store?.show_demo_products) return real;
    const demo = DEMO_CATEGORIES.filter(c => catIds.has(c.id)).map(c => ({
      ...c,
      store_id: store?.id ?? "",
      updated_at: c.created_at,
    }));
    return [...real, ...demo];
  }, [categories, menuProducts, store?.show_demo_products, store?.id]);

  const handleAddToCart = useCallback((product: MenuProduct, size: MenuProductSize, addons: MenuAddon[], quantity: number, notes?: string) => {
    setCart(prev => {
      const existing = prev.find(
        item => item.product.id === product.id && item.selectedSize.id === size.id &&
          item.addons.map(a => a.id).sort().join(",") === addons.map(a => a.id).sort().join(",")
      );
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id && item.selectedSize.id === size.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, selectedSize: size, addons, quantity, notes }];
    });
    setSelectedProduct(null);
  }, []);

  const filteredProducts = useMemo(() => {
    let filtered = menuProducts;
    if (activeCategory) filtered = filtered.filter(p => p.category_id === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        p.category_name.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [menuProducts, activeCategory, searchQuery]);

  const cartTotal = cart.reduce(
    (sum, item) => sum + (Number(item.selectedSize.price) + item.addons.reduce((a, addon) => a + Number(addon.price), 0)) * item.quantity, 0
  );
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const categoryName = activeCategory
    ? activeCategories.find(c => c.id === activeCategory)?.name
    : searchQuery ? `Resultados para "${searchQuery}"` : "Cardápio Completo";

  return {
    store,
    storeLoading,
    hasError,
    errorMessage,
    categories: activeCategories,
    filteredProducts,
    selectedProduct,
    setSelectedProduct,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    cart,
    setCart,
    cartTotal,
    cartCount,
    categoryName,
    handleAddToCart,
    getAddonsForProduct,
  };
}
