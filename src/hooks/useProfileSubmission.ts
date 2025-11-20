/**
 * PROFILE SUBMISSION HOOK
 *
 * Manages the complete profile submission flow for new talent profiles.
 * Handles form state, validation, file uploads, and database insertion.
 *
 * Features:
 * - Form state management (name, email, bio, etc.)
 * - Multi-select arrays (languages, expertise, memberships, keywords)
 * - Profile picture upload to Supabase Storage
 * - Input sanitization to prevent XSS attacks
 * - Zod schema validation
 * - Rate limiting (3 submissions per 5 minutes)
 * - Only authenticated users can submit (sign-in required)
 * - Prevents multiple profile submissions per user
 * - Checks for existing profiles (approved or pending) before allowing submission
 *
 * Authentication Handling:
 * - User must be authenticated to submit a profile
 * - Sets user_id to authenticated user's ID (allows editing later)
 * - Prevents duplicate submissions by checking for existing profiles
 *
 * Usage:
 * - Used in ProfileSubmissionModal component
 * - Provides all form state and submission logic
 * - Returns form data, setters, loading state, and errors
 */

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { profileSubmissionSchema, sanitizeInput, checkRateLimit } from "@/lib/validation";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";

interface ProfileFormData {
	name: string;
	email: string;
	jobTitle: string;
	companyName: string;
	shortBio: string;
	longBio: string;
	nationality: string;
	contactNumber: string;
	altContactName: string;
	interestedIn: string[];
	profilePictureUrl: string;
	consent: boolean;
}

