
-- Master categories (catálogo global da Joyce)
CREATE TABLE public.master_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Master products (produtos globais)
CREATE TABLE public.master_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.master_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  image_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Master product sizes (tamanhos com preço padrão)
CREATE TABLE public.master_product_sizes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.master_products(id) ON DELETE CASCADE,
  name text NOT NULL,
  default_price numeric NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Master addons (adicionais globais)
CREATE TABLE public.master_addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  default_price numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Tenant product config (quais produtos do catálogo estão habilitados por loja)
CREATE TABLE public.tenant_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  master_product_id uuid NOT NULL REFERENCES public.master_products(id) ON DELETE CASCADE,
  is_enabled boolean NOT NULL DEFAULT true,
  custom_image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(store_id, master_product_id)
);

-- Tenant product size pricing (preço de cada tamanho por loja)
CREATE TABLE public.tenant_product_sizes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  master_size_id uuid NOT NULL REFERENCES public.master_product_sizes(id) ON DELETE CASCADE,
  price numeric NOT NULL,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(store_id, master_size_id)
);

-- Tenant addon config (preço dos adicionais por loja)
CREATE TABLE public.tenant_addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  master_addon_id uuid NOT NULL REFERENCES public.master_addons(id) ON DELETE CASCADE,
  price numeric NOT NULL,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(store_id, master_addon_id)
);

-- RLS policies
ALTER TABLE public.master_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_product_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_product_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_addons ENABLE ROW LEVEL SECURITY;

-- Public read for master catalog
CREATE POLICY "Anyone can view master_categories" ON public.master_categories FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can view master_products" ON public.master_products FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can view master_product_sizes" ON public.master_product_sizes FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can view master_addons" ON public.master_addons FOR SELECT TO public USING (true);

-- Platform admins can manage master catalog
CREATE POLICY "Platform admins manage master_categories" ON public.master_categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'platform_admin')) WITH CHECK (public.has_role(auth.uid(), 'platform_admin'));
CREATE POLICY "Platform admins manage master_products" ON public.master_products FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'platform_admin')) WITH CHECK (public.has_role(auth.uid(), 'platform_admin'));
CREATE POLICY "Platform admins manage master_product_sizes" ON public.master_product_sizes FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'platform_admin')) WITH CHECK (public.has_role(auth.uid(), 'platform_admin'));
CREATE POLICY "Platform admins manage master_addons" ON public.master_addons FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'platform_admin')) WITH CHECK (public.has_role(auth.uid(), 'platform_admin'));

-- Public read for tenant configs
CREATE POLICY "Anyone can view tenant_products" ON public.tenant_products FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can view tenant_product_sizes" ON public.tenant_product_sizes FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can view tenant_addons" ON public.tenant_addons FOR SELECT TO public USING (true);

-- Platform admins can manage tenant configs
CREATE POLICY "Platform admins manage tenant_products" ON public.tenant_products FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'platform_admin')) WITH CHECK (public.has_role(auth.uid(), 'platform_admin'));
CREATE POLICY "Platform admins manage tenant_product_sizes" ON public.tenant_product_sizes FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'platform_admin')) WITH CHECK (public.has_role(auth.uid(), 'platform_admin'));
CREATE POLICY "Platform admins manage tenant_addons" ON public.tenant_addons FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'platform_admin')) WITH CHECK (public.has_role(auth.uid(), 'platform_admin'));
