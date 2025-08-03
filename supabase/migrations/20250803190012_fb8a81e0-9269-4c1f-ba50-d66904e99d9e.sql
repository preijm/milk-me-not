-- Add newsletter_enabled column to notification_preferences table
ALTER TABLE public.notification_preferences 
ADD COLUMN newsletter_enabled boolean NOT NULL DEFAULT true;