export function useProfileSubmission() {
	const { user } = useAuth(); // Get authenticated user (can be null for anonymous submissions)
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});

	// Form state (same structure as profile edit form)
	// Note: The values that remain empty (i.e. ""), will be converted to null for the database
	const [formData, setFormData] = useState<ProfileFormData>({
		name: "",
		email: "",
		jobTitle: "",
		companyName: "",
		shortBio: "",
		longBio: "",
		nationality: "",
		contactNumber: "",
		altContactName: "",
		interestedIn: [],
		profilePictureUrl: "",
		consent: false,
	});

	// Multi-select array states for languages, expertise areas, memberships, and keywords
	const [languages, setLanguages] = useState<string[]>([]);
	const [areasOfExpertise, setAreasOfExpertise] = useState<string[]>([]);
	const [memberships, setMemberships] = useState<string[]>([]);
	const [keywords, setKeywords] = useState<string[]>([]);

	/**
	 * Handle profile submission
	 *
	 * Processes the form submission by:
	 * 1. Checking rate limits (prevents spam)
	 * 2. Uploading profile picture to Supabase Storage (if provided)
	 * 3. Sanitizing all text inputs (prevents XSS)
	 * 4. Validating data with Zod schema
	 * 5. Inserting profile into database with appropriate user_id
	 *
	 * @param e - Form submit event
	 * @param profilePicture - Optional profile picture file to upload
	 * @returns true if submission successful, false otherwise
	 */
	const handleSubmit = async (e: React.FormEvent, profilePicture?: File | null) => {
		e.preventDefault();
		setErrors({});

		/**
		 * STEP 0: Check if user already has a profile (approved or pending)
		 * This is a safeguard check - UI should prevent this, but double-check here
		 * Users can only have ONE profile - either approved or pending
		 */
		if (!user) {
			toast.error("Please sign in to submit a profile.");
			return;
		}

		const { data: existingProfile, error: checkError } = await supabase
			.from("women")
			.select("id, status")
			.eq("user_id", user.id)
			.maybeSingle();

		if (checkError) {
			console.error("[useProfileSubmission] ❌ Error checking existing profile:", checkError);
			toast.error("Error checking profile status. Please try again.");
			return;
		}

		if (existingProfile) {
			if (existingProfile.status === "PENDING_APPROVAL") {
				toast.error(
					"You already have a profile submission pending review. Please wait for admin approval before submitting another profile."
				);
				return;
			} else if (existingProfile.status === "APPROVED") {
				toast.error(
					"You already have an approved profile. Please use 'Edit My Profile' to update your existing profile."
				);
				return;
			}
			// If status is NOT_APPROVED, allow resubmission (don't block)
		}

		// Rate limiting check
		const clientId = `${window.location.hostname}-${Date.now()}`;
		if (!checkRateLimit(clientId, 3, 300000)) {
			// 3 requests per 5 minutes
			toast.error("Rate limit exceeded. Please wait before submitting another profile.");
			return;
		}

		setLoading(true);
		try {
			let profilePictureUrl = "";

			/**
			 * STEP 1: Upload profile picture to Supabase Storage (if provided)
			 *
			 * Uploads image file to "profiles" storage bucket and gets public URL.
			 * The URL is then stored in the database for display.
			 */
			if (profilePicture) {
				const fileExt = profilePicture.name.split(".").pop();
				const fileName = `${Math.random()}.${fileExt}`;
				const filePath = `${fileName}`;

				const { error: uploadError } = await supabase.storage
					.from("profiles")
					.upload(filePath, profilePicture);

				if (uploadError) {
					throw new Error(`Failed to upload image: ${uploadError.message}`);
				}

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
			 */
			const submissionData = {
				name: sanitizeInput(formData.name),
				email: sanitizeInput(formData.email),
				job_title: sanitizeInput(formData.jobTitle),
				company_name: sanitizeInput(formData.companyName),
				nationality: sanitizeInput(formData.nationality),
				contact_number: sanitizeInput(formData.contactNumber),
				alt_contact_name: sanitizeInput(formData.altContactName),
				short_bio: sanitizeInput(formData.shortBio),
				long_bio: sanitizeInput(formData.longBio),
				areas_of_expertise: areasOfExpertise.map((item) => sanitizeInput(item)),
				languages: languages.map((item) => sanitizeInput(item)),
				keywords: keywords
					.filter((item) => item.trim() !== "")
					.map((item) => sanitizeInput(item)),
				memberships: memberships
					.filter((item) => item.trim() !== "")
					.map((item) => sanitizeInput(item)),
				interested_in: formData.interestedIn,
				consent: formData.consent,
			};

			/**
			 * STEP 3: Validate data using Zod schema
			 *
			 * Ensures all required fields are present and valid.
			 * Throws ZodError if validation fails (caught in catch block).
			 */
			const validatedData = profileSubmissionSchema.parse(submissionData);

			/**
			 * STEP 4: Set user_id to authenticated user's ID
			 *
			 * Only authenticated users can submit profiles (checked in STEP 0).
			 * This allows them to edit their profile later.
			 */
			const userId = user!.id; // user is guaranteed to exist at this point

			/**
			 * STEP 5: Insert profile into database
			 *
			 * Creates new profile with status "PENDING_APPROVAL".
			 * Admin must approve before profile appears in search results.
			 *
			 * Note: We convert undefined to null for optional fields to match the database schema.
			 */
			const { error } = await supabase.from("women").insert({
				user_id: userId, // Authenticated user's ID (required)
				name: validatedData.name,
				email: validatedData.email,
				job_title: validatedData.job_title,
				company_name: validatedData.company_name ?? null,
				short_bio: validatedData.short_bio,
				long_bio: validatedData.long_bio ?? null,
				nationality: validatedData.nationality,
				contact_number: validatedData.contact_number ?? null,
				alt_contact_name: validatedData.alt_contact_name ?? null,
				interested_in: validatedData.interested_in,
				profile_picture_url: profilePictureUrl || null,
				languages: validatedData.languages,
				areas_of_expertise: validatedData.areas_of_expertise,
				memberships: validatedData.memberships,
				keywords: validatedData.keywords,
				consent: validatedData.consent,
				status: "PENDING_APPROVAL",
			});

			if (error) throw error;

			// Success - profile submitted and awaiting admin approval
			return true;
		} catch (error) {
			/**
			 * Error handling:
			 * - ZodError: Validation failed - show field-specific errors
			 * - Other errors: Database/network errors - show generic error message
			 */
			if (error instanceof z.ZodError) {
				const fieldErrors: Record<string, string> = {};
				error.errors.forEach((err) => {
					if (err.path.length > 0) {
						fieldErrors[err.path[0] as string] = err.message;
					}
				});
				setErrors(fieldErrors);
				toast.error("Validation Error: Please check the form for errors.");
			} else {
				console.error("Error submitting profile:", error);
				toast.error("Error submitting profile. Please try again later.");
			}
			return false; // Failure
		} finally {
			setLoading(false);
		}
	};

	/**
	 * Reset form to initial empty state
	 *
	 * Clears all form fields, arrays, and errors.
	 * Called after successful submission or when modal closes.
	 */
	const resetForm = () => {
		setFormData({
			name: "",
			email: "",
			jobTitle: "",
			companyName: "",
			shortBio: "",
			longBio: "",
			nationality: "",
			contactNumber: "",
			altContactName: "",
			interestedIn: [],
			profilePictureUrl: "",
			consent: false,
		});
		setLanguages([]);
		setAreasOfExpertise([]);
		setMemberships([]);
		setKeywords([]);
		setErrors({});
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
		keywords,
		setKeywords,
		loading,
		errors,
		handleSubmit,
		resetForm,
	};
}
