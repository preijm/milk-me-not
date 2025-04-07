export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      milk_tests: {
        Row: {
          created_at: string
          drink_preference: string | null
          id: string
          notes: string | null
          picture_path: string | null
          price_quality_ratio: string | null
          product_id: string | null
          rating: number
          shop_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          drink_preference?: string | null
          id?: string
          notes?: string | null
          picture_path?: string | null
          price_quality_ratio?: string | null
          product_id?: string | null
          rating: number
          shop_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          drink_preference?: string | null
          id?: string
          notes?: string | null
          picture_path?: string | null
          price_quality_ratio?: string | null
          product_id?: string | null
          rating?: number
          shop_id?: string | null
          user_id?: string | null
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
          {
            foreignKeyName: "milk_tests_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
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
          display_name: string | null
          id: string
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
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
    }
    Views: {
      milk_tests_view: {
        Row: {
          brand_id: string | null
          brand_name: string | null
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
          shop_country_code: string | null
          shop_id: string | null
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
          {
            foreignKeyName: "milk_tests_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shops_country_code_fkey"
            columns: ["shop_country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
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
      search_product_types: {
        Args: { search_term: string }
        Returns: {
          id: string
          brand_id: string
          brand_name: string
          product_name: string
          ingredients: string[]
          product_types: string[]
          flavor_names: string[]
          product_name_id: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
