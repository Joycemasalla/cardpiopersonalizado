
-- Enum for user roles
CREATE TYPE public.app_role AS ENUM ('platform_admin', 'store_admin');

-- Enum for order status
CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled');

-- Enum for order type
CREATE TYPE public.order_type AS ENUM ('delivery', 'pickup', 'dine_in');

-- ============================================
-- STORES
-- ============================================
CREATE TABLE public.stores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  banner_url TEXT,
  banner_text TEXT,
  color_primary TEXT NOT NULL DEFAULT '#e63946',
  color_secondary TEXT NOT NULL DEFAULT '#1d3557',
  color_background TEXT NOT NULL DEFAULT '#f1faee',
  color_text TEXT NOT NULL DEFAULT '#1d3557',
  whatsapp TEXT,
  address TEXT,
  pix_key TEXT,
  delivery_fee NUMERIC(10,2) DEFAULT 0,
  estimated_delivery_time TEXT,
  is_open BOOLEAN NOT NULL DEFAULT true,
  closed_message TEXT DEFAULT 'Estamos fechados no momento.',
  maintenance_mode BOOLEAN NOT NULL DEFAULT false,
  operating_hours JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view stores" ON public.stores
  FOR SELECT USING (true);

-- ============================================
-- USER ROLES
-- ============================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- STORE ADMINS
-- ============================================
CREATE TABLE public.store_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (store_id, user_id)
);

ALTER TABLE public.store_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own store_admins" ON public.store_admins
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- SECURITY DEFINER FUNCTIONS
-- ============================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_store_admin(_user_id UUID, _store_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.store_admins
    WHERE user_id = _user_id AND store_id = _store_id
  )
$$;

-- Store admin policies for stores
CREATE POLICY "Store admins can update their store" ON public.stores
  FOR UPDATE TO authenticated
  USING (public.is_store_admin(auth.uid(), id));

CREATE POLICY "Platform admins can insert stores" ON public.stores
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'platform_admin'));

CREATE POLICY "Platform admins can delete stores" ON public.stores
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'platform_admin'));

CREATE POLICY "Store admins can insert store_admins" ON public.store_admins
  FOR INSERT TO authenticated
  WITH CHECK (public.is_store_admin(auth.uid(), store_id) OR public.has_role(auth.uid(), 'platform_admin'));

CREATE POLICY "Store admins can delete store_admins" ON public.store_admins
  FOR DELETE TO authenticated
  USING (public.is_store_admin(auth.uid(), store_id) OR public.has_role(auth.uid(), 'platform_admin'));

-- ============================================
-- CATEGORIES
-- ============================================
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Store admins can insert categories" ON public.categories
  FOR INSERT TO authenticated
  WITH CHECK (public.is_store_admin(auth.uid(), store_id));

CREATE POLICY "Store admins can update categories" ON public.categories
  FOR UPDATE TO authenticated
  USING (public.is_store_admin(auth.uid(), store_id));

CREATE POLICY "Store admins can delete categories" ON public.categories
  FOR DELETE TO authenticated
  USING (public.is_store_admin(auth.uid(), store_id));

-- ============================================
-- PRODUCTS
-- ============================================
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  image_url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view products" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Store admins can insert products" ON public.products
  FOR INSERT TO authenticated
  WITH CHECK (public.is_store_admin(auth.uid(), store_id));

CREATE POLICY "Store admins can update products" ON public.products
  FOR UPDATE TO authenticated
  USING (public.is_store_admin(auth.uid(), store_id));

CREATE POLICY "Store admins can delete products" ON public.products
  FOR DELETE TO authenticated
  USING (public.is_store_admin(auth.uid(), store_id));

-- ============================================
-- PRODUCT VARIATIONS
-- ============================================
CREATE TABLE public.product_variations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.product_variations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view variations" ON public.product_variations
  FOR SELECT USING (true);

CREATE POLICY "Store admins can manage variations" ON public.product_variations
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_id AND public.is_store_admin(auth.uid(), p.store_id)
    )
  );

-- ============================================
-- CATEGORY ADDONS
-- ============================================
CREATE TABLE public.category_addons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.category_addons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view addons" ON public.category_addons
  FOR SELECT USING (true);

CREATE POLICY "Store admins can manage addons" ON public.category_addons
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.categories c
      WHERE c.id = category_id AND public.is_store_admin(auth.uid(), c.store_id)
    )
  );

-- ============================================
-- PROMOTIONS
-- ============================================
CREATE TABLE public.promotions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  discount_percent INTEGER,
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view promotions" ON public.promotions
  FOR SELECT USING (true);

CREATE POLICY "Store admins can manage promotions" ON public.promotions
  FOR ALL TO authenticated
  USING (public.is_store_admin(auth.uid(), store_id));

-- ============================================
-- ORDERS
-- ============================================
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  order_type order_type NOT NULL DEFAULT 'delivery',
  table_number TEXT,
  address TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  notes TEXT,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  status order_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create orders" ON public.orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Store admins can view orders" ON public.orders
  FOR SELECT TO authenticated
  USING (public.is_store_admin(auth.uid(), store_id));

CREATE POLICY "Store admins can update orders" ON public.orders
  FOR UPDATE TO authenticated
  USING (public.is_store_admin(auth.uid(), store_id));

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON public.stores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- STORAGE BUCKET FOR STORE ASSETS
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('store-assets', 'store-assets', true);

CREATE POLICY "Anyone can view store assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'store-assets');

CREATE POLICY "Authenticated users can upload store assets" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'store-assets');

CREATE POLICY "Authenticated users can update store assets" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'store-assets');

CREATE POLICY "Authenticated users can delete store assets" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'store-assets');

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_stores_slug ON public.stores(slug);
CREATE INDEX idx_categories_store ON public.categories(store_id);
CREATE INDEX idx_products_store ON public.products(store_id);
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_orders_store ON public.orders(store_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_store_admins_user ON public.store_admins(user_id);
CREATE INDEX idx_store_admins_store ON public.store_admins(store_id);
