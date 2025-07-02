export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_emails: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      women: {
        Row: {
          alt_contact_name: string | null
          areas_of_expertise: string[] | null
          company_name: string | null
          consent: boolean
          contact_number: string | null
          created_at: string
          email: string | null
          id: string
          interested_in: string[] | null
          job_title: string | null
          keywords: string[] | null
          languages: string[] | null
          long_bio: string | null
          memberships: string[] | null
          name: string
          nationality: string | null
          profile_picture_url: string | null
          short_bio: string | null
          social_media_links: Json | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          alt_contact_name?: string | null
          areas_of_expertise?: string[] | null
          company_name?: string | null
          consent?: boolean
          contact_number?: string | null
          created_at?: string
          email?: string | null
          id?: string
          interested_in?: string[] | null
          job_title?: string | null
          keywords?: string[] | null
          languages?: string[] | null
          long_bio?: string | null
          memberships?: string[] | null
          name: string
          nationality?: string | null
          profile_picture_url?: string | null
          short_bio?: string | null
          social_media_links?: Json | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          alt_contact_name?: string | null
          areas_of_expertise?: string[] | null
          company_name?: string | null
          consent?: boolean
          contact_number?: string | null
          created_at?: string
          email?: string | null
          id?: string
          interested_in?: string[] | null
          job_title?: string | null
          keywords?: string[] | null
          languages?: string[] | null
          long_bio?: string | null
          memberships?: string[] | null
          name?: string
          nationality?: string | null
          profile_picture_url?: string | null
          short_bio?: string | null
          social_media_links?: Json | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      women_public: {
        Row: {
          areas_of_expertise: string[] | null
          company_name: string | null
          created_at: string | null
          id: string | null
          interested_in: string[] | null
          job_title: string | null
          keywords: string[] | null
          languages: string[] | null
          long_bio: string | null
          memberships: string[] | null
          name: string | null
          nationality: string | null
          profile_picture_url: string | null
          short_bio: string | null
          social_media_links: Json | null
          status: string | null
        }
        Insert: {
          areas_of_expertise?: string[] | null
          company_name?: string | null
          created_at?: string | null
          id?: string | null
          interested_in?: string[] | null
          job_title?: string | null
          keywords?: string[] | null
          languages?: string[] | null
          long_bio?: string | null
          memberships?: string[] | null
          name?: string | null
          nationality?: string | null
          profile_picture_url?: string | null
          short_bio?: string | null
          social_media_links?: Json | null
          status?: string | null
        }
        Update: {
          areas_of_expertise?: string[] | null
          company_name?: string | null
          created_at?: string | null
          id?: string | null
          interested_in?: string[] | null
          job_title?: string | null
          keywords?: string[] | null
          languages?: string[] | null
          long_bio?: string | null
          memberships?: string[] | null
          name?: string | null
          nationality?: string | null
          profile_picture_url?: string | null
          short_bio?: string | null
          social_media_links?: Json | null
          status?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
