
CREATE OR REPLACE FUNCTION public.create_like_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  milk_test_data RECORD;
  preferences RECORD;
  flavor_list TEXT[];
  product_desc TEXT;
BEGIN
  -- Get the milk test owner and detailed product data
  SELECT 
    mt.user_id, 
    mt.id, 
    b.name as brand_name, 
    n.name as product_name,
    pr.is_barista,
    ARRAY_AGG(DISTINCT f.name) FILTER (WHERE f.name IS NOT NULL) as flavors
  INTO milk_test_data
  FROM public.milk_tests mt
  LEFT JOIN public.products pr ON mt.product_id = pr.id
  LEFT JOIN public.brands b ON pr.brand_id = b.id
  LEFT JOIN public.names n ON pr.name_id = n.id
  LEFT JOIN public.product_flavors pf ON pr.id = pf.product_id
  LEFT JOIN public.flavors f ON pf.flavor_id = f.id
  WHERE mt.id = NEW.milk_test_id
  GROUP BY mt.user_id, mt.id, b.name, n.name, pr.is_barista;
  
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
    -- Build product description with details
    product_desc := COALESCE(milk_test_data.brand_name, 'Unknown Brand');
    
    IF milk_test_data.product_name IS NOT NULL THEN
      product_desc := product_desc || ' • ' || milk_test_data.product_name;
    END IF;
    
    -- Add barista indicator
    IF milk_test_data.is_barista = true THEN
      product_desc := product_desc || '|BARISTA';
    END IF;
    
    -- Add flavors
    IF milk_test_data.flavors IS NOT NULL AND array_length(milk_test_data.flavors, 1) > 0 THEN
      product_desc := product_desc || '|FLAVORS:' || array_to_string(milk_test_data.flavors, ',');
    END IF;
    
    -- Get the liker's username and create notification
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
      liker.username || '|' || product_desc,
      NEW.milk_test_id,
      NEW.user_id
    FROM public.profiles liker
    WHERE liker.id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_comment_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  milk_test_data RECORD;
  preferences RECORD;
  product_desc TEXT;
BEGIN
  -- Get the milk test owner and detailed product data
  SELECT 
    mt.user_id, 
    mt.id, 
    b.name as brand_name, 
    n.name as product_name,
    pr.is_barista,
    ARRAY_AGG(DISTINCT f.name) FILTER (WHERE f.name IS NOT NULL) as flavors
  INTO milk_test_data
  FROM public.milk_tests mt
  LEFT JOIN public.products pr ON mt.product_id = pr.id
  LEFT JOIN public.brands b ON pr.brand_id = b.id
  LEFT JOIN public.names n ON pr.name_id = n.id
  LEFT JOIN public.product_flavors pf ON pr.id = pf.product_id
  LEFT JOIN public.flavors f ON pf.flavor_id = f.id
  WHERE mt.id = NEW.milk_test_id
  GROUP BY mt.user_id, mt.id, b.name, n.name, pr.is_barista;
  
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
    -- Build product description with details
    product_desc := COALESCE(milk_test_data.brand_name, 'Unknown Brand');
    
    IF milk_test_data.product_name IS NOT NULL THEN
      product_desc := product_desc || ' • ' || milk_test_data.product_name;
    END IF;
    
    -- Add barista indicator
    IF milk_test_data.is_barista = true THEN
      product_desc := product_desc || '|BARISTA';
    END IF;
    
    -- Add flavors
    IF milk_test_data.flavors IS NOT NULL AND array_length(milk_test_data.flavors, 1) > 0 THEN
      product_desc := product_desc || '|FLAVORS:' || array_to_string(milk_test_data.flavors, ',');
    END IF;
    
    -- Get the commenter's username and create notification
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
      commenter.username || '|' || product_desc,
      NEW.milk_test_id,
      NEW.user_id
    FROM public.profiles commenter
    WHERE commenter.id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_default_notification_preferences()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.notification_preferences (user_id, likes_enabled, comments_enabled)
  VALUES (NEW.id, true, true);
  RETURN NEW;
END;
$function$;
