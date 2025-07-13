-- Create role-based access control system
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (public.is_admin());

CREATE POLICY "Admins can manage roles" 
ON public.user_roles 
FOR ALL 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Update existing RLS policies to restrict admin operations
-- Drop existing permissive policies for brands
DROP POLICY IF EXISTS "Allow authenticated users to insert brands" ON public.brands;
DROP POLICY IF EXISTS "Allow authenticated users to update brands" ON public.brands;
DROP POLICY IF EXISTS "Allow authenticated users to delete brands" ON public.brands;

-- Create admin-only policies for brands
CREATE POLICY "Admins can insert brands" 
ON public.brands 
FOR INSERT 
TO authenticated 
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update brands" 
ON public.brands 
FOR UPDATE 
TO authenticated 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete brands" 
ON public.brands 
FOR DELETE 
TO authenticated 
USING (public.is_admin());

-- Update shops policies
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.shops;
DROP POLICY IF EXISTS "Allow authenticated users to update shops" ON public.shops;
DROP POLICY IF EXISTS "Allow authenticated users to delete shops" ON public.shops;

CREATE POLICY "Admins can insert shops" 
ON public.shops 
FOR INSERT 
TO authenticated 
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update shops" 
ON public.shops 
FOR UPDATE 
TO authenticated 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete shops" 
ON public.shops 
FOR DELETE 
TO authenticated 
USING (public.is_admin());

-- Update countries policies
DROP POLICY IF EXISTS "Allow authenticated users to insert countries" ON public.countries;
DROP POLICY IF EXISTS "Allow authenticated users to update countries" ON public.countries;
DROP POLICY IF EXISTS "Allow authenticated users to delete countries" ON public.countries;

CREATE POLICY "Admins can insert countries" 
ON public.countries 
FOR INSERT 
TO authenticated 
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update countries" 
ON public.countries 
FOR UPDATE 
TO authenticated 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete countries" 
ON public.countries 
FOR DELETE 
TO authenticated 
USING (public.is_admin());

-- Update properties policies
DROP POLICY IF EXISTS "Allow authenticated users to insert properties" ON public.properties;
DROP POLICY IF EXISTS "Allow authenticated users to update properties" ON public.properties;
DROP POLICY IF EXISTS "Allow authenticated users to delete properties" ON public.properties;

CREATE POLICY "Admins can insert properties" 
ON public.properties 
FOR INSERT 
TO authenticated 
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update properties" 
ON public.properties 
FOR UPDATE 
TO authenticated 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete properties" 
ON public.properties 
FOR DELETE 
TO authenticated 
USING (public.is_admin());

-- Update flavors policies
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.flavors;
DROP POLICY IF EXISTS "Allow authenticated users to update flavors" ON public.flavors;
DROP POLICY IF EXISTS "Allow authenticated users to delete flavors" ON public.flavors;

CREATE POLICY "Admins can insert flavors" 
ON public.flavors 
FOR INSERT 
TO authenticated 
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update flavors" 
ON public.flavors 
FOR UPDATE 
TO authenticated 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete flavors" 
ON public.flavors 
FOR DELETE 
TO authenticated 
USING (public.is_admin());

-- Update products policies
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated users to update products" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated users to delete products" ON public.products;

CREATE POLICY "Admins can insert products" 
ON public.products 
FOR INSERT 
TO authenticated 
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update products" 
ON public.products 
FOR UPDATE 
TO authenticated 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete products" 
ON public.products 
FOR DELETE 
TO authenticated 
USING (public.is_admin());

-- Update product_flavors and product_properties for admin-only modifications
DROP POLICY IF EXISTS "Allow inserts on product_flavors" ON public.product_flavors;
DROP POLICY IF EXISTS "Allow authenticated users to update product_flavors" ON public.product_flavors;
DROP POLICY IF EXISTS "Allow authenticated users to delete product_flavors" ON public.product_flavors;

CREATE POLICY "Admins can insert product_flavors" 
ON public.product_flavors 
FOR INSERT 
TO authenticated 
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update product_flavors" 
ON public.product_flavors 
FOR UPDATE 
TO authenticated 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete product_flavors" 
ON public.product_flavors 
FOR DELETE 
TO authenticated 
USING (public.is_admin());

DROP POLICY IF EXISTS "Allow inserts on product_properties" ON public.product_properties;
DROP POLICY IF EXISTS "Allow authenticated users to update product_properties" ON public.product_properties;
DROP POLICY IF EXISTS "Allow authenticated users to delete product_properties" ON public.product_properties;

CREATE POLICY "Admins can insert product_properties" 
ON public.product_properties 
FOR INSERT 
TO authenticated 
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update product_properties" 
ON public.product_properties 
FOR UPDATE 
TO authenticated 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete product_properties" 
ON public.product_properties 
FOR DELETE 
TO authenticated 
USING (public.is_admin());

-- Create function to assign default user role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Assign default 'user' role to new users
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

-- Create trigger to assign role on user creation
CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Create audit log table for security monitoring
CREATE TABLE public.security_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    table_name TEXT,
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" 
ON public.security_audit_log 
FOR SELECT 
TO authenticated 
USING (public.is_admin());