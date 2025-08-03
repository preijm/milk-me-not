-- Create notification types enum
CREATE TYPE public.notification_type AS ENUM ('like', 'comment');

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  milk_test_id UUID,
  triggered_by_user_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notification preferences table
CREATE TABLE public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  likes_enabled BOOLEAN NOT NULL DEFAULT true,
  comments_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Enable RLS on notification preferences table
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS policies for notification preferences
CREATE POLICY "Users can view their own notification preferences"
ON public.notification_preferences
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification preferences"
ON public.notification_preferences
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences"
ON public.notification_preferences
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger for notifications
CREATE TRIGGER update_notifications_updated_at
BEFORE UPDATE ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create updated_at trigger for notification preferences
CREATE TRIGGER update_notification_preferences_updated_at
BEFORE UPDATE ON public.notification_preferences
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Function to create notifications for likes
CREATE OR REPLACE FUNCTION public.create_like_notification()
RETURNS TRIGGER AS $$
DECLARE
  milk_test_owner UUID;
  milk_test_data RECORD;
  preferences RECORD;
BEGIN
  -- Get the milk test owner and data
  SELECT mt.user_id, mt.id, p.username, b.name as brand_name, n.name as product_name
  INTO milk_test_data
  FROM public.milk_tests mt
  LEFT JOIN public.profiles p ON mt.user_id = p.id
  LEFT JOIN public.products pr ON mt.product_id = pr.id
  LEFT JOIN public.brands b ON pr.brand_id = b.id
  LEFT JOIN public.names n ON pr.name_id = n.id
  WHERE mt.id = NEW.milk_test_id;
  
  -- Don't create notification if user likes their own test
  IF milk_test_data.user_id = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  -- Check user's notification preferences
  SELECT likes_enabled INTO preferences
  FROM public.notification_preferences
  WHERE user_id = milk_test_data.user_id;
  
  -- If no preferences found, default to enabled
  IF preferences IS NULL OR preferences.likes_enabled = true THEN
    -- Get the liker's username
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      milk_test_id,
      triggered_by_user_id
    )
    SELECT 
      milk_test_data.user_id,
      'like',
      'New Like on Your Test',
      liker.username || ' liked your test of ' || COALESCE(milk_test_data.brand_name || ' ' || milk_test_data.product_name, 'a product'),
      NEW.milk_test_id,
      NEW.user_id
    FROM public.profiles liker
    WHERE liker.id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notifications for comments
CREATE OR REPLACE FUNCTION public.create_comment_notification()
RETURNS TRIGGER AS $$
DECLARE
  milk_test_owner UUID;
  milk_test_data RECORD;
  preferences RECORD;
BEGIN
  -- Get the milk test owner and data
  SELECT mt.user_id, mt.id, p.username, b.name as brand_name, n.name as product_name
  INTO milk_test_data
  FROM public.milk_tests mt
  LEFT JOIN public.profiles p ON mt.user_id = p.id
  LEFT JOIN public.products pr ON mt.product_id = pr.id
  LEFT JOIN public.brands b ON pr.brand_id = b.id
  LEFT JOIN public.names n ON pr.name_id = n.id
  WHERE mt.id = NEW.milk_test_id;
  
  -- Don't create notification if user comments on their own test
  IF milk_test_data.user_id = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  -- Check user's notification preferences
  SELECT comments_enabled INTO preferences
  FROM public.notification_preferences
  WHERE user_id = milk_test_data.user_id;
  
  -- If no preferences found, default to enabled
  IF preferences IS NULL OR preferences.comments_enabled = true THEN
    -- Get the commenter's username
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      milk_test_id,
      triggered_by_user_id
    )
    SELECT 
      milk_test_data.user_id,
      'comment',
      'New Comment on Your Test',
      commenter.username || ' commented on your test of ' || COALESCE(milk_test_data.brand_name || ' ' || milk_test_data.product_name, 'a product'),
      NEW.milk_test_id,
      NEW.user_id
    FROM public.profiles commenter
    WHERE commenter.id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for automatic notification creation
CREATE TRIGGER trigger_create_like_notification
AFTER INSERT ON public.likes
FOR EACH ROW
EXECUTE FUNCTION public.create_like_notification();

CREATE TRIGGER trigger_create_comment_notification
AFTER INSERT ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.create_comment_notification();

-- Function to create default notification preferences for new users
CREATE OR REPLACE FUNCTION public.create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notification_preferences (user_id, likes_enabled, comments_enabled)
  VALUES (NEW.id, true, true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to set default notification preferences for new users
CREATE TRIGGER trigger_create_default_notification_preferences
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.create_default_notification_preferences();