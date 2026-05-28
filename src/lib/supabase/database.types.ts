export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      comparisons: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          status: "draft" | "ready_for_review" | "completed";
          max_competitors: number;
          selected_finalist_ids: string[];
          recommended_finalist_ids: string[];
          summary: Json;
          insights: Json;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          status?: "draft" | "ready_for_review" | "completed";
          max_competitors?: number;
          selected_finalist_ids?: string[];
          recommended_finalist_ids?: string[];
          summary?: Json;
          insights?: Json;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["comparisons"]["Insert"]>;
        Relationships: [];
      };
      competitors: {
        Row: {
          id: string;
          comparison_id: string;
          position: number;
          company_name: string;
          seller_name: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          comparison_id: string;
          position: number;
          company_name: string;
          seller_name?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["competitors"]["Insert"]>;
        Relationships: [];
      };
      comparison_events: {
        Row: {
          id: string;
          comparison_id: string;
          actor_id: string | null;
          event_type: string;
          payload: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          comparison_id: string;
          actor_id?: string | null;
          event_type: string;
          payload?: Json;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["comparison_events"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
