-- Update Peter and Ilva to admin role
UPDATE public.user_roles 
SET role = 'admin'::app_role 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('peterreijm@live.nl', 'ilva@stijnen.de')
);