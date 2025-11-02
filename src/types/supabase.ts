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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_chat_logs: {
        Row: {
          context: Json | null
          created_at: string
          id: string
          message: string
          response: string
          user_id: string
        }
        Insert: {
          context?: Json | null
          created_at?: string
          id?: string
          message: string
          response: string
          user_id: string
        }
        Update: {
          context?: Json | null
          created_at?: string
          id?: string
          message?: string
          response?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      billing: {
        Row: {
          amount: number
          billing_period_end: string
          billing_period_start: string
          created_at: string
          currency: string
          id: string
          paid_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          billing_period_end: string
          billing_period_start: string
          created_at?: string
          currency?: string
          id?: string
          paid_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          billing_period_end?: string
          billing_period_start?: string
          created_at?: string
          currency?: string
          id?: string
          paid_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          billing_id: string | null
          created_at: string
          currency: string
          due_date: string
          id: string
          invoice_number: string
          issue_date: string
          notes: string | null
          paid_date: string | null
          pdf_url: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          billing_id?: string | null
          created_at?: string
          currency?: string
          due_date: string
          id?: string
          invoice_number: string
          issue_date: string
          notes?: string | null
          paid_date?: string | null
          pdf_url?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          billing_id?: string | null
          created_at?: string
          currency?: string
          due_date?: string
          id?: string
          invoice_number?: string
          issue_date?: string
          notes?: string | null
          paid_date?: string | null
          pdf_url?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_billing_id_fkey"
            columns: ["billing_id"]
            isOneToOne: false
            referencedRelation: "billing"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      project_updates: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          title: string
          update_type: string
          user_id: string
          website_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          title: string
          update_type?: string
          user_id: string
          website_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          title?: string
          update_type?: string
          user_id?: string
          website_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_updates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_updates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_updates_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string
          credited_at: string | null
          id: string
          notes: string | null
          referred_email: string
          referred_name: string | null
          reward_amount: number | null
          reward_currency: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credited_at?: string | null
          id?: string
          notes?: string | null
          referred_email: string
          referred_name?: string | null
          reward_amount?: number | null
          reward_currency?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credited_at?: string | null
          id?: string
          notes?: string | null
          referred_email?: string
          referred_name?: string | null
          reward_amount?: number | null
          reward_currency?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          category: string | null
          created_at: string
          id: string
          message: string
          priority: string
          responded_at: string | null
          responded_by: string | null
          response: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          message: string
          priority?: string
          responded_at?: string | null
          responded_by?: string | null
          response?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          message?: string
          priority?: string
          responded_at?: string | null
          responded_by?: string | null
          response?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_responded_by_fkey"
            columns: ["responded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          current_plan: string | null
          email: string
          full_name: string | null
          id: string
          last_login: string | null
          plan_started_at: string | null
          requires_password_change: boolean | null
          role: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_plan?: string | null
          email: string
          full_name?: string | null
          id: string
          last_login?: string | null
          plan_started_at?: string | null
          requires_password_change?: boolean | null
          role?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_plan?: string | null
          email?: string
          full_name?: string | null
          id?: string
          last_login?: string | null
          plan_started_at?: string | null
          requires_password_change?: boolean | null
          role?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      websites: {
        Row: {
          created_at: string
          id: string
          name: string
          progress_percentage: number
          status: string
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          progress_percentage?: number
          status?: string
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          progress_percentage?: number
          status?: string
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "websites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_invoice_number: { Args: never; Returns: string }
      get_user_role: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
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
