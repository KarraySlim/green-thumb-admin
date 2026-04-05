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
      climats: {
        Row: {
          created_at: string
          humidite_c: number
          id: string
          puissance_ensoleillement: number
          temperature_c: number
          vitesse_vent: number
        }
        Insert: {
          created_at?: string
          humidite_c?: number
          id?: string
          puissance_ensoleillement?: number
          temperature_c?: number
          vitesse_vent?: number
        }
        Update: {
          created_at?: string
          humidite_c?: number
          id?: string
          puissance_ensoleillement?: number
          temperature_c?: number
          vitesse_vent?: number
        }
        Relationships: []
      }
      plantes: {
        Row: {
          age: number
          created_at: string
          fk_surface: string | null
          fk_type_plante: string | null
          id: string
          nom_plante: string
        }
        Insert: {
          age?: number
          created_at?: string
          fk_surface?: string | null
          fk_type_plante?: string | null
          id?: string
          nom_plante: string
        }
        Update: {
          age?: number
          created_at?: string
          fk_surface?: string | null
          fk_type_plante?: string | null
          id?: string
          nom_plante?: string
        }
        Relationships: [
          {
            foreignKeyName: "plantes_fk_surface_fkey"
            columns: ["fk_surface"]
            isOneToOne: false
            referencedRelation: "surfaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plantes_fk_type_plante_fkey"
            columns: ["fk_type_plante"]
            isOneToOne: false
            referencedRelation: "types_plante"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          company_logo: string | null
          company_name: string | null
          country: string | null
          created_at: string
          created_by: string | null
          date_deb_abo: string | null
          date_exp_abo: string | null
          date_of_birth: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          location: string | null
          phone_number: string | null
          type_abo: string | null
          updated_at: string
          user_id: string
          user_role: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          company_logo?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          date_deb_abo?: string | null
          date_exp_abo?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          location?: string | null
          phone_number?: string | null
          type_abo?: string | null
          updated_at?: string
          user_id: string
          user_role?: string
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          company_logo?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          date_deb_abo?: string | null
          date_exp_abo?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          location?: string | null
          phone_number?: string | null
          type_abo?: string | null
          updated_at?: string
          user_id?: string
          user_role?: string
        }
        Relationships: []
      }
      soil_reports: {
        Row: {
          argile: number | null
          azote: number | null
          bore: number | null
          calcium: number | null
          cec: number | null
          client_id: string
          conductivite: number | null
          created_at: string
          cuivre: number | null
          fer: number | null
          id: string
          limon: number | null
          magnesium: number | null
          manganese: number | null
          matiere_organique: number | null
          ph: number | null
          phosphore: number | null
          potassium: number | null
          report_type: string
          sable: number | null
          sodium: number | null
          zinc: number | null
        }
        Insert: {
          argile?: number | null
          azote?: number | null
          bore?: number | null
          calcium?: number | null
          cec?: number | null
          client_id: string
          conductivite?: number | null
          created_at?: string
          cuivre?: number | null
          fer?: number | null
          id?: string
          limon?: number | null
          magnesium?: number | null
          manganese?: number | null
          matiere_organique?: number | null
          ph?: number | null
          phosphore?: number | null
          potassium?: number | null
          report_type: string
          sable?: number | null
          sodium?: number | null
          zinc?: number | null
        }
        Update: {
          argile?: number | null
          azote?: number | null
          bore?: number | null
          calcium?: number | null
          cec?: number | null
          client_id?: string
          conductivite?: number | null
          created_at?: string
          cuivre?: number | null
          fer?: number | null
          id?: string
          limon?: number | null
          magnesium?: number | null
          manganese?: number | null
          matiere_organique?: number | null
          ph?: number | null
          phosphore?: number | null
          potassium?: number | null
          report_type?: string
          sable?: number | null
          sodium?: number | null
          zinc?: number | null
        }
        Relationships: []
      }
      sols: {
        Row: {
          created_at: string
          date_mesure: string
          humidite: number
          id: string
          nature: string
          ph: number
          salinite: number
          temperature: number
        }
        Insert: {
          created_at?: string
          date_mesure?: string
          humidite?: number
          id?: string
          nature: string
          ph?: number
          salinite?: number
          temperature?: number
        }
        Update: {
          created_at?: string
          date_mesure?: string
          humidite?: number
          id?: string
          nature?: string
          ph?: number
          salinite?: number
          temperature?: number
        }
        Relationships: []
      }
      subscription_notifications: {
        Row: {
          client_email: string
          client_name: string
          created_at: string
          days_remaining: number
          id: string
          sent_at: string
        }
        Insert: {
          client_email: string
          client_name: string
          created_at?: string
          days_remaining: number
          id?: string
          sent_at?: string
        }
        Update: {
          client_email?: string
          client_name?: string
          created_at?: string
          days_remaining?: number
          id?: string
          sent_at?: string
        }
        Relationships: []
      }
      surfaces: {
        Row: {
          created_at: string
          fk_climat: string | null
          fk_sol: string | null
          fk_user: string | null
          id: string
          localisation: string
          nom_surface: string
          taille_ha: number | null
          type_sol: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          fk_climat?: string | null
          fk_sol?: string | null
          fk_user?: string | null
          id?: string
          localisation?: string
          nom_surface: string
          taille_ha?: number | null
          type_sol?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          fk_climat?: string | null
          fk_sol?: string | null
          fk_user?: string | null
          id?: string
          localisation?: string
          nom_surface?: string
          taille_ha?: number | null
          type_sol?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "surfaces_fk_climat_fkey"
            columns: ["fk_climat"]
            isOneToOne: false
            referencedRelation: "climats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surfaces_fk_sol_fkey"
            columns: ["fk_sol"]
            isOneToOne: false
            referencedRelation: "sols"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surfaces_fk_user_fkey"
            columns: ["fk_user"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      types_plante: {
        Row: {
          besoin_eau_par_plante: number
          created_at: string
          id: string
          nom_plante: string
          type_plante: string
        }
        Insert: {
          besoin_eau_par_plante?: number
          created_at?: string
          id?: string
          nom_plante: string
          type_plante: string
        }
        Update: {
          besoin_eau_par_plante?: number
          created_at?: string
          id?: string
          nom_plante?: string
          type_plante?: string
        }
        Relationships: []
      }
      vannes: {
        Row: {
          created_at: string
          debit_eau_par_vanne: number
          fk_surface: string | null
          id: string
          nb_plant_par_vanne: number
          nom_vanne: string
        }
        Insert: {
          created_at?: string
          debit_eau_par_vanne?: number
          fk_surface?: string | null
          id?: string
          nb_plant_par_vanne?: number
          nom_vanne: string
        }
        Update: {
          created_at?: string
          debit_eau_par_vanne?: number
          fk_surface?: string | null
          id?: string
          nb_plant_par_vanne?: number
          nom_vanne?: string
        }
        Relationships: [
          {
            foreignKeyName: "vannes_fk_surface_fkey"
            columns: ["fk_surface"]
            isOneToOne: false
            referencedRelation: "surfaces"
            referencedColumns: ["id"]
          },
        ]
      }
      water_reports: {
        Row: {
          bicarbonates: number | null
          calcium: number | null
          cew: number | null
          chlorures: number | null
          client_id: string
          created_at: string
          durete: number | null
          id: string
          magnesium: number | null
          ph: number | null
          report_type: string
          residu_sec: number | null
          sar: number | null
          sodium: number | null
          sulfates: number | null
        }
        Insert: {
          bicarbonates?: number | null
          calcium?: number | null
          cew?: number | null
          chlorures?: number | null
          client_id: string
          created_at?: string
          durete?: number | null
          id?: string
          magnesium?: number | null
          ph?: number | null
          report_type?: string
          residu_sec?: number | null
          sar?: number | null
          sodium?: number | null
          sulfates?: number | null
        }
        Update: {
          bicarbonates?: number | null
          calcium?: number | null
          cew?: number | null
          chlorures?: number | null
          client_id?: string
          created_at?: string
          durete?: number | null
          id?: string
          magnesium?: number | null
          ph?: number | null
          report_type?: string
          residu_sec?: number | null
          sar?: number | null
          sodium?: number | null
          sulfates?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_all_auth_users: {
        Args: never
        Returns: {
          avatar_url: string
          created_at: string
          email: string
          email_confirmed_at: string
          first_name: string
          id: string
          last_name: string
        }[]
      }
      get_profile_id: { Args: { _user_id: string }; Returns: string }
      get_user_role: { Args: { _user_id: string }; Returns: string }
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
