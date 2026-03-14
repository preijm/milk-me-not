-- Fix: Remove overly permissive products UPDATE policy that allows any authenticated user to update any product
DROP POLICY IF EXISTS "Users can update their products" ON public.products;