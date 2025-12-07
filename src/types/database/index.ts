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
	| "bio"
	| "profile_picture"
	| "social_media"
	| "areas_of_expertise"
	| "languages"
	| "memberships"
	| "interested_in"
	| "created_at"
	| "status"
>;

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

/**
 * Endorsement type
 * Represents an endorsement of a specific area of expertise for a profile
 */
export type Endorsement = Tables<"endorsements">;
