export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          description: string | null
          is_public: boolean | null
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          description?: string | null
          is_public?: boolean | null
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          description?: string | null
          is_public?: boolean | null
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      daily_progress: {
        Row: {
          completion_rate: number | null
          courage_score: number | null
          created_at: string
          date: string
          evening_reflection_complete: boolean | null
          habits_completed: number | null
          id: string
          justice_score: number | null
          morning_intention: string | null
          morning_reflection_complete: boolean | null
          return_score: number | null
          streak_days: number | null
          temperance_score: number | null
          updated_at: string
          user_id: string
          wisdom_score: number | null
        }
        Insert: {
          completion_rate?: number | null
          courage_score?: number | null
          created_at?: string
          date: string
          evening_reflection_complete?: boolean | null
          habits_completed?: number | null
          id?: string
          justice_score?: number | null
          morning_intention?: string | null
          morning_reflection_complete?: boolean | null
          return_score?: number | null
          streak_days?: number | null
          temperance_score?: number | null
          updated_at?: string
          user_id: string
          wisdom_score?: number | null
        }
        Update: {
          completion_rate?: number | null
          courage_score?: number | null
          created_at?: string
          date?: string
          evening_reflection_complete?: boolean | null
          habits_completed?: number | null
          id?: string
          justice_score?: number | null
          morning_intention?: string | null
          morning_reflection_complete?: boolean | null
          return_score?: number | null
          streak_days?: number | null
          temperance_score?: number | null
          updated_at?: string
          user_id?: string
          wisdom_score?: number | null
        }
        Relationships: []
      }
      entitlements: {
        Row: {
          created_at: string
          entitlement_type: string
          expires_at: string | null
          granted_at: string
          id: string
          is_active: boolean | null
          metadata: Json | null
          product_id: string
          purchase_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entitlement_type: string
          expires_at?: string | null
          granted_at?: string
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          product_id: string
          purchase_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entitlement_type?: string
          expires_at?: string | null
          granted_at?: string
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          product_id?: string
          purchase_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "entitlements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entitlements_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          priority: string | null
          status: string | null
          title: string | null
          type: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          priority?: string | null
          status?: string | null
          title?: string | null
          type?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          priority?: string | null
          status?: string | null
          title?: string | null
          type?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      habit_logs: {
        Row: {
          created_at: string
          date: string
          difficulty_felt: string | null
          habit_id: string
          id: string
          mood_after: string | null
          mood_before: string | null
          notes: string | null
          target_value: number | null
          updated_at: string
          user_id: string
          value: number | null
        }
        Insert: {
          created_at?: string
          date: string
          difficulty_felt?: string | null
          habit_id: string
          id?: string
          mood_after?: string | null
          mood_before?: string | null
          notes?: string | null
          target_value?: number | null
          updated_at?: string
          user_id: string
          value?: number | null
        }
        Update: {
          created_at?: string
          date?: string
          difficulty_felt?: string | null
          habit_id?: string
          id?: string
          mood_after?: string | null
          mood_before?: string | null
          notes?: string | null
          target_value?: number | null
          updated_at?: string
          user_id?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "habit_logs_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          active_days: number[] | null
          created_at: string
          description: string | null
          difficulty_level: string | null
          frequency: string | null
          id: string
          is_active: boolean | null
          is_archived: boolean | null
          metadata: Json | null
          name: string
          reminder_time: string | null
          sort_order: number | null
          target_value: number | null
          tracking_type: string | null
          updated_at: string
          user_id: string
          virtue: string
        }
        Insert: {
          active_days?: number[] | null
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          is_archived?: boolean | null
          metadata?: Json | null
          name: string
          reminder_time?: string | null
          sort_order?: number | null
          target_value?: number | null
          tracking_type?: string | null
          updated_at?: string
          user_id: string
          virtue: string
        }
        Update: {
          active_days?: number[] | null
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          is_archived?: boolean | null
          metadata?: Json | null
          name?: string
          reminder_time?: string | null
          sort_order?: number | null
          target_value?: number | null
          tracking_type?: string | null
          updated_at?: string
          user_id?: string
          virtue?: string
        }
        Relationships: []
      }
      marcus_conversations: {
        Row: {
          active_persona: string | null
          context_type: string | null
          created_at: string
          id: string
          is_active: boolean | null
          title: string | null
          updated_at: string
          user_id: string
          virtue_focus: string | null
        }
        Insert: {
          active_persona?: string | null
          context_type?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          title?: string | null
          updated_at?: string
          user_id: string
          virtue_focus?: string | null
        }
        Update: {
          active_persona?: string | null
          context_type?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          title?: string | null
          updated_at?: string
          user_id?: string
          virtue_focus?: string | null
        }
        Relationships: []
      }
      marcus_messages: {
        Row: {
          ai_reasoning: Json | null
          citations: Json | null
          content: string
          conversation_id: string
          created_at: string
          id: string
          message_order: number | null
          persona_id: string | null
          role: string
          user_context: Json | null
          user_id: string
        }
        Insert: {
          ai_reasoning?: Json | null
          citations?: Json | null
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          message_order?: number | null
          persona_id?: string | null
          role: string
          user_context?: Json | null
          user_id: string
        }
        Update: {
          ai_reasoning?: Json | null
          citations?: Json | null
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          message_order?: number | null
          persona_id?: string | null
          role?: string
          user_context?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marcus_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "marcus_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      philosophy_chunks: {
        Row: {
          author: string | null
          content: string
          created_at: string
          embedding: string | null
          id: string
          metadata: Json | null
          persona_tags: string[] | null
          section: string | null
          tradition: string | null
          virtue: string | null
          work: string
        }
        Insert: {
          author?: string | null
          content: string
          created_at?: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
          persona_tags?: string[] | null
          section?: string | null
          tradition?: string | null
          virtue?: string | null
          work: string
        }
        Update: {
          author?: string | null
          content?: string
          created_at?: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
          persona_tags?: string[] | null
          section?: string | null
          tradition?: string | null
          virtue?: string | null
          work?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string
          currency: string | null
          description: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          name: string
          persona_id: string | null
          price_cents: number
          product_type: string
          sort_order: number | null
          stripe_price_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string | null
          description?: string | null
          id: string
          is_active?: boolean | null
          metadata?: Json | null
          name: string
          persona_id?: string | null
          price_cents: number
          product_type: string
          sort_order?: number | null
          stripe_price_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name?: string
          persona_id?: string | null
          price_cents?: number
          product_type?: string
          sort_order?: number | null
          stripe_price_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          blended_coach_chats: boolean | null
          created_at: string
          daily_practice_time: string | null
          experience_level: string | null
          is_admin: boolean | null
          last_active_at: string | null
          notifications_enabled: boolean | null
          onboarding_complete: boolean | null
          preferred_persona: string | null
          preferred_virtue: string | null
          privacy_level: string | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          blended_coach_chats?: boolean | null
          created_at?: string
          daily_practice_time?: string | null
          experience_level?: string | null
          is_admin?: boolean | null
          last_active_at?: string | null
          notifications_enabled?: boolean | null
          onboarding_complete?: boolean | null
          preferred_persona?: string | null
          preferred_virtue?: string | null
          privacy_level?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          blended_coach_chats?: boolean | null
          created_at?: string
          daily_practice_time?: string | null
          experience_level?: string | null
          is_admin?: boolean | null
          last_active_at?: string | null
          notifications_enabled?: boolean | null
          onboarding_complete?: boolean | null
          preferred_persona?: string | null
          preferred_virtue?: string | null
          privacy_level?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      progress_summaries: {
        Row: {
          avg_return_score: number | null
          created_at: string
          habits_completed: number | null
          id: string
          most_consistent_virtue: string | null
          period_end: string
          period_start: string
          period_type: string
          streak_days: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avg_return_score?: number | null
          created_at?: string
          habits_completed?: number | null
          id?: string
          most_consistent_virtue?: string | null
          period_end: string
          period_start: string
          period_type: string
          streak_days?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avg_return_score?: number | null
          created_at?: string
          habits_completed?: number | null
          id?: string
          most_consistent_virtue?: string | null
          period_end?: string
          period_start?: string
          period_type?: string
          streak_days?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      purchases: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string | null
          id: string
          metadata: Json | null
          product_id: string
          purchase_date: string
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string | null
          id?: string
          metadata?: Json | null
          product_id: string
          purchase_date?: string
          status: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string | null
          id?: string
          metadata?: Json | null
          product_id?: string
          purchase_date?: string
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      reflections: {
        Row: {
          challenge: string | null
          challenges_faced: string[] | null
          created_at: string
          date: string
          gratitude: string | null
          id: string
          intention: string | null
          journal_entry: string | null
          key_insights: string[] | null
          lesson: string | null
          mood: number | null
          type: string
          updated_at: string
          user_id: string
          virtue_focus: string | null
          wins_celebrated: string[] | null
        }
        Insert: {
          challenge?: string | null
          challenges_faced?: string[] | null
          created_at?: string
          date: string
          gratitude?: string | null
          id?: string
          intention?: string | null
          journal_entry?: string | null
          key_insights?: string[] | null
          lesson?: string | null
          mood?: number | null
          type: string
          updated_at?: string
          user_id: string
          virtue_focus?: string | null
          wins_celebrated?: string[] | null
        }
        Update: {
          challenge?: string | null
          challenges_faced?: string[] | null
          created_at?: string
          date?: string
          gratitude?: string | null
          id?: string
          intention?: string | null
          journal_entry?: string | null
          key_insights?: string[] | null
          lesson?: string | null
          mood?: number | null
          type?: string
          updated_at?: string
          user_id?: string
          virtue_focus?: string | null
          wins_celebrated?: string[] | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      calculate_daily_progress: {
        Args: { target_date: string; target_user: string }
        Returns: undefined
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

