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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      endorsements: {
        Row: {
          area_of_expertise: string
          created_at: string
          id: string
          user_id: string
          woman_id: string
        }
        Insert: {
          area_of_expertise: string
          created_at?: string
          id?: string
          user_id: string
          woman_id: string
        }
        Update: {
          area_of_expertise?: string
          created_at?: string
          id?: string
          user_id?: string
          woman_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "endorsements_woman_id_fkey"
            columns: ["woman_id"]
            isOneToOne: false
            referencedRelation: "women_old"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      women: {
        Row: {
          areas_of_expertise: string[]
          bio: string
          company_name: string | null
          contact_number: string | null
          created_at: string
          email: string
          id: string
          interested_in: string[]
          interested_in_description: string | null
          job_title: string
          languages: string[]
          memberships: string[]
          name: string
          profile_picture: string | null
          social_media: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          areas_of_expertise: string[]
          bio?: string
          company_name?: string | null
          contact_number?: string | null
          created_at?: string
          email?: string
          id?: string
          interested_in: string[]
          interested_in_description?: string | null
          job_title?: string
          languages: string[]
          memberships: string[]
          name: string
          profile_picture?: string | null
          social_media?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          areas_of_expertise?: string[]
          bio?: string
          company_name?: string | null
          contact_number?: string | null
          created_at?: string
          email?: string
          id?: string
          interested_in?: string[]
          interested_in_description?: string | null
          job_title?: string
          languages?: string[]
          memberships?: string[]
          name?: string
          profile_picture?: string | null
          social_media?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      women_old: {
        Row: {
          alt_contact_name: string | null
          areas_of_expertise: string[]
          company_name: string | null
          consent: boolean
          contact_number: string | null
          created_at: string
          email: string
          id: string
          interested_in: string[]
          job_title: string
          languages: string[]
          linked_in: string | null
          memberships: string[] | null
          name: string
          profile_picture_url: string | null
          short_bio: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          alt_contact_name?: string | null
          areas_of_expertise: string[]
          company_name?: string | null
          consent: boolean
          contact_number?: string | null
          created_at?: string
          email: string
          id?: string
          interested_in: string[]
          job_title: string
          languages: string[]
          linked_in?: string | null
          memberships?: string[] | null
          name: string
          profile_picture_url?: string | null
          short_bio: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          alt_contact_name?: string | null
          areas_of_expertise?: string[]
          company_name?: string | null
          consent?: boolean
          contact_number?: string | null
          created_at?: string
          email?: string
          id?: string
          interested_in?: string[]
          job_title?: string
          languages?: string[]
          linked_in?: string | null
          memberships?: string[] | null
          name?: string
          profile_picture_url?: string | null
          short_bio?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: { _user_id: string }; Returns: boolean }
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
