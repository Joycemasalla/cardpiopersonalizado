
-- Fix the permissive INSERT policy on orders to validate store exists
DROP POLICY "Anyone can create orders" ON public.orders;

CREATE POLICY "Anyone can create orders for existing stores" ON public.orders
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.stores s
      WHERE s.id = store_id AND s.is_open = true AND s.maintenance_mode = false
    )
  );
