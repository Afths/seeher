/**
 * Hook that manages the editing of a user's own profile.
 * Allows authenticated users to fetch and update their own profile data.
 *
 * Features:
 * - Fetches user's own profile (if it exists) from database (using user_id)
 * - Pre-populates form with existing profile data
 * - Updates profile with validation
 * - Handles profile picture upload/replacement
 * - Error handling and loading states
 *
 * Security:
 * - Only fetches profiles where user_id matches authenticated user
 * - Database RLS policies ensure users can only edit their own profiles
 * - Users cannot change status or created_at fields (admin-only)
 */

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { profileUpdateSchema, sanitizeInput } from "@/lib/validation";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";

interface ProfileFormData {
	name: string;
	email: string;
	jobTitle: string;
	companyName: string;
	bio: string;
	contactNumber: string;
	socialMedia: string;
	interestedIn: string[];
	profilePicture: string;
}

export function useProfileEdit() {
	const { user } = useAuth();
	const [loading, setLoading] = useState<boolean>(false);
	const [loadingProfile, setLoadingProfile] = useState<boolean>(false);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [profileId, setProfileId] = useState<string | null>(null);

	// Form state (same structure as profile submission form)
	// Note: The values that remain empty (i.e. ""), will be converted to null for the database
	const [formData, setFormData] = useState<ProfileFormData>({
		name: "",
		email: "",
		jobTitle: "",
		companyName: "",
		bio: "",
		contactNumber: "",
		socialMedia: "",
		interestedIn: [],
		profilePicture: "",
	});

	const [languages, setLanguages] = useState<string[]>([]);
	const [areasOfExpertise, setAreasOfExpertise] = useState<string[]>([]);
	const [memberships, setMemberships] = useState<string[]>([]);

	/**
	 * Fetch user's own profile from database
	 * Only fetches profiles where user_id matches the authenticated user
	 * Pre-populates form with existing data
	 */
	const fetchProfile = async () => {
		setLoadingProfile(true);

		try {
			// Fetch profile where user_id matches authenticated user
			// RLS policy ensures users can only see their own profiles
			// If multiple profiles exist (shouldn't happen, but handle gracefully), get the most recent one
			const { data, error } = await supabase
				.from("women")
				.select("*")
				.eq("user_id", user!.id)
				.in("status", ["APPROVED", "PENDING_APPROVAL"]) // Only fetch approved or pending profiles (not rejected)
				.order("created_at", { ascending: false }) // Most recent first
				.limit(1) // Only get one row
				.maybeSingle(); // Returns null if no profile found (`single()` would throw error)

			if (error) {
				console.error("[useProfileEdit] ❌ Error fetching profile:", error);
				toast.error("Failed to load profile. Please try again.");
				throw error;
			}

			if (!data) {
				toast.warning("No matching profile found. Please submit a profile first.");
				return;
			}

			// Store profile ID for updates
			setProfileId(data.id);

			// Pre-populate form with existing profile data
			// If any field is null, we set it to empty
			setFormData({
				name: data.name,
				email: data.email || "",
				jobTitle: data.job_title || "",
				companyName: data.company_name || "",
				bio: data.bio || "",
				socialMedia: data.social_media || "",
				contactNumber: data.contact_number || "",
				interestedIn: Array.isArray(data.interested_in) ? data.interested_in : [],
				profilePicture: data.profile_picture || "",
			});

			// Pre-populate array fields
			setLanguages(Array.isArray(data.languages) ? data.languages : []);
			setAreasOfExpertise(
				Array.isArray(data.areas_of_expertise) ? data.areas_of_expertise : []
			);
			setMemberships(Array.isArray(data.memberships) ? data.memberships : []);

			return true;
		} catch (error) {
			console.error("[useProfileEdit] ❌ Error fetching profile:", error);
			toast.error("Failed to load profile. Please try again.");
			return false;
		} finally {
			setLoadingProfile(false);
		}
	};

	/**
	 * Handle profile update submission - update existing profile in database
	 */
	const handleUpdate = async (
		e: React.FormEvent,
		profilePicture: File | null,
		removePicture: boolean = false
	) => {
		e.preventDefault();
		setErrors({});

		if (!profileId) {
			toast.error("Profile not loaded. Please try again.");
			return false;
		}

		setLoading(true);

		try {
			let profilePictureUrl: string | null = formData.profilePicture || null;

			/**
			 * STEP 1: Handle profile picture removal or upload
			 *
			 * If removePicture is true, set profilePictureUrl to null.
			 * If a new picture is uploaded, upload it to Supabase Storage and get the public URL.
			 * If user uploads new picture, it replaces the old one.
			 * The URL is then stored in the database for display.
			 */
			if (removePicture) {
				// User wants to remove the picture
				profilePictureUrl = null;
			} else if (profilePicture) {
				// User wants to upload a new picture
				const fileExt = profilePicture.name.split(".").pop();
				const fileName = `${Math.random()}.${fileExt}`;
				const filePath = `${fileName}`;

				// Upload the new profile picture to the 'profiles' storage bucket
				const { error: uploadError } = await supabase.storage
					.from("profiles")
					.upload(filePath, profilePicture);

				if (uploadError) {
					throw new Error(`Failed to upload image: ${uploadError.message}`);
				}

				// Get the public URL of the new profile picture
				const {
					data: { publicUrl },
				} = supabase.storage.from("profiles").getPublicUrl(filePath);

				profilePictureUrl = publicUrl;
			}

			/**
			 * STEP 2: Prepare and sanitize form data for validation
			 *
			 * Sanitizes all text inputs to prevent XSS attacks.
			 * Maps form data to database schema format.
			 * Note: profile_picture is not in validation schema, handled separately.
			 * Note: Email is not included - it's locked to authenticated user's email and set directly in the update.
			 * Note: We don't update status, created_at, or user_id (protected fields).
			 */
			const updateData = {
				name: sanitizeInput(formData.name),
				job_title: sanitizeInput(formData.jobTitle),
				company_name: sanitizeInput(formData.companyName),
				contact_number: sanitizeInput(formData.contactNumber),
				bio: sanitizeInput(formData.bio),
				social_media: sanitizeInput(formData.socialMedia),
				areas_of_expertise: areasOfExpertise.map((item) => sanitizeInput(item)),
				languages: languages.map((item) => sanitizeInput(item)),
				memberships: memberships
					.filter((item) => item.trim() !== "")
					.map((item) => sanitizeInput(item)),
				interested_in: formData.interestedIn,
			};

			/**
			 * STEP 3: Validate data using Zod schema
			 *
			 * Ensures all required fields are present and valid.
			 * Throws ZodError if validation fails (caught in catch block).
			 */
			const validatedData = profileUpdateSchema.parse(updateData);

			/**
			 * STEP 4: Update existing profile in database
			 *
			 * Updates profile with validated data.
			 * RLS policy ensures users can only update their own profiles.
			 * Only updates fields that users are allowed to change (not status, created_at, user_id).
			 *
			 * Note: We convert undefined to null for optional fields to match the database schema.
			 */
			const { error } = await supabase
				.from("women")
				.update({
					name: validatedData.name,
					email: user!.email!, // Always use authenticated user's email (guaranteed to exist for email/password auth) to ensure it matches their account.
					job_title: validatedData.job_title,
					company_name: validatedData.company_name ?? null,
					bio: validatedData.bio,
					contact_number: validatedData.contact_number ?? null,
					social_media: validatedData.social_media ?? null,
					interested_in: validatedData.interested_in,
					profile_picture: profilePictureUrl || null,
					languages: validatedData.languages,
					areas_of_expertise: validatedData.areas_of_expertise,
					memberships: validatedData.memberships,
				})
				.eq("id", profileId)
				.eq("user_id", user!.id);

			if (error) throw error;

			console.log("[useProfileEdit] ✅ Profile updated successfully!");
			toast.success("Profile updated successfully!");
			return true;
		} catch (error) {
			if (error instanceof z.ZodError) {
				const fieldErrors: Record<string, string> = {};
				error.errors.forEach((err) => {
					if (err.path.length > 0) {
						fieldErrors[err.path[0] as string] = err.message;
					}
				});
				setErrors(fieldErrors);
				// Log validation errors for debugging
				console.error("[useProfileEdit] ❌ Validation errors:", fieldErrors);
				console.error("[useProfileEdit] ❌ Full Zod error:", error.errors);
				toast.error("Validation Error: Please check the form for errors.");
			} else {
				console.error("[useProfileEdit] ❌ Error updating profile:", error);
				toast.error("Error updating profile. Please try again later.");
			}
			return false;
		} finally {
			setLoading(false);
		}
	};

	/**
	 * Reset form to empty state
	 * All fields reset to empty strings (form convention)
	 */
	const resetForm = () => {
		setFormData({
			name: "",
			email: "",
			jobTitle: "",
			companyName: "",
			bio: "",
			contactNumber: "",
			socialMedia: "",
			interestedIn: [],
			profilePicture: "",
		});
		setLanguages([]);
		setAreasOfExpertise([]);
		setMemberships([]);
		setErrors({});
		setProfileId(null);
	};

	return {
		formData,
		setFormData,
		languages,
		setLanguages,
		areasOfExpertise,
		setAreasOfExpertise,
		memberships,
		setMemberships,
		loading,
		loadingProfile,
		errors,
		profileId,
		fetchProfile,
		handleUpdate,
		resetForm,
	};
}
