


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."app_role" AS ENUM (
    'admin',
    'user'
);


ALTER TYPE "public"."app_role" OWNER TO "postgres";


CREATE TYPE "public"."notification_type" AS ENUM (
    'like',
    'comment'
);


ALTER TYPE "public"."notification_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_username_exists"("username_to_check" "text") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE username = username_to_check
  );
$$;


ALTER FUNCTION "public"."check_username_exists"("username_to_check" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_comment_notification"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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
$$;


ALTER FUNCTION "public"."create_comment_notification"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_default_notification_preferences"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  INSERT INTO public.notification_preferences (user_id, likes_enabled, comments_enabled)
  VALUES (NEW.id, true, true);
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_default_notification_preferences"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_like_notification"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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
$$;


ALTER FUNCTION "public"."create_like_notification"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_aggregated_milk_tests"() RETURNS TABLE("product_id" "uuid", "rating" numeric, "price_quality_ratio" "text", "country_code" "text", "drink_preference" "text", "created_at" timestamp with time zone, "brand_name" "text", "product_name" "text", "is_barista" boolean, "property_names" "text"[], "flavor_names" "text"[])
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
    SELECT 
        mt.product_id,
        mt.rating,
        mt.price_quality_ratio,
        mt.country_code,
        mt.drink_preference,
        mt.created_at,
        b.name as brand_name,
        n.name as product_name,
        prod.is_barista,
        COALESCE(
            ARRAY_AGG(DISTINCT prop.name) FILTER (WHERE prop.name IS NOT NULL),
            ARRAY[]::text[]
        ) as property_names,
        COALESCE(
            ARRAY_AGG(DISTINCT fl.name) FILTER (WHERE fl.name IS NOT NULL),
            ARRAY[]::text[]
        ) as flavor_names
    FROM public.milk_tests mt
    LEFT JOIN public.products prod ON mt.product_id = prod.id
    LEFT JOIN public.brands b ON prod.brand_id = b.id
    LEFT JOIN public.names n ON prod.name_id = n.id
    LEFT JOIN public.product_properties pp ON prod.id = pp.product_id
    LEFT JOIN public.properties prop ON pp.property_id = prop.id
    LEFT JOIN public.product_flavors pf ON prod.id = pf.product_id
    LEFT JOIN public.flavors fl ON pf.flavor_id = fl.id
    GROUP BY 
        mt.product_id, mt.rating, mt.price_quality_ratio, mt.country_code, 
        mt.drink_preference, mt.created_at, b.name, n.name, prod.is_barista;
$$;


ALTER FUNCTION "public"."get_aggregated_milk_tests"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_all_milk_tests"() RETURNS TABLE("id" "uuid", "user_id" "uuid", "product_id" "uuid", "rating" numeric, "notes" "text", "shop_name" "text", "country_code" "text", "price_quality_ratio" "text", "picture_path" "text", "drink_preference" "text", "created_at" timestamp with time zone, "brand_id" "uuid", "brand_name" "text", "product_name" "text", "username" "text", "is_barista" boolean, "property_names" "text"[], "flavor_names" "text"[])
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
    SELECT 
        mt.id,
        mt.user_id,
        mt.product_id,
        mt.rating,
        mt.notes,
        mt.shop_name,
        mt.country_code,
        mt.price_quality_ratio,
        mt.picture_path,
        mt.drink_preference,
        mt.created_at,
        b.id as brand_id,
        b.name as brand_name,
        n.name as product_name,
        p.username,
        prod.is_barista,
        COALESCE(
            ARRAY_AGG(DISTINCT prop.name) FILTER (WHERE prop.name IS NOT NULL),
            ARRAY[]::text[]
        ) as property_names,
        COALESCE(
            ARRAY_AGG(DISTINCT fl.name) FILTER (WHERE fl.name IS NOT NULL),
            ARRAY[]::text[]
        ) as flavor_names
    FROM public.milk_tests mt
    LEFT JOIN public.products prod ON mt.product_id = prod.id
    LEFT JOIN public.brands b ON prod.brand_id = b.id
    LEFT JOIN public.names n ON prod.name_id = n.id
    LEFT JOIN public.profiles p ON mt.user_id = p.id
    LEFT JOIN public.product_properties pp ON prod.id = pp.product_id
    LEFT JOIN public.properties prop ON pp.property_id = prop.id
    LEFT JOIN public.product_flavors pf ON prod.id = pf.product_id
    LEFT JOIN public.flavors fl ON pf.flavor_id = fl.id
    GROUP BY 
        mt.id, mt.user_id, mt.product_id, mt.rating, mt.notes, mt.shop_name, 
        mt.country_code, mt.price_quality_ratio, mt.picture_path, mt.drink_preference, 
        mt.created_at, b.id, b.name, n.name, p.username, prod.is_barista
    ORDER BY mt.created_at DESC;
$$;


ALTER FUNCTION "public"."get_all_milk_tests"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_all_milk_tests"("page_limit" integer DEFAULT 50, "page_offset" integer DEFAULT 0, "filter_product_id" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("id" "uuid", "user_id" "uuid", "product_id" "uuid", "rating" numeric, "notes" "text", "shop_name" "text", "country_code" "text", "price_quality_ratio" "text", "picture_path" "text", "drink_preference" "text", "created_at" timestamp with time zone, "brand_id" "uuid", "brand_name" "text", "product_name" "text", "username" "text", "is_barista" boolean, "property_names" "text"[], "flavor_names" "text"[])
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
    SELECT 
        mt.id,
        mt.user_id,
        mt.product_id,
        mt.rating,
        mt.notes,
        mt.shop_name,
        mt.country_code,
        mt.price_quality_ratio,
        mt.picture_path,
        mt.drink_preference,
        mt.created_at,
        b.id as brand_id,
        b.name as brand_name,
        n.name as product_name,
        p.username,
        prod.is_barista,
        COALESCE(
            ARRAY_AGG(DISTINCT prop.name) FILTER (WHERE prop.name IS NOT NULL),
            ARRAY[]::text[]
        ) as property_names,
        COALESCE(
            ARRAY_AGG(DISTINCT fl.name) FILTER (WHERE fl.name IS NOT NULL),
            ARRAY[]::text[]
        ) as flavor_names
    FROM public.milk_tests mt
    LEFT JOIN public.products prod ON mt.product_id = prod.id
    LEFT JOIN public.brands b ON prod.brand_id = b.id
    LEFT JOIN public.names n ON prod.name_id = n.id
    LEFT JOIN public.profiles p ON mt.user_id = p.id
    LEFT JOIN public.product_properties pp ON prod.id = pp.product_id
    LEFT JOIN public.properties prop ON pp.property_id = prop.id
    LEFT JOIN public.product_flavors pf ON prod.id = pf.product_id
    LEFT JOIN public.flavors fl ON pf.flavor_id = fl.id
    WHERE mt.is_hidden_from_feed = false
      AND (filter_product_id IS NULL OR mt.product_id = filter_product_id)
    GROUP BY 
        mt.id, mt.user_id, mt.product_id, mt.rating, mt.notes, mt.shop_name, 
        mt.country_code, mt.price_quality_ratio, mt.picture_path, mt.drink_preference, 
        mt.created_at, b.id, b.name, n.name, p.username, prod.is_barista
    ORDER BY mt.created_at DESC
    LIMIT LEAST(page_limit, 200)
    OFFSET page_offset;
$$;


ALTER FUNCTION "public"."get_all_milk_tests"("page_limit" integer, "page_offset" integer, "filter_product_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_product_by_barcode"("_barcode" "text") RETURNS "uuid"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT product_id FROM public.product_barcodes WHERE barcode = _barcode
$$;


ALTER FUNCTION "public"."get_product_by_barcode"("_barcode" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_profile_username"("_user_id" "uuid") RETURNS "text"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT p.username FROM public.profiles p WHERE p.id = _user_id
$$;


ALTER FUNCTION "public"."get_profile_username"("_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_public_profile"("_user_id" "uuid") RETURNS TABLE("id" "uuid", "username" "text", "avatar_url" "text")
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT p.id, p.username, p.avatar_url
  FROM public.profiles p
  WHERE p.id = _user_id
$$;


ALTER FUNCTION "public"."get_public_profile"("_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_public_stats"() RETURNS TABLE("total_members" bigint, "total_tests" bigint, "total_products" bigint, "total_brands" bigint)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT 
    (SELECT COUNT(*) FROM public.profiles) as total_members,
    (SELECT COUNT(*) FROM public.milk_tests) as total_tests,
    (SELECT COUNT(*) FROM public.products) as total_products,
    (SELECT COUNT(*) FROM public.brands) as total_brands;
$$;


ALTER FUNCTION "public"."get_public_stats"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    new.id,
    COALESCE(
      new.raw_user_meta_data->>'username',
      'user_' || substr(gen_random_uuid()::text, 1, 8)
    )
  );
  RETURN new;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user_role"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Assign default 'user' role to new users
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


ALTER FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_security_event"("event_type_val" "text", "event_data_val" "jsonb" DEFAULT NULL::"jsonb") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  INSERT INTO public.security_log (user_id, event_type, event_data)
  VALUES (auth.uid(), event_type_val, event_data_val);
END;
$$;


ALTER FUNCTION "public"."log_security_event"("event_type_val" "text", "event_data_val" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_comment_with_details"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  milk_test_data RECORD;
  commenter_username TEXT;
  product_desc TEXT;
  properties_arr TEXT[];
  preferences RECORD;
BEGIN
  -- Get detailed product data
  SELECT 
    mt.user_id,
    b.name as brand_name, 
    n.name as product_name,
    pr.is_barista,
    ARRAY_AGG(DISTINCT prop.name) FILTER (WHERE prop.name IS NOT NULL) as properties,
    ARRAY_AGG(DISTINCT f.name) FILTER (WHERE f.name IS NOT NULL) as flavors
  INTO milk_test_data
  FROM public.milk_tests mt
  LEFT JOIN public.products pr ON mt.product_id = pr.id
  LEFT JOIN public.brands b ON pr.brand_id = b.id
  LEFT JOIN public.names n ON pr.name_id = n.id
  LEFT JOIN public.product_properties pp ON pr.id = pp.product_id
  LEFT JOIN public.properties prop ON pp.property_id = prop.id
  LEFT JOIN public.product_flavors pf ON pr.id = pf.product_id
  LEFT JOIN public.flavors f ON pf.flavor_id = f.id
  WHERE mt.id = NEW.milk_test_id
  GROUP BY mt.user_id, b.name, n.name, pr.is_barista;

  -- Only create notification if the commenter is not the test owner
  IF milk_test_data.user_id != NEW.user_id THEN
    -- Get notification preferences
    SELECT comments_enabled INTO preferences
    FROM public.notification_preferences
    WHERE user_id = milk_test_data.user_id;

    -- Check if user has disabled comment notifications (default to enabled if no preference set)
    IF preferences.comments_enabled IS NULL OR preferences.comments_enabled = true THEN
      -- Get commenter username
      SELECT username INTO commenter_username
      FROM public.profiles
      WHERE id = NEW.user_id;

      -- Build product description with brand - product format
      product_desc := COALESCE(milk_test_data.brand_name, 'Unknown Brand');
      
      IF milk_test_data.product_name IS NOT NULL THEN
        product_desc := product_desc || ' - ' || milk_test_data.product_name;
      END IF;
      
      -- Add barista indicator
      IF milk_test_data.is_barista = true THEN
        product_desc := product_desc || '|BARISTA';
      END IF;
      
      -- Add properties
      IF milk_test_data.properties IS NOT NULL AND array_length(milk_test_data.properties, 1) > 0 THEN
        product_desc := product_desc || '|PROPERTIES:' || array_to_string(milk_test_data.properties, ',');
      END IF;
      
      -- Add flavors
      IF milk_test_data.flavors IS NOT NULL AND array_length(milk_test_data.flavors, 1) > 0 THEN
        product_desc := product_desc || '|FLAVORS:' || array_to_string(milk_test_data.flavors, ',');
      END IF;

      -- Create the notification with the new format
      INSERT INTO public.notifications (
        user_id,
        type,
        title,
        message,
        milk_test_id,
        triggered_by_user_id
      )
      VALUES (
        milk_test_data.user_id,
        'comment',
        'New Comment on Your Test',
        COALESCE(commenter_username, 'Someone') || '|' || product_desc,
        NEW.milk_test_id,
        NEW.user_id
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."notify_comment_with_details"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_like_with_details"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  milk_test_data RECORD;
  liker_username TEXT;
  product_desc TEXT;
  properties_arr TEXT[];
  preferences RECORD;
BEGIN
  -- Get detailed product data
  SELECT 
    mt.user_id,
    b.name as brand_name, 
    n.name as product_name,
    pr.is_barista,
    ARRAY_AGG(DISTINCT prop.name) FILTER (WHERE prop.name IS NOT NULL) as properties,
    ARRAY_AGG(DISTINCT f.name) FILTER (WHERE f.name IS NOT NULL) as flavors
  INTO milk_test_data
  FROM public.milk_tests mt
  LEFT JOIN public.products pr ON mt.product_id = pr.id
  LEFT JOIN public.brands b ON pr.brand_id = b.id
  LEFT JOIN public.names n ON pr.name_id = n.id
  LEFT JOIN public.product_properties pp ON pr.id = pp.product_id
  LEFT JOIN public.properties prop ON pp.property_id = prop.id
  LEFT JOIN public.product_flavors pf ON pr.id = pf.product_id
  LEFT JOIN public.flavors f ON pf.flavor_id = f.id
  WHERE mt.id = NEW.milk_test_id
  GROUP BY mt.user_id, b.name, n.name, pr.is_barista;

  -- Only create notification if the liker is not the test owner
  IF milk_test_data.user_id != NEW.user_id THEN
    -- Get notification preferences
    SELECT likes_enabled INTO preferences
    FROM public.notification_preferences
    WHERE user_id = milk_test_data.user_id;

    -- Check if user has disabled like notifications (default to enabled if no preference set)
    IF preferences.likes_enabled IS NULL OR preferences.likes_enabled = true THEN
      -- Get liker username
      SELECT username INTO liker_username
      FROM public.profiles
      WHERE id = NEW.user_id;

      -- Build product description with brand - product format
      product_desc := COALESCE(milk_test_data.brand_name, 'Unknown Brand');
      
      IF milk_test_data.product_name IS NOT NULL THEN
        product_desc := product_desc || ' - ' || milk_test_data.product_name;
      END IF;
      
      -- Add barista indicator
      IF milk_test_data.is_barista = true THEN
        product_desc := product_desc || '|BARISTA';
      END IF;
      
      -- Add properties
      IF milk_test_data.properties IS NOT NULL AND array_length(milk_test_data.properties, 1) > 0 THEN
        product_desc := product_desc || '|PROPERTIES:' || array_to_string(milk_test_data.properties, ',');
      END IF;
      
      -- Add flavors
      IF milk_test_data.flavors IS NOT NULL AND array_length(milk_test_data.flavors, 1) > 0 THEN
        product_desc := product_desc || '|FLAVORS:' || array_to_string(milk_test_data.flavors, ',');
      END IF;

      -- Create the notification with the new format
      INSERT INTO public.notifications (
        user_id,
        type,
        title,
        message,
        milk_test_id,
        triggered_by_user_id
      )
      VALUES (
        milk_test_data.user_id,
        'like',
        'New Like on Your Test',
        COALESCE(liker_username, 'Someone') || '|' || product_desc,
        NEW.milk_test_id,
        NEW.user_id
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."notify_like_with_details"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."remember_product_barcode"("_barcode" "text", "_product_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $_$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;

  IF _barcode !~ '^[0-9]{8,14}$' THEN
    RETURN;
  END IF;

  INSERT INTO public.product_barcodes (barcode, product_id, created_by)
  VALUES (_barcode, _product_id, auth.uid())
  ON CONFLICT (barcode) DO NOTHING;
END;
$_$;


ALTER FUNCTION "public"."remember_product_barcode"("_barcode" "text", "_product_id" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "brand_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "name_id" "uuid",
    "is_barista" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."products" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."search_product_types"() RETURNS SETOF "public"."products"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
    -- Function logic here
END;
$$;


ALTER FUNCTION "public"."search_product_types"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."search_product_types"("search_term" "text") RETURNS TABLE("id" "uuid", "brand_id" "uuid", "brand_name" "text", "product_name" "text", "property_names" "text"[], "flavor_names" "text"[], "product_name_id" "uuid", "is_barista" boolean)
    LANGUAGE "plpgsql" STABLE
    SET "search_path" TO 'public'
    AS $$
DECLARE
  safe_term text;
BEGIN
  -- Sanitize wildcard characters to prevent pattern manipulation
  safe_term := regexp_replace(search_term, '[%_\\]', '', 'g');
  
  RETURN QUERY
  SELECT 
    psv.id,
    psv.brand_id,
    psv.brand_name,
    psv.product_name,
    psv.property_names,
    psv.flavor_names,
    psv.product_name_id,
    psv.is_barista
  FROM public.product_search_view psv
  WHERE 
    psv.brand_name ILIKE '%' || safe_term || '%' OR
    psv.product_name ILIKE '%' || safe_term || '%' OR
    EXISTS (
      SELECT 1
      FROM unnest(psv.property_names) AS property_name
      WHERE property_name ILIKE '%' || safe_term || '%'
    ) OR
    EXISTS (
      SELECT 1
      FROM unnest(psv.flavor_names) AS flavor_name
      WHERE flavor_name ILIKE '%' || safe_term || '%'
    );
END;
$$;


ALTER FUNCTION "public"."search_product_types"("search_term" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_comment_content"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Strip < and > to prevent XSS
  NEW.content = regexp_replace(NEW.content, '[<>]', '', 'g');
  
  -- Ensure content is not empty after trimming
  IF length(trim(NEW.content)) = 0 THEN
    RAISE EXCEPTION 'Comment content cannot be empty';
  END IF;
  
  -- Enforce max length
  IF length(NEW.content) > 1000 THEN
    RAISE EXCEPTION 'Comment content must be 1000 characters or less';
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validate_comment_content"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_milk_test_input"("rating_val" numeric, "notes_val" "text", "shop_name_val" "text", "country_code_val" "text") RETURNS boolean
    LANGUAGE "plpgsql" STABLE
    SET "search_path" TO 'public'
    AS $_$
BEGIN
  -- Validate rating is between 0 and 10
  IF rating_val < 0 OR rating_val > 10 THEN
    RETURN false;
  END IF;
  
  -- Validate notes length (max 1000 characters)
  IF notes_val IS NOT NULL AND length(notes_val) > 1000 THEN
    RETURN false;
  END IF;
  
  -- Validate shop name length (max 255 characters)
  IF shop_name_val IS NOT NULL AND length(shop_name_val) > 255 THEN
    RETURN false;
  END IF;
  
  -- Validate country code format (2 letter code)
  IF country_code_val IS NOT NULL AND (length(country_code_val) != 2 OR country_code_val !~ '^[A-Z]{2}$') THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$_$;


ALTER FUNCTION "public"."validate_milk_test_input"("rating_val" numeric, "notes_val" "text", "shop_name_val" "text", "country_code_val" "text") OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."app_versions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "version" "text" NOT NULL,
    "release_notes" "text",
    "is_major" boolean DEFAULT false NOT NULL,
    "requires_apk_update" boolean DEFAULT false NOT NULL,
    "min_supported_version" "text",
    "published_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."app_versions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."brands" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."brands" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "milk_test_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."countries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "code" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."countries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."flavors" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "ordering" integer DEFAULT 999 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "key" "text" NOT NULL
);


ALTER TABLE "public"."flavors" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."likes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "milk_test_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."likes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."milk_tests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "rating" numeric(3,1) NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "drink_preference" "text",
    "product_id" "uuid",
    "picture_path" "text",
    "price_quality_ratio" "text",
    "country_code" "text",
    "shop_name" "text",
    "is_hidden_from_feed" boolean DEFAULT false NOT NULL,
    CONSTRAINT "milk_tests_drink_preference_check" CHECK (("drink_preference" = ANY (ARRAY['cold'::"text", 'hot'::"text", 'coffee'::"text"]))),
    CONSTRAINT "milk_tests_rating_check" CHECK ((("rating" >= (0)::numeric) AND ("rating" <= (10)::numeric))),
    CONSTRAINT "milk_tests_user_id_not_null_check" CHECK (("user_id" IS NOT NULL))
);


ALTER TABLE "public"."milk_tests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."names" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."names" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_flavors" (
    "product_id" "uuid" NOT NULL,
    "flavor_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."product_flavors" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_properties" (
    "product_id" "uuid" NOT NULL,
    "property_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."product_properties" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."properties" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "name" "text" NOT NULL,
    "key" "text" NOT NULL,
    "ordering" integer NOT NULL
);


ALTER TABLE "public"."properties" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."milk_tests_aggregated_view" WITH ("security_invoker"='true') AS
 SELECT "mt"."product_id",
    "mt"."rating",
    "mt"."price_quality_ratio",
    "mt"."country_code",
    "mt"."drink_preference",
    "mt"."created_at",
    "b"."name" AS "brand_name",
    "n"."name" AS "product_name",
    "prod"."is_barista",
    COALESCE("array_agg"(DISTINCT "prop"."name") FILTER (WHERE ("prop"."name" IS NOT NULL)), ARRAY[]::"text"[]) AS "property_names",
    COALESCE("array_agg"(DISTINCT "fl"."name") FILTER (WHERE ("fl"."name" IS NOT NULL)), ARRAY[]::"text"[]) AS "flavor_names"
   FROM ((((((("public"."milk_tests" "mt"
     LEFT JOIN "public"."products" "prod" ON (("mt"."product_id" = "prod"."id")))
     LEFT JOIN "public"."brands" "b" ON (("prod"."brand_id" = "b"."id")))
     LEFT JOIN "public"."names" "n" ON (("prod"."name_id" = "n"."id")))
     LEFT JOIN "public"."product_properties" "pp" ON (("prod"."id" = "pp"."product_id")))
     LEFT JOIN "public"."properties" "prop" ON (("pp"."property_id" = "prop"."id")))
     LEFT JOIN "public"."product_flavors" "pf" ON (("prod"."id" = "pf"."product_id")))
     LEFT JOIN "public"."flavors" "fl" ON (("pf"."flavor_id" = "fl"."id")))
  GROUP BY "mt"."product_id", "mt"."rating", "mt"."price_quality_ratio", "mt"."country_code", "mt"."drink_preference", "mt"."created_at", "b"."name", "n"."name", "prod"."is_barista";


ALTER VIEW "public"."milk_tests_aggregated_view" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."milk_tests_private_view" WITH ("security_invoker"='on') AS
 SELECT "mt"."id",
    "mt"."user_id",
    "mt"."product_id",
    "mt"."rating",
    "mt"."notes",
    "mt"."shop_name",
    "mt"."country_code",
    "mt"."price_quality_ratio",
    "mt"."picture_path",
    "mt"."drink_preference",
    "mt"."created_at",
    "b"."id" AS "brand_id",
    "b"."name" AS "brand_name",
    "n"."name" AS "product_name",
    "public"."get_profile_username"("mt"."user_id") AS "username",
    "prod"."is_barista",
    COALESCE("array_agg"(DISTINCT "prop"."name") FILTER (WHERE ("prop"."name" IS NOT NULL)), ARRAY[]::"text"[]) AS "property_names",
    COALESCE("array_agg"(DISTINCT "fl"."name") FILTER (WHERE ("fl"."name" IS NOT NULL)), ARRAY[]::"text"[]) AS "flavor_names"
   FROM ((((((("public"."milk_tests" "mt"
     LEFT JOIN "public"."products" "prod" ON (("mt"."product_id" = "prod"."id")))
     LEFT JOIN "public"."brands" "b" ON (("prod"."brand_id" = "b"."id")))
     LEFT JOIN "public"."names" "n" ON (("prod"."name_id" = "n"."id")))
     LEFT JOIN "public"."product_properties" "pprop" ON (("prod"."id" = "pprop"."product_id")))
     LEFT JOIN "public"."properties" "prop" ON (("pprop"."property_id" = "prop"."id")))
     LEFT JOIN "public"."product_flavors" "pf" ON (("prod"."id" = "pf"."product_id")))
     LEFT JOIN "public"."flavors" "fl" ON (("pf"."flavor_id" = "fl"."id")))
  GROUP BY "mt"."id", "mt"."user_id", "mt"."product_id", "mt"."rating", "mt"."notes", "mt"."shop_name", "mt"."country_code", "mt"."price_quality_ratio", "mt"."picture_path", "mt"."drink_preference", "mt"."created_at", "b"."id", "b"."name", "n"."name", "prod"."is_barista";


ALTER VIEW "public"."milk_tests_private_view" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."milk_tests_view" WITH ("security_invoker"='on') AS
 SELECT "mt"."id",
    "mt"."product_id",
    "mt"."rating",
    "mt"."country_code",
    "mt"."price_quality_ratio",
    "mt"."drink_preference",
    "mt"."created_at",
    "b"."id" AS "brand_id",
    "b"."name" AS "brand_name",
    "n"."name" AS "product_name",
    "prod"."is_barista",
    COALESCE("array_agg"(DISTINCT "prop"."name") FILTER (WHERE ("prop"."name" IS NOT NULL)), ARRAY[]::"text"[]) AS "property_names",
    COALESCE("array_agg"(DISTINCT "fl"."name") FILTER (WHERE ("fl"."name" IS NOT NULL)), ARRAY[]::"text"[]) AS "flavor_names"
   FROM ((((((("public"."milk_tests" "mt"
     LEFT JOIN "public"."products" "prod" ON (("mt"."product_id" = "prod"."id")))
     LEFT JOIN "public"."brands" "b" ON (("prod"."brand_id" = "b"."id")))
     LEFT JOIN "public"."names" "n" ON (("prod"."name_id" = "n"."id")))
     LEFT JOIN "public"."product_properties" "pprop" ON (("prod"."id" = "pprop"."product_id")))
     LEFT JOIN "public"."properties" "prop" ON (("pprop"."property_id" = "prop"."id")))
     LEFT JOIN "public"."product_flavors" "pf" ON (("prod"."id" = "pf"."product_id")))
     LEFT JOIN "public"."flavors" "fl" ON (("pf"."flavor_id" = "fl"."id")))
  GROUP BY "mt"."id", "mt"."product_id", "mt"."rating", "mt"."country_code", "mt"."price_quality_ratio", "mt"."drink_preference", "mt"."created_at", "b"."id", "b"."name", "n"."name", "prod"."is_barista";


ALTER VIEW "public"."milk_tests_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notification_preferences" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "likes_enabled" boolean DEFAULT true NOT NULL,
    "comments_enabled" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "newsletter_enabled" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."notification_preferences" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "public"."notification_type" NOT NULL,
    "title" "text" NOT NULL,
    "message" "text" NOT NULL,
    "milk_test_id" "uuid",
    "triggered_by_user_id" "uuid",
    "is_read" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_barcodes" (
    "barcode" "text" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid"
);


ALTER TABLE "public"."product_barcodes" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."product_search_view" WITH ("security_invoker"='true') AS
 SELECT "p"."id",
    "b"."id" AS "brand_id",
    "b"."name" AS "brand_name",
    "n"."name" AS "product_name",
    "n"."id" AS "product_name_id",
    ( SELECT "array_agg"("prop"."key") AS "array_agg"
           FROM ("public"."product_properties" "pp"
             JOIN "public"."properties" "prop" ON (("pp"."property_id" = "prop"."id")))
          WHERE ("pp"."product_id" = "p"."id")) AS "property_names",
    "p"."is_barista",
    ( SELECT "array_agg"("f"."key") AS "array_agg"
           FROM ("public"."product_flavors" "pf"
             JOIN "public"."flavors" "f" ON (("pf"."flavor_id" = "f"."id")))
          WHERE ("pf"."product_id" = "p"."id")) AS "flavor_names"
   FROM (("public"."products" "p"
     LEFT JOIN "public"."brands" "b" ON (("p"."brand_id" = "b"."id")))
     LEFT JOIN "public"."names" "n" ON (("p"."name_id" = "n"."id")));


ALTER VIEW "public"."product_search_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "username" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "default_country_code" "text",
    "avatar_url" "text"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."security_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "event_type" "text" NOT NULL,
    "event_data" "jsonb",
    "ip_address" "inet",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."security_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."shops" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "name" "text" NOT NULL,
    "country_code" "text"
);


ALTER TABLE "public"."shops" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "public"."app_role" DEFAULT 'user'::"public"."app_role" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


ALTER TABLE ONLY "public"."app_versions"
    ADD CONSTRAINT "app_versions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."app_versions"
    ADD CONSTRAINT "app_versions_version_key" UNIQUE ("version");



ALTER TABLE ONLY "public"."brands"
    ADD CONSTRAINT "brands_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."brands"
    ADD CONSTRAINT "brands_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."countries"
    ADD CONSTRAINT "countries_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."countries"
    ADD CONSTRAINT "countries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."flavors"
    ADD CONSTRAINT "flavors_key_unique" UNIQUE ("key");



ALTER TABLE ONLY "public"."flavors"
    ADD CONSTRAINT "flavors_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."flavors"
    ADD CONSTRAINT "flavors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."likes"
    ADD CONSTRAINT "likes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."likes"
    ADD CONSTRAINT "likes_user_id_milk_test_id_key" UNIQUE ("user_id", "milk_test_id");



ALTER TABLE ONLY "public"."milk_tests"
    ADD CONSTRAINT "milk_tests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."names"
    ADD CONSTRAINT "names_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."names"
    ADD CONSTRAINT "names_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notification_preferences"
    ADD CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notification_preferences"
    ADD CONSTRAINT "notification_preferences_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_barcodes"
    ADD CONSTRAINT "product_barcodes_pkey" PRIMARY KEY ("barcode");



ALTER TABLE ONLY "public"."product_flavors"
    ADD CONSTRAINT "product_flavors_pkey" PRIMARY KEY ("product_id", "flavor_id");



ALTER TABLE ONLY "public"."product_properties"
    ADD CONSTRAINT "product_properties_pkey" PRIMARY KEY ("product_id", "property_id");



ALTER TABLE ONLY "public"."properties"
    ADD CONSTRAINT "product_types_key_key" UNIQUE ("key");



ALTER TABLE ONLY "public"."properties"
    ADD CONSTRAINT "product_types_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."properties"
    ADD CONSTRAINT "product_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_unique" UNIQUE ("username");



ALTER TABLE ONLY "public"."security_log"
    ADD CONSTRAINT "security_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."shops"
    ADD CONSTRAINT "shops_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."countries"
    ADD CONSTRAINT "unique_country_code" UNIQUE ("code");



ALTER TABLE ONLY "public"."countries"
    ADD CONSTRAINT "unique_country_name" UNIQUE ("name");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_role_key" UNIQUE ("user_id", "role");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "username_unique" UNIQUE ("username");



CREATE INDEX "idx_comments_milk_test_id" ON "public"."comments" USING "btree" ("milk_test_id");



CREATE INDEX "idx_comments_user_id" ON "public"."comments" USING "btree" ("user_id");



CREATE INDEX "idx_likes_milk_test_id" ON "public"."likes" USING "btree" ("milk_test_id");



CREATE INDEX "idx_likes_user_id" ON "public"."likes" USING "btree" ("user_id");



CREATE INDEX "idx_milk_tests_country_code" ON "public"."milk_tests" USING "btree" ("country_code");



CREATE INDEX "idx_milk_tests_shop_name" ON "public"."milk_tests" USING "btree" ("shop_name");



CREATE INDEX "idx_profiles_default_country" ON "public"."profiles" USING "btree" ("default_country_code");



CREATE INDEX "idx_shops_name" ON "public"."shops" USING "btree" ("name");



CREATE INDEX "product_barcodes_product_id_idx" ON "public"."product_barcodes" USING "btree" ("product_id");



CREATE OR REPLACE TRIGGER "profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_create_comment_notification" AFTER INSERT ON "public"."comments" FOR EACH ROW EXECUTE FUNCTION "public"."create_comment_notification"();



CREATE OR REPLACE TRIGGER "trigger_create_default_notification_preferences" AFTER INSERT ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."create_default_notification_preferences"();



CREATE OR REPLACE TRIGGER "trigger_create_like_notification" AFTER INSERT ON "public"."likes" FOR EACH ROW EXECUTE FUNCTION "public"."create_like_notification"();



CREATE OR REPLACE TRIGGER "update_comments_updated_at" BEFORE UPDATE ON "public"."comments" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "update_notification_preferences_updated_at" BEFORE UPDATE ON "public"."notification_preferences" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "update_notifications_updated_at" BEFORE UPDATE ON "public"."notifications" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "validate_comment_before_write" BEFORE INSERT OR UPDATE ON "public"."comments" FOR EACH ROW EXECUTE FUNCTION "public"."validate_comment_content"();



ALTER TABLE ONLY "public"."milk_tests"
    ADD CONSTRAINT "fk_milk_tests_profiles" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."milk_tests"
    ADD CONSTRAINT "milk_tests_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");



ALTER TABLE ONLY "public"."milk_tests"
    ADD CONSTRAINT "milk_tests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."product_barcodes"
    ADD CONSTRAINT "product_barcodes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."product_barcodes"
    ADD CONSTRAINT "product_barcodes_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_flavors"
    ADD CONSTRAINT "product_flavors_flavor_id_fkey" FOREIGN KEY ("flavor_id") REFERENCES "public"."flavors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_flavors"
    ADD CONSTRAINT "product_flavors_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_properties"
    ADD CONSTRAINT "product_properties_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_properties"
    ADD CONSTRAINT "product_properties_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_name_id_fkey" FOREIGN KEY ("name_id") REFERENCES "public"."names"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_default_country_code_fkey" FOREIGN KEY ("default_country_code") REFERENCES "public"."countries"("code");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."shops"
    ADD CONSTRAINT "shops_country_code_fkey" FOREIGN KEY ("country_code") REFERENCES "public"."countries"("code");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can delete app versions" ON "public"."app_versions" FOR DELETE USING ("public"."is_admin"());



CREATE POLICY "Admins can delete brands" ON "public"."brands" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admins can delete countries" ON "public"."countries" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admins can delete flavors" ON "public"."flavors" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admins can delete names" ON "public"."names" FOR DELETE USING ("public"."is_admin"());



CREATE POLICY "Admins can delete product_flavors" ON "public"."product_flavors" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admins can delete product_properties" ON "public"."product_properties" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admins can delete products" ON "public"."products" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admins can delete properties" ON "public"."properties" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admins can delete shops" ON "public"."shops" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admins can insert app versions" ON "public"."app_versions" FOR INSERT WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can insert countries" ON "public"."countries" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can insert flavors" ON "public"."flavors" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can insert properties" ON "public"."properties" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can insert shops" ON "public"."shops" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage roles" ON "public"."user_roles" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can update app versions" ON "public"."app_versions" FOR UPDATE USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can update brands" ON "public"."brands" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can update countries" ON "public"."countries" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can update flavors" ON "public"."flavors" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can update names" ON "public"."names" FOR UPDATE USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can update product_flavors" ON "public"."product_flavors" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can update product_properties" ON "public"."product_properties" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can update products" ON "public"."products" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can update properties" ON "public"."properties" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can update shops" ON "public"."shops" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can view all roles" ON "public"."user_roles" FOR SELECT USING ("public"."is_admin"());



CREATE POLICY "Admins can view security logs" ON "public"."security_log" FOR SELECT USING ("public"."is_admin"());



CREATE POLICY "Allow authenticated users to insert names" ON "public"."names" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Allow authenticated users to read names" ON "public"."names" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow read access to brands" ON "public"."brands" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow read access to countries" ON "public"."countries" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow select on product_flavors" ON "public"."product_flavors" FOR SELECT TO "anon", "authenticated" USING (true);



CREATE POLICY "Allow select on product_properties" ON "public"."product_properties" FOR SELECT TO "anon", "authenticated" USING (true);



CREATE POLICY "Anonymous users can count brands for public stats" ON "public"."brands" FOR SELECT TO "anon" USING (true);



CREATE POLICY "Anyone can view app versions" ON "public"."app_versions" FOR SELECT USING (true);



CREATE POLICY "Authenticated users can add brands" ON "public"."brands" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can add flavors" ON "public"."flavors" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can add product flavors" ON "public"."product_flavors" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can add product properties" ON "public"."product_properties" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can add shops" ON "public"."shops" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can insert their own comments" ON "public"."comments" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Authenticated users can insert their own likes" ON "public"."likes" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Authenticated users can insert their own milk tests" ON "public"."milk_tests" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Authenticated users can register products" ON "public"."products" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can view all milk tests" ON "public"."milk_tests" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can view comments" ON "public"."comments" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can view likes" ON "public"."likes" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."brands" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."flavors" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."names" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."product_flavors" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."product_properties" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."products" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."properties" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."shops" FOR SELECT USING (true);



CREATE POLICY "No deletes on security_log" ON "public"."security_log" FOR DELETE TO "authenticated" USING (false);



CREATE POLICY "No direct inserts to security_log" ON "public"."security_log" FOR INSERT TO "authenticated" WITH CHECK (false);



CREATE POLICY "No updates on security_log" ON "public"."security_log" FOR UPDATE TO "authenticated" USING (false);



CREATE POLICY "Only service role can insert notifications" ON "public"."notifications" FOR INSERT TO "service_role" WITH CHECK (true);



CREATE POLICY "Users can delete their own comments" ON "public"."comments" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own likes" ON "public"."likes" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own milk tests" ON "public"."milk_tests" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own notification preferences" ON "public"."notification_preferences" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own profile" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own comments" ON "public"."comments" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own milk tests" ON "public"."milk_tests" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own notification preferences" ON "public"."notification_preferences" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own notifications" ON "public"."notifications" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view own profile" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view their own notification preferences" ON "public"."notification_preferences" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own notifications" ON "public"."notifications" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own roles" ON "public"."user_roles" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."app_versions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."brands" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."countries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."flavors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."likes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."milk_tests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."names" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notification_preferences" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_barcodes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_flavors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_properties" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."properties" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."security_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."shops" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."check_username_exists"("username_to_check" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."check_username_exists"("username_to_check" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_username_exists"("username_to_check" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_comment_notification"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_comment_notification"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_comment_notification"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_default_notification_preferences"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_default_notification_preferences"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_default_notification_preferences"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_like_notification"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_like_notification"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_like_notification"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_aggregated_milk_tests"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_aggregated_milk_tests"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_aggregated_milk_tests"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_all_milk_tests"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_all_milk_tests"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_all_milk_tests"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_all_milk_tests"("page_limit" integer, "page_offset" integer, "filter_product_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_all_milk_tests"("page_limit" integer, "page_offset" integer, "filter_product_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_all_milk_tests"("page_limit" integer, "page_offset" integer, "filter_product_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_product_by_barcode"("_barcode" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_product_by_barcode"("_barcode" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_product_by_barcode"("_barcode" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_product_by_barcode"("_barcode" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_profile_username"("_user_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_profile_username"("_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_profile_username"("_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_profile_username"("_user_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_public_profile"("_user_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_public_profile"("_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_public_profile"("_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_public_profile"("_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_public_stats"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_public_stats"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_public_stats"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") TO "anon";
GRANT ALL ON FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."log_security_event"("event_type_val" "text", "event_data_val" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."log_security_event"("event_type_val" "text", "event_data_val" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_security_event"("event_type_val" "text", "event_data_val" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_comment_with_details"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_comment_with_details"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_comment_with_details"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_like_with_details"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_like_with_details"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_like_with_details"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."remember_product_barcode"("_barcode" "text", "_product_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."remember_product_barcode"("_barcode" "text", "_product_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."remember_product_barcode"("_barcode" "text", "_product_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."remember_product_barcode"("_barcode" "text", "_product_id" "uuid") TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."products" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."products" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."products" TO "service_role";



GRANT ALL ON FUNCTION "public"."search_product_types"() TO "anon";
GRANT ALL ON FUNCTION "public"."search_product_types"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_product_types"() TO "service_role";



GRANT ALL ON FUNCTION "public"."search_product_types"("search_term" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."search_product_types"("search_term" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_product_types"("search_term" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_comment_content"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_comment_content"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_comment_content"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_milk_test_input"("rating_val" numeric, "notes_val" "text", "shop_name_val" "text", "country_code_val" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."validate_milk_test_input"("rating_val" numeric, "notes_val" "text", "shop_name_val" "text", "country_code_val" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_milk_test_input"("rating_val" numeric, "notes_val" "text", "shop_name_val" "text", "country_code_val" "text") TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."app_versions" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."app_versions" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."app_versions" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."brands" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."brands" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."brands" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."comments" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."comments" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."comments" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."countries" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."countries" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."countries" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."flavors" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."flavors" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."flavors" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."likes" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."likes" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."likes" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."milk_tests" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."milk_tests" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."milk_tests" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."names" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."names" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."names" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."product_flavors" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."product_flavors" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."product_flavors" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."product_properties" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."product_properties" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."product_properties" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."properties" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."properties" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."properties" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."milk_tests_aggregated_view" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."milk_tests_aggregated_view" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."milk_tests_aggregated_view" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."milk_tests_private_view" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."milk_tests_private_view" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."milk_tests_view" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."milk_tests_view" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."milk_tests_view" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."notification_preferences" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."notification_preferences" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."notification_preferences" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."notifications" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."notifications" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."notifications" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."product_barcodes" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."product_search_view" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."product_search_view" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."product_search_view" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."profiles" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."profiles" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."profiles" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."security_log" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."security_log" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."security_log" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."shops" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."shops" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."shops" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."user_roles" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."user_roles" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."user_roles" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO "service_role";







