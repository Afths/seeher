/**
 * DATABASE TYPES
 *
 * Types related to database tables and data structures.
 * These types are derived from Supabase database schema.
 */

import { Tables } from "@/integrations/supabase/types";

/**
 * Full woman profile type - includes all fields including sensitive ones like email
 */
export type Woman = Tables<"women">;

/**
 * Public-facing profile type (excludes sensitive fields like email)
 * Used for search results displayed to all users
 */
export type WomanPublic = Pick<
	Woman,
	| "id"
	| "name"
	| "job_title"
	| "company_name"
	| "nationality"
	| "short_bio"
	| "long_bio"
	| "profile_picture_url"
	| "areas_of_expertise"
	| "languages"
	| "keywords"
	| "memberships"
	| "interested_in"
	| "created_at"
	| "social_media_links"
> & {
	status: string | null;
};

/**
 * Profile submission type for admin dashboard
 * Used when reviewing pending or rejected submissions
 */
export type SubmissionType = Tables<"women">;

/**
 * Profile status values
 * Represents the possible statuses a profile can have in the database
 */
export type ProfileStatus = "PENDING_APPROVAL" | "APPROVED" | "NOT_APPROVED" | null;
