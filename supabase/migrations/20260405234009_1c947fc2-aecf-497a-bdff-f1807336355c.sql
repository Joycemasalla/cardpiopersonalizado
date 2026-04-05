-- Enable realtime for orders
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- Allow platform_admin to view all orders
CREATE POLICY "Platform admins can view all orders"
ON public.orders
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'platform_admin'::app_role));

-- Allow platform_admin to update all orders
CREATE POLICY "Platform admins can update all orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'platform_admin'::app_role));