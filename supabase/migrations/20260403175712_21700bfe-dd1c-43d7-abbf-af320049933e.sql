
-- Allow platform admins to manage categories
DROP POLICY IF EXISTS "Store admins can insert categories" ON public.categories;
CREATE POLICY "Admins can insert categories" ON public.categories FOR INSERT TO authenticated
WITH CHECK (is_store_admin(auth.uid(), store_id) OR has_role(auth.uid(), 'platform_admin'::app_role));

DROP POLICY IF EXISTS "Store admins can update categories" ON public.categories;
CREATE POLICY "Admins can update categories" ON public.categories FOR UPDATE TO authenticated
USING (is_store_admin(auth.uid(), store_id) OR has_role(auth.uid(), 'platform_admin'::app_role));

DROP POLICY IF EXISTS "Store admins can delete categories" ON public.categories;
CREATE POLICY "Admins can delete categories" ON public.categories FOR DELETE TO authenticated
USING (is_store_admin(auth.uid(), store_id) OR has_role(auth.uid(), 'platform_admin'::app_role));

-- Allow platform admins to manage products
DROP POLICY IF EXISTS "Store admins can insert products" ON public.products;
CREATE POLICY "Admins can insert products" ON public.products FOR INSERT TO authenticated
WITH CHECK (is_store_admin(auth.uid(), store_id) OR has_role(auth.uid(), 'platform_admin'::app_role));

DROP POLICY IF EXISTS "Store admins can update products" ON public.products;
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE TO authenticated
USING (is_store_admin(auth.uid(), store_id) OR has_role(auth.uid(), 'platform_admin'::app_role));

DROP POLICY IF EXISTS "Store admins can delete products" ON public.products;
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE TO authenticated
USING (is_store_admin(auth.uid(), store_id) OR has_role(auth.uid(), 'platform_admin'::app_role));

-- Allow platform admins to manage product_variations
DROP POLICY IF EXISTS "Store admins can manage variations" ON public.product_variations;
CREATE POLICY "Admins can manage variations" ON public.product_variations FOR ALL TO authenticated
USING (
  EXISTS (SELECT 1 FROM products p WHERE p.id = product_variations.product_id AND (is_store_admin(auth.uid(), p.store_id) OR has_role(auth.uid(), 'platform_admin'::app_role)))
)
WITH CHECK (
  EXISTS (SELECT 1 FROM products p WHERE p.id = product_variations.product_id AND (is_store_admin(auth.uid(), p.store_id) OR has_role(auth.uid(), 'platform_admin'::app_role)))
);

-- Allow platform admins to manage category_addons
DROP POLICY IF EXISTS "Store admins can manage addons" ON public.category_addons;
CREATE POLICY "Admins can manage addons" ON public.category_addons FOR ALL TO authenticated
USING (
  EXISTS (SELECT 1 FROM categories c WHERE c.id = category_addons.category_id AND (is_store_admin(auth.uid(), c.store_id) OR has_role(auth.uid(), 'platform_admin'::app_role)))
)
WITH CHECK (
  EXISTS (SELECT 1 FROM categories c WHERE c.id = category_addons.category_id AND (is_store_admin(auth.uid(), c.store_id) OR has_role(auth.uid(), 'platform_admin'::app_role)))
);

-- Allow platform admins to update stores
DROP POLICY IF EXISTS "Store admins can update their store" ON public.stores;
CREATE POLICY "Admins can update stores" ON public.stores FOR UPDATE TO authenticated
USING (is_store_admin(auth.uid(), id) OR has_role(auth.uid(), 'platform_admin'::app_role));
