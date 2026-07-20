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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      daily_entries: {
        Row: {
          created_at: string
          energy: number | null
          entry_date: string
          fuel: boolean
          id: string
          mindset: boolean
          mindset_type: string | null
          mood: number | null
          motivation: number | null
          move_done: boolean
          move_minutes: number | null
          move_type: string | null
          notes: string | null
          nourish: boolean
          sleep_quality: number | null
          stress: number | null
          updated_at: string
          user_id: string
          water_ml: number
        }
        Insert: {
          created_at?: string
          energy?: number | null
          entry_date: string
          fuel?: boolean
          id?: string
          mindset?: boolean
          mindset_type?: string | null
          mood?: number | null
          motivation?: number | null
          move_done?: boolean
          move_minutes?: number | null
          move_type?: string | null
          notes?: string | null
          nourish?: boolean
          sleep_quality?: number | null
          stress?: number | null
          updated_at?: string
          user_id: string
          water_ml?: number
        }
        Update: {
          created_at?: string
          energy?: number | null
          entry_date?: string
          fuel?: boolean
          id?: string
          mindset?: boolean
          mindset_type?: string | null
          mood?: number | null
          motivation?: number | null
          move_done?: boolean
          move_minutes?: number | null
          move_type?: string | null
          notes?: string | null
          nourish?: boolean
          sleep_quality?: number | null
          stress?: number | null
          updated_at?: string
          user_id?: string
          water_ml?: number
        }
        Relationships: []
      }
      onboarding_responses: {
        Row: {
          commitment_name: string | null
          commitment_signed_at: string | null
          completed_at: string | null
          created_at: string
          future_letter: string | null
          goals: string[]
          id: string
          success_looks_like: string | null
          updated_at: string
          user_id: string
          want_to_feel: string | null
          why_change: string | null
          why_joined: string | null
          why_statement: string | null
        }
        Insert: {
          commitment_name?: string | null
          commitment_signed_at?: string | null
          completed_at?: string | null
          created_at?: string
          future_letter?: string | null
          goals?: string[]
          id?: string
          success_looks_like?: string | null
          updated_at?: string
          user_id: string
          want_to_feel?: string | null
          why_change?: string | null
          why_joined?: string | null
          why_statement?: string | null
        }
        Update: {
          commitment_name?: string | null
          commitment_signed_at?: string | null
          completed_at?: string | null
          created_at?: string
          future_letter?: string | null
          goals?: string[]
          id?: string
          success_looks_like?: string | null
          updated_at?: string
          user_id?: string
          want_to_feel?: string | null
          why_change?: string | null
          why_joined?: string | null
          why_statement?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          challenge_start_date: string
          created_at: string
          display_name: string | null
          id: string
          onboarding_completed_at: string | null
          updated_at: string
          water_target_ml: number
        }
        Insert: {
          challenge_start_date?: string
          created_at?: string
          display_name?: string | null
          id: string
          onboarding_completed_at?: string | null
          updated_at?: string
          water_target_ml?: number
        }
        Update: {
          challenge_start_date?: string
          created_at?: string
          display_name?: string | null
          id?: string
          onboarding_completed_at?: string | null
          updated_at?: string
          water_target_ml?: number
        }
        Relationships: []
      }
      struggle_moments: {
        Row: {
          action_taken: string
          created_at: string
          entry_date: string
          id: string
          user_id: string
        }
        Insert: {
          action_taken: string
          created_at?: string
          entry_date?: string
          id?: string
          user_id: string
        }
        Update: {
          action_taken?: string
          created_at?: string
          entry_date?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          created_at: string
          display_name: string | null
          headline: string | null
          id: string
          moderated_at: string | null
          moderated_by: string | null
          permission_to_publish: boolean
          rating: number
          status: string
          story: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          headline?: string | null
          id?: string
          moderated_at?: string | null
          moderated_by?: string | null
          permission_to_publish?: boolean
          rating: number
          status?: string
          story: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          headline?: string | null
          id?: string
          moderated_at?: string | null
          moderated_by?: string | null
          permission_to_publish?: boolean
          rating?: number
          status?: string
          story?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transformation_wheel: {
        Row: {
          confidence: number
          consistency: number
          created_at: string
          digestion: number
          energy: number
          fitness: number
          id: string
          mood: number
          motivation: number
          overall_health: number
          phase: string
          stress: number
          taken_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence: number
          consistency: number
          created_at?: string
          digestion: number
          energy: number
          fitness: number
          id?: string
          mood: number
          motivation: number
          overall_health: number
          phase: string
          stress: number
          taken_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          confidence?: number
          consistency?: number
          created_at?: string
          digestion?: number
          energy?: number
          fitness?: number
          id?: string
          mood?: number
          motivation?: number
          overall_health?: number
          phase?: string
          stress?: number
          taken_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
          role: Database["public"]["Enums"]["app_role"]
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
      vision_board_items: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          sort_order: number
          storage_path: string
          updated_at: string
          user_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          sort_order?: number
          storage_path: string
          updated_at?: string
          user_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          sort_order?: number
          storage_path?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      weekly_photos: {
        Row: {
          created_at: string
          id: string
          note: string | null
          storage_path: string
          updated_at: string
          user_id: string
          week_number: number
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          storage_path: string
          updated_at?: string
          user_id: string
          week_number: number
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          storage_path?: string
          updated_at?: string
          user_id?: string
          week_number?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
