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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      community_quiz_answers: {
        Row: {
          created_at: string
          feelings: string[]
          id: string
          support: string
          transition: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          feelings?: string[]
          id?: string
          support: string
          transition: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          feelings?: string[]
          id?: string
          support?: string
          transition?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      compass_choices: {
        Row: {
          aligned_with_values: boolean | null
          choice_text: string
          chose_differently: boolean | null
          created_at: string
          id: string
          outcome_rating: number | null
          pause_used: boolean | null
          trigger_id: string | null
          user_id: string
        }
        Insert: {
          aligned_with_values?: boolean | null
          choice_text: string
          chose_differently?: boolean | null
          created_at?: string
          id?: string
          outcome_rating?: number | null
          pause_used?: boolean | null
          trigger_id?: string | null
          user_id: string
        }
        Update: {
          aligned_with_values?: boolean | null
          choice_text?: string
          chose_differently?: boolean | null
          created_at?: string
          id?: string
          outcome_rating?: number | null
          pause_used?: boolean | null
          trigger_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "compass_choices_trigger_id_fkey"
            columns: ["trigger_id"]
            isOneToOne: false
            referencedRelation: "compass_triggers"
            referencedColumns: ["id"]
          },
        ]
      }
      compass_triggers: {
        Row: {
          category: string | null
          context: string | null
          created_at: string
          emotion: string | null
          id: string
          intensity: number | null
          trigger_text: string
          urge: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          context?: string | null
          created_at?: string
          emotion?: string | null
          id?: string
          intensity?: number | null
          trigger_text: string
          urge?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          context?: string | null
          created_at?: string
          emotion?: string | null
          id?: string
          intensity?: number | null
          trigger_text?: string
          urge?: string | null
          user_id?: string
        }
        Relationships: []
      }
      future_self_messages: {
        Row: {
          context: string | null
          created_at: string
          duration_seconds: number | null
          id: string
          storage_path: string
          title: string
          user_id: string
        }
        Insert: {
          context?: string | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          storage_path: string
          title?: string
          user_id: string
        }
        Update: {
          context?: string | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          storage_path?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      gratitude_wall: {
        Row: {
          created_at: string
          id: string
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          user_id?: string
        }
        Relationships: []
      }
      pause_sessions: {
        Row: {
          chose_deeper: boolean
          completed: boolean
          created_at: string
          duration_seconds: number
          feeling: string | null
          id: string
          user_id: string
        }
        Insert: {
          chose_deeper?: boolean
          completed?: boolean
          created_at?: string
          duration_seconds?: number
          feeling?: string | null
          id?: string
          user_id: string
        }
        Update: {
          chose_deeper?: boolean
          completed?: boolean
          created_at?: string
          duration_seconds?: number
          feeling?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      restlessness_sessions: {
        Row: {
          created_at: string
          duration_seconds: number | null
          id: string
          tool_used: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          id?: string
          tool_used: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          id?: string
          tool_used?: string
          user_id?: string
        }
        Relationships: []
      }
      why_vault: {
        Row: {
          category: string
          created_at: string
          id: string
          text: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          text: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          text?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      gratitude_wall_safe: {
        Row: {
          created_at: string | null
          id: string | null
          message: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          message?: string | null
          user_id?: never
        }
        Update: {
          created_at?: string | null
          id?: string | null
          message?: string | null
          user_id?: never
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
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
  public: {
    Enums: {},
  },
} as const
