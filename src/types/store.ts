export interface Store {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  banner_url: string | null;
  banner_text: string | null;
  color_primary: string;
  color_secondary: string;
  color_background: string;
  color_text: string;
  whatsapp: string | null;
  address: string | null;
  pix_key: string | null;
  delivery_fee: number;
  estimated_delivery_time: string | null;
  is_open: boolean;
  closed_message: string | null;
  maintenance_mode: boolean;
  operating_hours: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  store_id: string;
  name: string;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  store_id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductVariation {
  id: string;
  product_id: string;
  name: string;
  price: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface CategoryAddon {
  id: string;
  category_id: string;
  name: string;
  price: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Promotion {
  id: string;
  store_id: string;
  product_id: string | null;
  title: string;
  description: string | null;
  discount_percent: number | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  created_at: string;
}

// Combined view for public menu
export interface MenuProduct {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  category_id: string;
  category_name: string;
  sizes: MenuProductSize[];
}

export interface MenuProductSize {
  id: string;
  name: string;
  price: number;
}

export interface MenuAddon {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  product: MenuProduct;
  selectedSize: MenuProductSize;
  addons: MenuAddon[];
  quantity: number;
  notes?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
export type OrderType = 'delivery' | 'pickup' | 'dine_in';

export interface Order {
  id: string;
  store_id: string;
  customer_name: string;
  customer_phone: string | null;
  order_type: OrderType;
  table_number: string | null;
  address: string | null;
  items: CartItem[];
  notes: string | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
}
