export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
	// Allows to automatically instantiate createClient with right options
	// instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
	__InternalSupabase: {
		PostgrestVersion: "12.2.3 (519615d)";
	};
	public: {
		Tables: {
			admin_emails: {
				Row: {
					created_at: string;
					email: string;
					id: string;
				};
				Insert: {
					created_at?: string;
					email: string;
					id?: string;
				};
				Update: {
					created_at?: string;
					email?: string;
					id?: string;
				};
				Relationships: [];
			};
			profiles: {
				Row: {
					created_at: string;
					email: string | null;
					id: string;
					role: string | null;
					updated_at: string;
					user_id: string;
				};
				Insert: {
					created_at?: string;
					email?: string | null;
					id?: string;
					role?: string | null;
					updated_at?: string;
					user_id: string;
				};
				Update: {
					created_at?: string;
					email?: string | null;
					id?: string;
					role?: string | null;
					updated_at?: string;
					user_id?: string;
				};
				Relationships: [];
			};
			women: {
				Row: {
					alt_contact_name: string | null;
					areas_of_expertise: string[];
					company_name: string | null;
					consent: boolean;
					contact_number: string | null;
					created_at: string;
					email: string;
					id: string;
					interested_in: string[];
					job_title: string;
					keywords: string[] | null;
					languages: string[];
					long_bio: string | null;
					memberships: string[] | null;
					name: string;
					nationality: string;
					profile_picture_url: string | null;
					short_bio: string;
					social_media_links: Json | null;
					status: string | null;
					user_id: string | null;
				};
				Insert: {
					alt_contact_name?: string | null;
					areas_of_expertise: string[];
					company_name?: string | null;
					consent: boolean;
					contact_number?: string | null;
					created_at?: string;
					email: string;
					id?: string;
					interested_in: string[];
					job_title: string;
					keywords?: string[] | null;
					languages: string[];
					long_bio?: string | null;
					memberships?: string[] | null;
					name: string;
					nationality: string;
					profile_picture_url?: string | null;
					short_bio: string;
					social_media_links?: Json | null;
					status?: string | null;
					user_id?: string | null;
				};
				Update: {
					alt_contact_name?: string | null;
					areas_of_expertise?: string[];
					company_name?: string | null;
					consent?: boolean;
					contact_number?: string | null;
					created_at?: string;
					email?: string;
					id?: string;
					interested_in?: string[];
					job_title?: string;
					keywords?: string[] | null;
					languages?: string[];
					long_bio?: string | null;
					memberships?: string[] | null;
					name?: string;
					nationality?: string;
					profile_picture_url?: string | null;
					short_bio?: string;
					social_media_links?: Json | null;
					status?: string | null;
					user_id?: string | null;
				};
				Relationships: [];
			};
			endorsements: {
				Row: {
					id: string;
					user_id: string;
					woman_id: string;
					area_of_expertise: string;
					created_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					woman_id: string;
					area_of_expertise: string;
					created_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					woman_id?: string;
					area_of_expertise?: string;
					created_at?: string;
				};
				Relationships: [];
			};
		};
		Views: {
			women_public: {
				Row: {
					areas_of_expertise: string[] | null;
					company_name: string | null;
					created_at: string | null;
					id: string | null;
					interested_in: string[] | null;
					job_title: string | null;
					keywords: string[] | null;
					languages: string[] | null;
					long_bio: string | null;
					memberships: string[] | null;
					name: string | null;
					nationality: string | null;
					profile_picture_url: string | null;
					short_bio: string | null;
					social_media_links: Json | null;
					status: string | null;
				};
				Insert: {
					areas_of_expertise?: string[] | null;
					company_name?: string | null;
					created_at?: string | null;
					id?: string | null;
					interested_in?: string[] | null;
					job_title?: string | null;
					keywords?: string[] | null;
					languages?: string[] | null;
					long_bio?: string | null;
					memberships?: string[] | null;
					name?: string | null;
					nationality?: string | null;
					profile_picture_url?: string | null;
					short_bio?: string | null;
					social_media_links?: Json | null;
					status?: string | null;
				};
				Update: {
					areas_of_expertise?: string[] | null;
					company_name?: string | null;
					created_at?: string | null;
					id?: string | null;
					interested_in?: string[] | null;
					job_title?: string | null;
					keywords?: string[] | null;
					languages?: string[] | null;
					long_bio?: string | null;
					memberships?: string[] | null;
					name?: string | null;
					nationality?: string | null;
					profile_picture_url?: string | null;
					short_bio?: string | null;
					social_media_links?: Json | null;
					status?: string | null;
				};
				Relationships: [];
			};
		};
		Functions: {
			is_admin: { Args: { _user_id: string }; Returns: boolean };
		};
		Enums: {
			[_ in never]: never;
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
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
				DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
		: never = never
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
			DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
			Row: infer R;
	  }
		? R
		: never
	: DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
			DefaultSchema["Views"])
	? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
			Row: infer R;
	  }
		? R
		: never
	: never;

export type TablesInsert<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never
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
		| keyof DefaultSchema["Tables"]
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never
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
		| keyof DefaultSchema["Enums"]
		| { schema: keyof DatabaseWithoutInternals },
	EnumName extends DefaultSchemaEnumNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
		: never = never
> = DefaultSchemaEnumNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
	: DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
	? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
	: never;

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof DefaultSchema["CompositeTypes"]
		| { schema: keyof DatabaseWithoutInternals },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
		: never = never
> = PublicCompositeTypeNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
	? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
	: never;

export const Constants = {
	public: {
		Enums: {},
	},
} as const;
