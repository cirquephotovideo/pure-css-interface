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
      ai_providers: {
        Row: {
          base_url: string | null
          created_at: string | null
          id: string
          is_default: boolean | null
          model: string | null
          name: string
          provider_type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          base_url?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          model?: string | null
          name: string
          provider_type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          base_url?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          model?: string | null
          name?: string
          provider_type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      api_logs: {
        Row: {
          created_at: string
          details: Json | null
          id: string
          message: string | null
          status: string
          type: string
        }
        Insert: {
          created_at?: string
          details?: Json | null
          id?: string
          message?: string | null
          status: string
          type: string
        }
        Update: {
          created_at?: string
          details?: Json | null
          id?: string
          message?: string | null
          status?: string
          type?: string
        }
        Relationships: []
      }
      api_settings: {
        Row: {
          access_token: string | null
          auto_refresh: boolean | null
          client_id: string
          client_secret: string
          created_at: string | null
          id: string
          marketplace_id: string | null
          refresh_token: string
          token_expires_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          access_token?: string | null
          auto_refresh?: boolean | null
          client_id: string
          client_secret: string
          created_at?: string | null
          id?: string
          marketplace_id?: string | null
          refresh_token: string
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          access_token?: string | null
          auto_refresh?: boolean | null
          client_id?: string
          client_secret?: string
          created_at?: string | null
          id?: string
          marketplace_id?: string | null
          refresh_token?: string
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      bulk_description_jobs: {
        Row: {
          completed_products: number | null
          created_at: string | null
          failed_products: number | null
          id: string
          provider_id: string | null
          status: string
          template_id: string | null
          total_products: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed_products?: number | null
          created_at?: string | null
          failed_products?: number | null
          id?: string
          provider_id?: string | null
          status?: string
          template_id?: string | null
          total_products: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed_products?: number | null
          created_at?: string | null
          failed_products?: number | null
          id?: string
          provider_id?: string | null
          status?: string
          template_id?: string | null
          total_products?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bulk_description_jobs_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "ai_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bulk_description_jobs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "prompt_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      import_field_mappings: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          source: string
          source_field: string
          target_field: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          source: string
          source_field: string
          target_field: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          source?: string
          source_field?: string
          target_field?: string
          updated_at?: string
        }
        Relationships: []
      }
      import_history: {
        Row: {
          completed_at: string | null
          created_at: string
          error_count: number | null
          error_message: string | null
          errors: Json | null
          file_name: string
          file_size: number | null
          file_type: string
          id: string
          processed_rows: number | null
          progress: number | null
          record_count: number | null
          source_id: string | null
          started_at: string | null
          status: string
          success_count: number | null
          template_id: string | null
          template_name: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_count?: number | null
          error_message?: string | null
          errors?: Json | null
          file_name: string
          file_size?: number | null
          file_type: string
          id?: string
          processed_rows?: number | null
          progress?: number | null
          record_count?: number | null
          source_id?: string | null
          started_at?: string | null
          status?: string
          success_count?: number | null
          template_id?: string | null
          template_name?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_count?: number | null
          error_message?: string | null
          errors?: Json | null
          file_name?: string
          file_size?: number | null
          file_type?: string
          id?: string
          processed_rows?: number | null
          progress?: number | null
          record_count?: number | null
          source_id?: string | null
          started_at?: string | null
          status?: string
          success_count?: number | null
          template_id?: string | null
          template_name?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "import_history_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "import_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "import_history_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "mapping_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      import_logs: {
        Row: {
          created_at: string
          ean: string
          id: string
          message: string | null
          source: string
          status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          ean: string
          id?: string
          message?: string | null
          source: string
          status: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          ean?: string
          id?: string
          message?: string | null
          source?: string
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      import_schedules: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          interval: string
          last_run: string | null
          next_run: string | null
          source: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          interval: string
          last_run?: string | null
          next_run?: string | null
          source: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          interval?: string
          last_run?: string | null
          next_run?: string | null
          source?: string
          updated_at?: string
        }
        Relationships: []
      }
      import_sources: {
        Row: {
          active: boolean | null
          base_directory: string | null
          created_at: string
          directory: string | null
          host: string
          id: string
          name: string
          passphrase: string | null
          password: string | null
          port: number
          private_key: string | null
          type: string
          updated_at: string
          username: string
        }
        Insert: {
          active?: boolean | null
          base_directory?: string | null
          created_at?: string
          directory?: string | null
          host: string
          id?: string
          name: string
          passphrase?: string | null
          password?: string | null
          port: number
          private_key?: string | null
          type: string
          updated_at?: string
          username: string
        }
        Update: {
          active?: boolean | null
          base_directory?: string | null
          created_at?: string
          directory?: string | null
          host?: string
          id?: string
          name?: string
          passphrase?: string | null
          password?: string | null
          port?: number
          private_key?: string | null
          type?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      mapping_templates: {
        Row: {
          created_at: string
          description: string | null
          file_type: string
          id: string
          mappings: Json
          name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_type: string
          id?: string
          mappings?: Json
          name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          file_type?: string
          id?: string
          mappings?: Json
          name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      prestashop_settings: {
        Row: {
          api_key: string
          created_at: string
          id: string
          shop_url: string
          updated_at: string
        }
        Insert: {
          api_key: string
          created_at?: string
          id?: string
          shop_url: string
          updated_at?: string
        }
        Update: {
          api_key?: string
          created_at?: string
          id?: string
          shop_url?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_embeddings: {
        Row: {
          chunk_index: number
          chunk_text: string
          created_at: string | null
          embedding: string | null
          id: string
          product_id: string
          updated_at: string | null
        }
        Insert: {
          chunk_index: number
          chunk_text: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          product_id: string
          updated_at?: string | null
        }
        Update: {
          chunk_index?: number
          chunk_text?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          product_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_embeddings_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          asin: string | null
          attributes: Json | null
          brand: string | null
          created_at: string
          ean: string
          id: string
          images: Json | null
          import_source: string | null
          last_fetched_at: string
          long_description: string | null
          marketplace_id: string | null
          model: string | null
          product_types: Json | null
          seo_description: string | null
          short_description: string | null
          summary: Json | null
          technical_description: string | null
          template_name: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          asin?: string | null
          attributes?: Json | null
          brand?: string | null
          created_at?: string
          ean: string
          id?: string
          images?: Json | null
          import_source?: string | null
          last_fetched_at?: string
          long_description?: string | null
          marketplace_id?: string | null
          model?: string | null
          product_types?: Json | null
          seo_description?: string | null
          short_description?: string | null
          summary?: Json | null
          technical_description?: string | null
          template_name?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          asin?: string | null
          attributes?: Json | null
          brand?: string | null
          created_at?: string
          ean?: string
          id?: string
          images?: Json | null
          import_source?: string | null
          last_fetched_at?: string
          long_description?: string | null
          marketplace_id?: string | null
          model?: string | null
          product_types?: Json | null
          seo_description?: string | null
          short_description?: string | null
          summary?: Json | null
          technical_description?: string | null
          template_name?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      prompt_templates: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          language: string
          name: string
          prompt_text: string
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          language?: string
          name: string
          prompt_text: string
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          language?: string
          name?: string
          prompt_text?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize:
        | {
            Args: {
              "": string
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      gtrgm_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_options: {
        Args: {
          "": unknown
        }
        Returns: undefined
      }
      gtrgm_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      halfvec_avg: {
        Args: {
          "": number[]
        }
        Returns: unknown
      }
      halfvec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      halfvec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      hnsw_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnswhandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflathandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      l2_norm:
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      l2_normalize:
        | {
            Args: {
              "": string
            }
            Returns: string
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      match_product_embeddings: {
        Args: {
          query_embedding: string
          similarity_threshold?: number
          match_count?: number
        }
        Returns: {
          id: string
          product_id: string
          chunk_index: number
          chunk_text: string
          similarity: number
        }[]
      }
      set_limit: {
        Args: {
          "": number
        }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: {
          "": string
        }
        Returns: string[]
      }
      sparsevec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      sparsevec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      vector_avg: {
        Args: {
          "": number[]
        }
        Returns: string
      }
      vector_dims:
        | {
            Args: {
              "": string
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      vector_norm: {
        Args: {
          "": string
        }
        Returns: number
      }
      vector_out: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      vector_send: {
        Args: {
          "": string
        }
        Returns: string
      }
      vector_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
