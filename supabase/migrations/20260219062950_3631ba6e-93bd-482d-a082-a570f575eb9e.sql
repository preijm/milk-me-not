-- Fix unprotected views by enabling security_invoker
-- This ensures views respect the RLS policies of underlying tables
-- instead of running as the view owner (which bypasses RLS)

ALTER VIEW public.milk_tests_view SET (security_invoker = true);
ALTER VIEW public.profiles_public SET (security_invoker = true);
ALTER VIEW public.product_search_view SET (security_invoker = true);
ALTER VIEW public.milk_tests_aggregated_view SET (security_invoker = true);