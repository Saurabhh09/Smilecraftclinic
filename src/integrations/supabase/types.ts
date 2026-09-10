export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string;
          appointment_id: string | null;
          created_at: string;
          id: string;
          lead_id: string | null;
          metadata: Json;
          user_id: string | null;
        };
        Insert: {
          action: string;
          appointment_id?: string | null;
          created_at?: string;
          id?: string;
          lead_id?: string | null;
          metadata?: Json;
          user_id?: string | null;
        };
        Update: {
          action?: string;
          appointment_id?: string | null;
          created_at?: string;
          id?: string;
          lead_id?: string | null;
          metadata?: Json;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "activity_logs_appointment_id_fkey";
            columns: ["appointment_id"];
            isOneToOne: false;
            referencedRelation: "appointments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activity_logs_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
        ];
      };
      appointments: {
        Row: {
          appointment_date: string;
          appointment_time: string;
          created_at: string;
          duration_minutes: number;
          id: string;
          idempotency_key: string | null;
          lead_id: string;
          notes: string | null;
          service_id: string | null;
          status: Database["public"]["Enums"]["appointment_status"];
          updated_at: string;
        };
        Insert: {
          appointment_date: string;
          appointment_time: string;
          created_at?: string;
          duration_minutes?: number;
          id?: string;
          idempotency_key?: string | null;
          lead_id: string;
          notes?: string | null;
          service_id?: string | null;
          status?: Database["public"]["Enums"]["appointment_status"];
          updated_at?: string;
        };
        Update: {
          appointment_date?: string;
          appointment_time?: string;
          created_at?: string;
          duration_minutes?: number;
          id?: string;
          idempotency_key?: string | null;
          lead_id?: string;
          notes?: string | null;
          service_id?: string | null;
          status?: Database["public"]["Enums"]["appointment_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "appointments_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
        ];
      };
      blocked_slots: {
        Row: {
          created_at: string;
          date: string;
          end_time: string;
          id: string;
          reason: string;
          start_time: string;
        };
        Insert: {
          created_at?: string;
          date: string;
          end_time: string;
          id?: string;
          reason?: string;
          start_time: string;
        };
        Update: {
          created_at?: string;
          date?: string;
          end_time?: string;
          id?: string;
          reason?: string;
          start_time?: string;
        };
        Relationships: [];
      };
      conversations: {
        Row: {
          created_at: string;
          id: string;
          lead_id: string | null;
          session_id: string;
          status: string;
          summary: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          lead_id?: string | null;
          session_id: string;
          status?: string;
          summary?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          lead_id?: string | null;
          session_id?: string;
          status?: string;
          summary?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "conversations_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
        ];
      };
      faqs: {
        Row: {
          active: boolean;
          answer: string;
          category: string;
          created_at: string;
          id: string;
          question: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          answer: string;
          category?: string;
          created_at?: string;
          id?: string;
          question: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          active?: boolean;
          answer?: string;
          category?: string;
          created_at?: string;
          id?: string;
          question?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      follow_up_jobs: {
        Row: {
          appointment_id: string | null;
          attempts: number;
          created_at: string;
          id: string;
          last_attempt_at: string | null;
          lead_id: string | null;
          scheduled_for: string;
          status: string;
          workflow_type: string;
        };
        Insert: {
          appointment_id?: string | null;
          attempts?: number;
          created_at?: string;
          id?: string;
          last_attempt_at?: string | null;
          lead_id?: string | null;
          scheduled_for?: string;
          status?: string;
          workflow_type: string;
        };
        Update: {
          appointment_id?: string | null;
          attempts?: number;
          created_at?: string;
          id?: string;
          last_attempt_at?: string | null;
          lead_id?: string | null;
          scheduled_for?: string;
          status?: string;
          workflow_type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "follow_up_jobs_appointment_id_fkey";
            columns: ["appointment_id"];
            isOneToOne: false;
            referencedRelation: "appointments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "follow_up_jobs_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
        ];
      };
      knowledge_base: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          is_public: boolean;
          title: string;
          topic: string;
          updated_at: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          is_public?: boolean;
          title: string;
          topic: string;
          updated_at?: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          is_public?: boolean;
          title?: string;
          topic?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      leads: {
        Row: {
          conversation_summary: string | null;
          created_at: string;
          email: string | null;
          first_name: string;
          id: string;
          intent: Database["public"]["Enums"]["lead_intent"];
          last_contacted_at: string | null;
          last_name: string;
          patient_type: Database["public"]["Enums"]["patient_type"];
          phone: string;
          reason: string | null;
          source: string;
          status: Database["public"]["Enums"]["lead_status"];
          treatment_interest: string | null;
          updated_at: string;
          urgency: Database["public"]["Enums"]["urgency_level"];
        };
        Insert: {
          conversation_summary?: string | null;
          created_at?: string;
          email?: string | null;
          first_name: string;
          id?: string;
          intent?: Database["public"]["Enums"]["lead_intent"];
          last_contacted_at?: string | null;
          last_name?: string;
          patient_type?: Database["public"]["Enums"]["patient_type"];
          phone: string;
          reason?: string | null;
          source?: string;
          status?: Database["public"]["Enums"]["lead_status"];
          treatment_interest?: string | null;
          updated_at?: string;
          urgency?: Database["public"]["Enums"]["urgency_level"];
        };
        Update: {
          conversation_summary?: string | null;
          created_at?: string;
          email?: string | null;
          first_name?: string;
          id?: string;
          intent?: Database["public"]["Enums"]["lead_intent"];
          last_contacted_at?: string | null;
          last_name?: string;
          patient_type?: Database["public"]["Enums"]["patient_type"];
          phone?: string;
          reason?: string | null;
          source?: string;
          status?: Database["public"]["Enums"]["lead_status"];
          treatment_interest?: string | null;
          updated_at?: string;
          urgency?: Database["public"]["Enums"]["urgency_level"];
        };
        Relationships: [];
      };
      messages: {
        Row: {
          content: string;
          conversation_id: string;
          created_at: string;
          id: string;
          role: string;
        };
        Insert: {
          content: string;
          conversation_id: string;
          created_at?: string;
          id?: string;
          role: string;
        };
        Update: {
          content?: string;
          conversation_id?: string;
          created_at?: string;
          id?: string;
          role?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
        ];
      };
      outbox_events: {
        Row: {
          attempts: number;
          created_at: string;
          delivered_at: string | null;
          event_id: string;
          event_type: string;
          id: string;
          last_error: string | null;
          next_attempt_at: string;
          payload: Json;
          status: Database["public"]["Enums"]["outbox_status"];
        };
        Insert: {
          attempts?: number;
          created_at?: string;
          delivered_at?: string | null;
          event_id: string;
          event_type: string;
          id?: string;
          last_error?: string | null;
          next_attempt_at?: string;
          payload?: Json;
          status?: Database["public"]["Enums"]["outbox_status"];
        };
        Update: {
          attempts?: number;
          created_at?: string;
          delivered_at?: string | null;
          event_id?: string;
          event_type?: string;
          id?: string;
          last_error?: string | null;
          next_attempt_at?: string;
          payload?: Json;
          status?: Database["public"]["Enums"]["outbox_status"];
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string;
          full_name: string;
          id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          full_name?: string;
          id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          full_name?: string;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      rate_limit_hits: {
        Row: {
          bucket: string;
          created_at: string;
          id: number;
          identifier_hash: string;
        };
        Insert: {
          bucket: string;
          created_at?: string;
          id?: number;
          identifier_hash: string;
        };
        Update: {
          bucket?: string;
          created_at?: string;
          id?: number;
          identifier_hash?: string;
        };
        Relationships: [];
      };
      services: {
        Row: {
          active: boolean;
          category: string;
          created_at: string;
          description: string;
          duration_minutes: number;
          id: string;
          long_description: string;
          name: string;
          price_from: number | null;
          price_note: string;
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          category?: string;
          created_at?: string;
          description?: string;
          duration_minutes?: number;
          id?: string;
          long_description?: string;
          name: string;
          price_from?: number | null;
          price_note?: string;
          slug: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          active?: boolean;
          category?: string;
          created_at?: string;
          description?: string;
          duration_minutes?: number;
          id?: string;
          long_description?: string;
          name?: string;
          price_from?: number | null;
          price_note?: string;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      staff_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      is_staff: { Args: { _user_id: string }; Returns: boolean };
    };
    Enums: {
      app_role: "admin" | "receptionist" | "dentist";
      appointment_status:
        "requested" | "confirmed" | "rescheduled" | "completed" | "cancelled" | "no_show";
      lead_intent: "high_intent" | "considering" | "information_only";
      lead_status: "new" | "contacted" | "qualified" | "booked" | "completed" | "lost";
      outbox_status: "pending" | "delivered" | "failed" | "dead";
      patient_type: "new" | "existing" | "unknown";
      urgency_level: "routine" | "soon" | "urgent" | "emergency";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "receptionist", "dentist"],
      appointment_status: [
        "requested",
        "confirmed",
        "rescheduled",
        "completed",
        "cancelled",
        "no_show",
      ],
      lead_intent: ["high_intent", "considering", "information_only"],
      lead_status: ["new", "contacted", "qualified", "booked", "completed", "lost"],
      outbox_status: ["pending", "delivered", "failed", "dead"],
      patient_type: ["new", "existing", "unknown"],
      urgency_level: ["routine", "soon", "urgent", "emergency"],
    },
  },
} as const;
