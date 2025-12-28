export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      brands: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          milk_test_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          milk_test_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          milk_test_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      countries: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      flavors: {
        Row: {
          created_at: string
          id: string
          key: string
          name: string
          ordering: number
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          name: string
          ordering?: number
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          name?: string
          ordering?: number
        }
        Relationships: []
      }
      likes: {
        Row: {
          created_at: string
          id: string
          milk_test_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          milk_test_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          milk_test_id?: string
          user_id?: string
        }
        Relationships: []
      }
      milk_tests: {
        Row: {
          country_code: string | null
          created_at: string
          drink_preference: string | null
          id: string
          is_hidden_from_feed: boolean
          notes: string | null
          picture_path: string | null
          price_quality_ratio: string | null
          product_id: string | null
          rating: number
          shop_name: string | null
          user_id: string
        }
        Insert: {
          country_code?: string | null
          created_at?: string
          drink_preference?: string | null
          id?: string
          is_hidden_from_feed?: boolean
          notes?: string | null
          picture_path?: string | null
          price_quality_ratio?: string | null
          product_id?: string | null
          rating: number
          shop_name?: string | null
          user_id: string
        }
        Update: {
          country_code?: string | null
          created_at?: string
          drink_preference?: string | null
          id?: string
          is_hidden_from_feed?: boolean
          notes?: string | null
          picture_path?: string | null
          price_quality_ratio?: string | null
          product_id?: string | null
          rating?: number
          shop_name?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_milk_tests_profiles"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milk_tests_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milk_tests_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      names: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          comments_enabled: boolean
          created_at: string
          id: string
          likes_enabled: boolean
          newsletter_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          comments_enabled?: boolean
          created_at?: string
          id?: string
          likes_enabled?: boolean
          newsletter_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          comments_enabled?: boolean
          created_at?: string
          id?: string
          likes_enabled?: boolean
          newsletter_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          milk_test_id: string | null
          title: string
          triggered_by_user_id: string | null
          type: Database["public"]["Enums"]["notification_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          milk_test_id?: string | null
          title: string
          triggered_by_user_id?: string | null
          type: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          milk_test_id?: string | null
          title?: string
          triggered_by_user_id?: string | null
          type?: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      product_flavors: {
        Row: {
          created_at: string
          flavor_id: string
          product_id: string
        }
        Insert: {
          created_at?: string
          flavor_id: string
          product_id: string
        }
        Update: {
          created_at?: string
          flavor_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_flavors_flavor_id_fkey"
            columns: ["flavor_id"]
            isOneToOne: false
            referencedRelation: "flavors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_flavors_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_flavors_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_properties: {
        Row: {
          created_at: string
          product_id: string
          property_id: string
        }
        Insert: {
          created_at?: string
          product_id: string
          property_id: string
        }
        Update: {
          created_at?: string
          product_id?: string
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_properties_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_properties_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_properties_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand_id: string
          created_at: string
          id: string
          is_barista: boolean
          name_id: string | null
        }
        Insert: {
          brand_id: string
          created_at?: string
          id?: string
          is_barista?: boolean
          name_id?: string | null
        }
        Update: {
          brand_id?: string
          created_at?: string
          id?: string
          is_barista?: boolean
          name_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "milk_tests_view"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "product_search_view"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "products_name_id_fkey"
            columns: ["name_id"]
            isOneToOne: false
            referencedRelation: "names"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_name_id_fkey"
            columns: ["name_id"]
            isOneToOne: false
            referencedRelation: "product_search_view"
            referencedColumns: ["product_name_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          default_country_code: string | null
          id: string
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          default_country_code?: string | null
          id: string
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          default_country_code?: string | null
          id?: string
          updated_at?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_default_country_code_fkey"
            columns: ["default_country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
        ]
      }
      properties: {
        Row: {
          created_at: string
          id: string
          key: string
          name: string
          ordering: number
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          name: string
          ordering: number
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          name?: string
          ordering?: number
        }
        Relationships: []
      }
      security_log: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      shops: {
        Row: {
          country_code: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          country_code?: string | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          country_code?: string | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "shops_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      milk_tests_aggregated_view: {
        Row: {
          brand_name: string | null
          country_code: string | null
          created_at: string | null
          drink_preference: string | null
          flavor_names: string[] | null
          is_barista: boolean | null
          price_quality_ratio: string | null
          product_id: string | null
          product_name: string | null
          property_names: string[] | null
          rating: number | null
        }
        Relationships: [
          {
            foreignKeyName: "milk_tests_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milk_tests_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      milk_tests_view: {
        Row: {
          brand_id: string | null
          brand_name: string | null
          country_code: string | null
          created_at: string | null
          drink_preference: string | null
          flavor_names: string[] | null
          id: string | null
          is_barista: boolean | null
          notes: string | null
          picture_path: string | null
          price_quality_ratio: string | null
          product_id: string | null
          product_name: string | null
          property_names: string[] | null
          rating: number | null
          shop_name: string | null
          user_id: string | null
          username: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_milk_tests_profiles"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milk_tests_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milk_tests_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_search_view: {
        Row: {
          brand_id: string | null
          brand_name: string | null
          flavor_names: string[] | null
          id: string | null
          is_barista: boolean | null
          product_name: string | null
          product_name_id: string | null
          property_names: string[] | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_username_exists: {
        Args: { username_to_check: string }
        Returns: boolean
      }
      get_aggregated_milk_tests: {
        Args: never
        Returns: {
          brand_name: string
          country_code: string
          created_at: string
          drink_preference: string
          flavor_names: string[]
          is_barista: boolean
          price_quality_ratio: string
          product_id: string
          product_name: string
          property_names: string[]
          rating: number
        }[]
      }
      get_all_milk_tests: {
        Args: never
        Returns: {
          brand_id: string
          brand_name: string
          country_code: string
          created_at: string
          drink_preference: string
          flavor_names: string[]
          id: string
          is_barista: boolean
          notes: string
          picture_path: string
          price_quality_ratio: string
          product_id: string
          product_name: string
          property_names: string[]
          rating: number
          shop_name: string
          user_id: string
          username: string
        }[]
      }
      get_public_stats: {
        Args: never
        Returns: {
          total_brands: number
          total_members: number
          total_products: number
          total_tests: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      log_security_event: {
        Args: { event_data_val?: Json; event_type_val: string }
        Returns: undefined
      }
      search_product_types:
        | {
            Args: never
            Returns: {
              brand_id: string
              created_at: string
              id: string
              is_barista: boolean
              name_id: string | null
            }[]
            SetofOptions: {
              from: "*"
              to: "products"
              isOneToOne: false
              isSetofReturn: true
            }
          }
        | {
            Args: { search_term: string }
            Returns: {
              brand_id: string
              brand_name: string
              flavor_names: string[]
              id: string
              is_barista: boolean
              product_name: string
              product_name_id: string
              property_names: string[]
            }[]
          }
      validate_milk_test_input: {
        Args: {
          country_code_val: string
          notes_val: string
          rating_val: number
          shop_name_val: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      notification_type: "like" | "comment"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      notification_type: ["like", "comment"],
    },
  },
} as const
