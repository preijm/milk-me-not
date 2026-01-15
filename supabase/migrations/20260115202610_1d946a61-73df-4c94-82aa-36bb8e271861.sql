-- Create app_versions table for version tracking
CREATE TABLE public.app_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  version TEXT NOT NULL UNIQUE,
  release_notes TEXT,
  is_major BOOLEAN NOT NULL DEFAULT false,
  requires_apk_update BOOLEAN NOT NULL DEFAULT false,
  min_supported_version TEXT,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_versions ENABLE ROW LEVEL SECURITY;

-- Public read access for version checks
CREATE POLICY "Anyone can view app versions"
ON public.app_versions
FOR SELECT
USING (true);

-- Only admins can manage versions
CREATE POLICY "Admins can insert app versions"
ON public.app_versions
FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Admins can update app versions"
ON public.app_versions
FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admins can delete app versions"
ON public.app_versions
FOR DELETE
USING (is_admin());

-- Insert initial version
INSERT INTO public.app_versions (version, release_notes, is_major, requires_apk_update)
VALUES ('1.0.0', '## Initial Release

### Features
- Rate and review plant-based milks
- Track your testing history
- View aggregated community ratings
- Mobile app support with native APK

### Coming Soon
- More filtering options
- Enhanced product details', false, false);