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
          payment_method: string | null
          pdf_url: string | null
          sent_at: string | null
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
          payment_method?: string | null
          pdf_url?: string | null
          sent_at?: string | null
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
          payment_method?: string | null
          pdf_url?: string | null
          sent_at?: string | null
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
      email_events: {
        Row: {
          body: string | null
          bounced_at: string | null
          created_at: string
          direction: string
          error_message: string | null
          id: string
          lead_id: string
          opened_at: string | null
          replied_at: string | null
          resend_message_id: string | null
          sent_at: string | null
          sent_by: string | null
          subject: string | null
          unsubscribe_token: string | null
        }
        Insert: {
          body?: string | null
          bounced_at?: string | null
          created_at?: string
          direction: string
          error_message?: string | null
          id?: string
          lead_id: string
          opened_at?: string | null
          replied_at?: string | null
          resend_message_id?: string | null
          sent_at?: string | null
          sent_by?: string | null
          subject?: string | null
          unsubscribe_token?: string | null
        }
        Update: {
          body?: string | null
          bounced_at?: string | null
          created_at?: string
          direction?: string
          error_message?: string | null
          id?: string
          lead_id?: string
          opened_at?: string | null
          replied_at?: string | null
          resend_message_id?: string | null
          sent_at?: string | null
          sent_by?: string | null
          subject?: string | null
          unsubscribe_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_events_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_events_sent_by_fkey"
            columns: ["sent_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      email_suppression: {
        Row: {
          email: string
          id: string
          reason: string | null
          suppressed_at: string
          unsubscribe_token: string | null
        }
        Insert: {
          email: string
          id?: string
          reason?: string | null
          suppressed_at?: string
          unsubscribe_token?: string | null
        }
        Update: {
          email?: string
          id?: string
          reason?: string | null
          suppressed_at?: string
          unsubscribe_token?: string | null
        }
        Relationships: []
      }
      import_batches: {
        Row: {
          filename: string
          id: string
          imported_at: string
          imported_by: string
          new_leads: number
          notes: string | null
          schema_version: string
          skipped_invalid: number
          skipped_unsubscribed: number
          total_records: number
          updated_leads: number
        }
        Insert: {
          filename: string
          id?: string
          imported_at?: string
          imported_by: string
          new_leads?: number
          notes?: string | null
          schema_version: string
          skipped_invalid?: number
          skipped_unsubscribed?: number
          total_records?: number
          updated_leads?: number
        }
        Update: {
          filename?: string
          id?: string
          imported_at?: string
          imported_by?: string
          new_leads?: number
          notes?: string | null
          schema_version?: string
          skipped_invalid?: number
          skipped_unsubscribed?: number
          total_records?: number
          updated_leads?: number
        }
        Relationships: [
          {
            foreignKeyName: "import_batches_imported_by_fkey"
            columns: ["imported_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          address: string | null
          assigned_to: string | null
          audit_data: Json
          audit_findings_summary: string | null
          business_name: string
          contact_email: string | null
          contact_name: string | null
          created_at: string
          domain: string
          google_place_id: string | null
          id: string
          last_audited_at: string | null
          personalised_email_draft: string | null
          phone: string | null
          source: string
          status: string
          unsubscribed_at: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          assigned_to?: string | null
          audit_data?: Json
          audit_findings_summary?: string | null
          business_name: string
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          domain: string
          google_place_id?: string | null
          id?: string
          last_audited_at?: string | null
          personalised_email_draft?: string | null
          phone?: string | null
          source?: string
          status?: string
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          assigned_to?: string | null
          audit_data?: Json
          audit_findings_summary?: string | null
          business_name?: string
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          domain?: string
          google_place_id?: string | null
          id?: string
          last_audited_at?: string | null
          personalised_email_draft?: string | null
          phone?: string | null
          source?: string
          status?: string
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_to_fkey"
            columns: ["assigned_to"]
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
      suppression_removals: {
        Row: {
          email: string
          id: string
          notes: string | null
          previous_reason: string | null
          removed_at: string
          removed_by: string
        }
        Insert: {
          email: string
          id?: string
          notes?: string | null
          previous_reason?: string | null
          removed_at?: string
          removed_by: string
        }
        Update: {
          email?: string
          id?: string
          notes?: string | null
          previous_reason?: string | null
          removed_at?: string
          removed_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "suppression_removals_removed_by_fkey"
            columns: ["removed_by"]
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
      support_ticket_messages: {
        Row: {
          id: string
          ticket_id: string
          author_id: string
          author_role: string
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          author_id: string
          author_role: string
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          author_id?: string
          author_role?: string
          message?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_ticket_messages_author_id_fkey"
            columns: ["author_id"]
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
          must_change_password: boolean | null
          password_changed_at: string | null
          password_set_by_admin: boolean | null
          plan_started_at: string | null
          requires_password_change: boolean | null
          role: string
          status: string
          updated_at: string
          welcome_email_sent_at: string | null
        }
        Insert: {
          created_at?: string
          current_plan?: string | null
          email: string
          full_name?: string | null
          id: string
          last_login?: string | null
          must_change_password?: boolean | null
          password_changed_at?: string | null
          password_set_by_admin?: boolean | null
          plan_started_at?: string | null
          requires_password_change?: boolean | null
          role?: string
          status?: string
          updated_at?: string
          welcome_email_sent_at?: string | null
        }
        Update: {
          created_at?: string
          current_plan?: string | null
          email?: string
          full_name?: string | null
          id?: string
          last_login?: string | null
          must_change_password?: boolean | null
          password_changed_at?: string | null
          password_set_by_admin?: boolean | null
          plan_started_at?: string | null
          requires_password_change?: boolean | null
          role?: string
          status?: string
          updated_at?: string
          welcome_email_sent_at?: string | null
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
      admin_create_user: {
        Args: {
          p_email: string
          p_full_name?: string
          p_password: string
          p_role?: string
          p_status?: string
        }
        Returns: string
      }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
