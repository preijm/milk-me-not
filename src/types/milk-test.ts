
export interface MilkTestResult {
  id: string;
  created_at: string;
  rating: number;
  notes?: string | null;
  picture_path?: string | null;
  drink_preference?: string | null;
  price_quality_ratio?: string | null;
  product_id?: string | null;
  shop_id?: string | null;
  user_id?: string | null;
  brand_id?: string | null;
  brand_name?: string | null;
  /** Flat brand name. Some views expose this instead of `brand_name`. */
  brand?: string;
  product_name?: string | null;
  is_barista?: boolean | null;
  shop_name?: string | null;
  /** Flat shop name. Some views expose this instead of `shop_name`. */
  shop?: string;
  shop_country_code?: string | null;
  country_code?: string | null;  // Added missing field
  username?: string | null;
  property_names?: string[] | null;
  flavor_names?: string[] | null;
  /** Unused since the edit dialog was removed; nothing reads this. */
  product_type_keys?: string[];
  price?: number | null;  // Adding the missing price property
  currency_code?: string | null;  // Adding the missing currency_code property
}
