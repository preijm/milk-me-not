-- Update existing notifications to use the new format with product details
DO $$
DECLARE
  notif RECORD;
  milk_test_data RECORD;
  product_desc TEXT;
  username TEXT;
BEGIN
  -- Loop through all existing notifications
  FOR notif IN 
    SELECT id, milk_test_id, triggered_by_user_id, type
    FROM public.notifications
    WHERE milk_test_id IS NOT NULL
  LOOP
    -- Get detailed product data for this notification
    SELECT 
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
    WHERE mt.id = notif.milk_test_id
    GROUP BY b.name, n.name, pr.is_barista;
    
    -- Get the username of the person who triggered the notification
    SELECT p.username INTO username
    FROM public.profiles p
    WHERE p.id = notif.triggered_by_user_id;
    
    -- Build product description with details
    IF milk_test_data IS NOT NULL THEN
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
      
      -- Update the notification message
      UPDATE public.notifications
      SET message = COALESCE(username, 'Someone') || '|' || product_desc
      WHERE id = notif.id;
    END IF;
  END LOOP;
END $$;