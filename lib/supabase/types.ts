export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string;
          preferred_virtue: string | null;
          preferred_persona: string | null;
          experience_level: string | null;
          daily_practice_time: string | null;
          timezone: string | null;
          notifications_enabled: boolean;
          privacy_level: string | null;
          onboarding_complete: boolean;
          last_active_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          preferred_virtue?: string | null;
          preferred_persona?: string | null;
          experience_level?: string | null;
          daily_practice_time?: string | null;
          timezone?: string | null;
          notifications_enabled?: boolean;
          privacy_level?: string | null;
          onboarding_complete?: boolean;
          last_active_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          preferred_virtue?: string | null;
          preferred_persona?: string | null;
          experience_level?: string | null;
          daily_practice_time?: string | null;
          timezone?: string | null;
          notifications_enabled?: boolean;
          privacy_level?: string | null;
          onboarding_complete?: boolean;
          last_active_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          virtue: string;
          tracking_type: string | null;
          target_value: number | null;
          difficulty_level: string | null;
          frequency: string | null;
          active_days: number[] | null;
          reminder_time: string | null;
          is_active: boolean;
          is_archived: boolean;
          sort_order: number | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          virtue: string;
          tracking_type?: string | null;
          target_value?: number | null;
          difficulty_level?: string | null;
          frequency?: string | null;
          active_days?: number[] | null;
          reminder_time?: string | null;
          is_active?: boolean;
          is_archived?: boolean;
          sort_order?: number | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          virtue?: string;
          tracking_type?: string | null;
          target_value?: number | null;
          difficulty_level?: string | null;
          frequency?: string | null;
          active_days?: number[] | null;
          reminder_time?: string | null;
          is_active?: boolean;
          is_archived?: boolean;
          sort_order?: number | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "habits_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      habit_logs: {
        Row: {
          id: string;
          user_id: string;
          habit_id: string;
          date: string;
          value: number | null;
          target_value: number | null;
          notes: string | null;
          mood_before: string | null;
          mood_after: string | null;
          difficulty_felt: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          habit_id: string;
          date: string;
          value?: number | null;
          target_value?: number | null;
          notes?: string | null;
          mood_before?: string | null;
          mood_after?: string | null;
          difficulty_felt?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          value?: number | null;
          target_value?: number | null;
          notes?: string | null;
          mood_before?: string | null;
          mood_after?: string | null;
          difficulty_felt?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "habit_logs_habit_id_fkey";
            columns: ["habit_id"];
            referencedRelation: "habits";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "habit_logs_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      reflections: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          type: string;
          virtue_focus: string | null;
          intention: string | null;
          lesson: string | null;
          gratitude: string | null;
          challenge: string | null;
          mood: number | null;
          journal_entry: string | null;
          key_insights: string[] | null;
          challenges_faced: string[] | null;
          wins_celebrated: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          type: string;
          virtue_focus?: string | null;
          intention?: string | null;
          lesson?: string | null;
          gratitude?: string | null;
          challenge?: string | null;
          mood?: number | null;
          journal_entry?: string | null;
          key_insights?: string[] | null;
          challenges_faced?: string[] | null;
          wins_celebrated?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          date?: string;
          type?: string;
          virtue_focus?: string | null;
          intention?: string | null;
          lesson?: string | null;
          gratitude?: string | null;
          challenge?: string | null;
          mood?: number | null;
          journal_entry?: string | null;
          key_insights?: string[] | null;
          challenges_faced?: string[] | null;
          wins_celebrated?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reflections_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      daily_progress: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          morning_intention: string | null;
          habits_completed: number | null;
          completion_rate: number | null;
          return_score: number | null;
          streak_days: number | null;
          wisdom_score: number | null;
          justice_score: number | null;
          temperance_score: number | null;
          courage_score: number | null;
          morning_reflection_complete: boolean;
          evening_reflection_complete: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          morning_intention?: string | null;
          habits_completed?: number | null;
          completion_rate?: number | null;
          return_score?: number | null;
          streak_days?: number | null;
          wisdom_score?: number | null;
          justice_score?: number | null;
          temperance_score?: number | null;
          courage_score?: number | null;
          morning_reflection_complete?: boolean;
          evening_reflection_complete?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          morning_intention?: string | null;
          habits_completed?: number | null;
          completion_rate?: number | null;
          return_score?: number | null;
          streak_days?: number | null;
          wisdom_score?: number | null;
          justice_score?: number | null;
          temperance_score?: number | null;
          courage_score?: number | null;
          morning_reflection_complete?: boolean;
          evening_reflection_complete?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "daily_progress_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      progress_summaries: {
        Row: {
          id: string;
          user_id: string;
          period_type: string;
          period_start: string;
          period_end: string;
          avg_return_score: number | null;
          most_consistent_virtue: string | null;
          streak_days: number | null;
          habits_completed: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          period_type: string;
          period_start: string;
          period_end: string;
          avg_return_score?: number | null;
          most_consistent_virtue?: string | null;
          streak_days?: number | null;
          habits_completed?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          period_type?: string;
          period_start?: string;
          period_end?: string;
          avg_return_score?: number | null;
          most_consistent_virtue?: string | null;
          streak_days?: number | null;
          habits_completed?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "progress_summaries_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      marcus_conversations: {
        Row: {
          id: string;
          user_id: string;
          title: string | null;
          context_type: string | null;
          virtue_focus: string | null;
          active_persona: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string | null;
          context_type?: string | null;
          virtue_focus?: string | null;
          active_persona?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string | null;
          context_type?: string | null;
          virtue_focus?: string | null;
          active_persona?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "marcus_conversations_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      marcus_messages: {
        Row: {
          id: string;
          user_id: string;
          conversation_id: string;
          role: string;
          content: string;
          persona_id: string | null;
          user_context: Json | null;
          ai_reasoning: Json | null;
          citations: Json | null;
          message_order: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          conversation_id: string;
          role: string;
          content: string;
          persona_id?: string | null;
          user_context?: Json | null;
          ai_reasoning?: Json | null;
          citations?: Json | null;
          message_order?: number | null;
          created_at?: string;
        };
        Update: {
          role?: string;
          content?: string;
          persona_id?: string | null;
          user_context?: Json | null;
          ai_reasoning?: Json | null;
          citations?: Json | null;
          message_order?: number | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "marcus_messages_conversation_id_fkey";
            columns: ["conversation_id"];
            referencedRelation: "marcus_conversations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "marcus_messages_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      app_settings: {
        Row: {
          key: string;
          value: Json;
          description: string | null;
          is_public: boolean;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          description?: string | null;
          is_public?: boolean;
          updated_at?: string;
        };
        Update: {
          value?: Json;
          description?: string | null;
          is_public?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      feedback: {
        Row: {
          id: string;
          user_id: string | null;
          type: string | null;
          priority: string | null;
          page_url: string | null;
          message: string;
          device_info: Json | null;
          status: string | null;
          admin_notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          type?: string | null;
          priority?: string | null;
          page_url?: string | null;
          message: string;
          device_info?: Json | null;
          status?: string | null;
          admin_notes?: string | null;
          created_at?: string;
        };
        Update: {
          user_id?: string | null;
          type?: string | null;
          priority?: string | null;
          page_url?: string | null;
          message?: string;
          device_info?: Json | null;
          status?: string | null;
          admin_notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "feedback_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      philosophy_chunks: {
        Row: {
          id: string;
          work: string;
          author: string | null;
          tradition: string | null;
          section: string | null;
          virtue: string | null;
          persona_tags: string[] | null;
          content: string;
          embedding: unknown;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          work: string;
          author?: string | null;
          tradition?: string | null;
          section?: string | null;
          virtue?: string | null;
          persona_tags?: string[] | null;
          content: string;
          embedding?: unknown;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          work?: string;
          author?: string | null;
          tradition?: string | null;
          section?: string | null;
          virtue?: string | null;
          persona_tags?: string[] | null;
          content?: string;
          embedding?: unknown;
          metadata?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      calculate_daily_progress: {
        Args: { target_user: string; target_date: string };
        Returns: void;
      };
      recalculate_progress_on_habit_log_change: {
        Args: Record<string, never>;
        Returns: unknown;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
