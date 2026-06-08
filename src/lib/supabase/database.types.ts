export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          company_name: string | null;
          phone: string | null;
          onboarded_at: string | null;
          access_expires_at: string | null;
          greenn_order_id: string | null;
          blocked_at: string | null;
          access_source: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          company_name?: string | null;
          phone?: string | null;
          onboarded_at?: string | null;
          access_expires_at?: string | null;
          greenn_order_id?: string | null;
          blocked_at?: string | null;
          access_source?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
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
          share_token: string | null;
          share_enabled: boolean;
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
          share_token?: string | null;
          share_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["competitors"]["Insert"]>;
        Relationships: [];
      };
      company_evaluations: {
        Row: {
          id: string;
          comparison_id: string;
          competitor_id: string;
          solar_since_year: number | null;
          company_founded_year: number | null;
          has_electrical_engineering_crea: "yes" | "no" | "unknown" | null;
          engineer_graduation_year: number | null;
          installed_systems_range: "lt_10" | "10_49" | "50_100" | "gt_100" | "gt_500" | "gt_1000" | "unknown" | null;
          own_installation_team: "own" | "outsourced" | "unknown" | null;
          installation_deadline_days: number | null;
          project_execution_warranty_years: number | null;
          has_maintenance_support: "yes" | "no" | "unknown" | null;
          support_deadline_days: number | null;
          delivered_technical_docs: "yes" | "no" | "unknown" | null;
          seller_trust_score: number | null;
          reclame_aqui_score: string | null;
          raw_payload: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          comparison_id: string;
          competitor_id: string;
          solar_since_year?: number | null;
          company_founded_year?: number | null;
          has_electrical_engineering_crea?: "yes" | "no" | "unknown" | null;
          engineer_graduation_year?: number | null;
          installed_systems_range?: "lt_10" | "10_49" | "50_100" | "gt_100" | "gt_500" | "gt_1000" | "unknown" | null;
          own_installation_team?: "own" | "outsourced" | "unknown" | null;
          installation_deadline_days?: number | null;
          project_execution_warranty_years?: number | null;
          has_maintenance_support?: "yes" | "no" | "unknown" | null;
          support_deadline_days?: number | null;
          delivered_technical_docs?: "yes" | "no" | "unknown" | null;
          seller_trust_score?: number | null;
          reclame_aqui_score?: string | null;
          raw_payload?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["company_evaluations"]["Insert"]>;
        Relationships: [];
      };
      technical_evaluations: {
        Row: {
          id: string;
          comparison_id: string;
          competitor_id: string;
          annual_consumption_kwh: number | null;
          system_power_kwp: number | null;
          monthly_generation_kwh: number | null;
          annual_generation_kwh: number | null;
          module_brand: string | null;
          module_model: string | null;
          module_power_w: number | null;
          module_weight_kg: number | null;
          module_efficiency_pct: number | null;
          module_lifetime_efficiency_pct: number | null;
          module_defect_warranty_years: number | null;
          module_efficiency_warranty_years: number | null;
          module_count: number | null;
          inverter_brand: string | null;
          inverter_model: string | null;
          inverter_power_kw: number | null;
          inverter_defect_warranty_years: number | null;
          inverter_count: number | null;
          inverter_oversizing_ratio: number | null;
          distributor_name: string | null;
          distributor_score: string | null;
          module_maker_name: string | null;
          module_maker_score: string | null;
          inverter_maker_name: string | null;
          inverter_maker_score: string | null;
          inverter_reliability: "yes" | "no" | "unknown" | null;
          module_reliability: "yes" | "no" | "unknown" | null;
          distributor_reliability: "yes" | "no" | "unknown" | null;
          raw_payload: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          comparison_id: string;
          competitor_id: string;
          annual_consumption_kwh?: number | null;
          system_power_kwp?: number | null;
          monthly_generation_kwh?: number | null;
          annual_generation_kwh?: number | null;
          module_brand?: string | null;
          module_model?: string | null;
          module_power_w?: number | null;
          module_weight_kg?: number | null;
          module_efficiency_pct?: number | null;
          module_lifetime_efficiency_pct?: number | null;
          module_defect_warranty_years?: number | null;
          module_efficiency_warranty_years?: number | null;
          module_count?: number | null;
          inverter_brand?: string | null;
          inverter_model?: string | null;
          inverter_power_kw?: number | null;
          inverter_defect_warranty_years?: number | null;
          inverter_count?: number | null;
          inverter_oversizing_ratio?: number | null;
          distributor_name?: string | null;
          distributor_score?: string | null;
          module_maker_name?: string | null;
          module_maker_score?: string | null;
          inverter_maker_name?: string | null;
          inverter_maker_score?: string | null;
          inverter_reliability?: "yes" | "no" | "unknown" | null;
          module_reliability?: "yes" | "no" | "unknown" | null;
          distributor_reliability?: "yes" | "no" | "unknown" | null;
          raw_payload?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["technical_evaluations"]["Insert"]>;
        Relationships: [];
      };
      financial_evaluations: {
        Row: {
          id: string;
          comparison_id: string;
          competitor_id: string;
          monthly_bill_without_solar: number | null;
          monthly_bill_with_solar: number | null;
          monthly_savings_first_year: number | null;
          annual_savings_first_year: number | null;
          accumulated_savings_25_years: number | null;
          total_investment: number | null;
          payment_down: number | null;
          payment_equipment_delivery: number | null;
          payment_installation_final: number | null;
          simple_payback_months: number | null;
          annual_return_pct: number | null;
          roi_multiplier: number | null;
          energy_inflation_pct: number | null;
          simultaneity_factor_pct: number | null;
          viability_confidence: "high" | "medium" | "low" | "unknown" | null;
          raw_payload: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          comparison_id: string;
          competitor_id: string;
          monthly_bill_without_solar?: number | null;
          monthly_bill_with_solar?: number | null;
          monthly_savings_first_year?: number | null;
          annual_savings_first_year?: number | null;
          accumulated_savings_25_years?: number | null;
          total_investment?: number | null;
          payment_down?: number | null;
          payment_equipment_delivery?: number | null;
          payment_installation_final?: number | null;
          simple_payback_months?: number | null;
          annual_return_pct?: number | null;
          roi_multiplier?: number | null;
          energy_inflation_pct?: number | null;
          simultaneity_factor_pct?: number | null;
          viability_confidence?: "high" | "medium" | "low" | "unknown" | null;
          raw_payload?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["financial_evaluations"]["Insert"]>;
        Relationships: [];
      };
      comparison_score_settings: {
        Row: {
          comparison_id: string;
          criterion_key: string;
          enabled: boolean;
          weight: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          comparison_id: string;
          criterion_key: string;
          enabled?: boolean;
          weight?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["comparison_score_settings"]["Insert"]>;
        Relationships: [];
      };
      score_entries: {
        Row: {
          comparison_id: string;
          competitor_id: string;
          criterion_key: string;
          category: "company" | "technical" | "financial";
          score: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          comparison_id: string;
          competitor_id: string;
          criterion_key: string;
          category: "company" | "technical" | "financial";
          score?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["score_entries"]["Insert"]>;
        Relationships: [];
      };
      saved_companies: {
        Row: {
          id: string;
          owner_id: string;
          company_name: string;
          seller_name: string | null;
          notes: string | null;
          company_payload: Json;
          technical_payload: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          company_name: string;
          seller_name?: string | null;
          notes?: string | null;
          company_payload?: Json;
          technical_payload?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["saved_companies"]["Insert"]>;
        Relationships: [];
      };
      contract_reviews: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          contract_text: string;
          verdict: "reproved" | "attention" | "approved";
          score: number;
          findings: Json;
          approved_by_user: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          contract_text: string;
          verdict: "reproved" | "attention" | "approved";
          score?: number;
          findings?: Json;
          approved_by_user?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["contract_reviews"]["Insert"]>;
        Relationships: [];
      };
      course_progress: {
        Row: {
          user_id: string;
          lesson_id: string;
          completed_at: string;
        };
        Insert: {
          user_id: string;
          lesson_id: string;
          completed_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["course_progress"]["Insert"]>;
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
