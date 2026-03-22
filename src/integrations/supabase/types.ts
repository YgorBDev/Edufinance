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
      badges: {
        Row: {
          achieved_at: string
          badge_type: string
          id: string
          user_id: string
        }
        Insert: {
          achieved_at?: string
          badge_type: string
          id?: string
          user_id: string
        }
        Update: {
          achieved_at?: string
          badge_type?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      lessons: {
        Row: {
          content: string
          created_at: string
          example: string | null
          id: string
          lesson_order: number
          module: string
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          example?: string | null
          id?: string
          lesson_order: number
          module?: string
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          example?: string | null
          id?: string
          lesson_order?: number
          module?: string
          title?: string
        }
        Relationships: []
      }
      portfolio_transactions: {
        Row: {
          created_at: string
          id: string
          price_per_unit: number
          quantity: number
          stock_code: string
          stock_name: string
          total_value: number
          transaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          price_per_unit: number
          quantity: number
          stock_code: string
          stock_name: string
          total_value: number
          transaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          price_per_unit?: number
          quantity?: number
          stock_code?: string
          stock_name?: string
          total_value?: number
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          accepted_terms: boolean
          avatar_url: string | null
          created_at: string
          current_streak: number
          id: string
          investor_type: string | null
          last_study_date: string | null
          level: number
          longest_streak: number
          name: string
          onboarding_completed: boolean
          updated_at: string
          virtual_balance: number
          xp: number
        }
        Insert: {
          accepted_terms?: boolean
          avatar_url?: string | null
          created_at?: string
          current_streak?: number
          id: string
          investor_type?: string | null
          last_study_date?: string | null
          level?: number
          longest_streak?: number
          name?: string
          onboarding_completed?: boolean
          updated_at?: string
          virtual_balance?: number
          xp?: number
        }
        Update: {
          accepted_terms?: boolean
          avatar_url?: string | null
          created_at?: string
          current_streak?: number
          id?: string
          investor_type?: string | null
          last_study_date?: string | null
          level?: number
          longest_streak?: number
          name?: string
          onboarding_completed?: boolean
          updated_at?: string
          virtual_balance?: number
          xp?: number
        }
        Relationships: []
      }
      quizzes: {
        Row: {
          correct_answer: number
          created_at: string
          explanation: string | null
          id: string
          lesson_id: string
          options: Json
          question: string
        }
        Insert: {
          correct_answer: number
          created_at?: string
          explanation?: string | null
          id?: string
          lesson_id: string
          options?: Json
          question: string
        }
        Update: {
          correct_answer?: number
          created_at?: string
          explanation?: string | null
          id?: string
          lesson_id?: string
          options?: Json
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      simulations: {
        Row: {
          annual_rate: number
          created_at: string
          final_value: number
          id: string
          initial_value: number
          investment_type: string
          monthly_contribution: number
          time_months: number
          user_id: string
        }
        Insert: {
          annual_rate: number
          created_at?: string
          final_value: number
          id?: string
          initial_value: number
          investment_type: string
          monthly_contribution?: number
          time_months: number
          user_id: string
        }
        Update: {
          annual_rate?: number
          created_at?: string
          final_value?: number
          id?: string
          initial_value?: number
          investment_type?: string
          monthly_contribution?: number
          time_months?: number
          user_id?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          lesson_id: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
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
