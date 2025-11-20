/**
 * AI EXPERTISE SUGGESTION HOOK
 *
 * Provides functionality to generate AI-powered expertise suggestions for profiles.
 * Calls a Supabase Edge Function that uses AI to analyze profile data and suggest
 * relevant areas of expertise that might be missing from profiles.
 *
 * Features:
 * - Invokes Supabase Edge Function "suggest-expertise"
 * - Updates multiple profiles with AI-suggested expertise areas
 * - Shows success/error toast notifications
 * - Manages loading state during AI processing
 *
 * Usage:
 * - Used in AdminDashboard for bulk updating profiles with AI suggestions
 * - Helps ensure profiles have comprehensive and accurate expertise tags
 *
 * Note:
 * - This is an admin-only feature
 * - The Edge Function processes profiles server-side for security and performance
 */

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

export function useSuggestExpertise() {
	// Loading state - true while AI is processing profiles
	const [isLoading, setIsLoading] = useState<boolean>(false);

	/**
	 * Generate AI-powered expertise suggestions for profiles
	 * 
	 * Calls the Supabase Edge Function "suggest-expertise" which:
	 * - Analyzes profile data (bio, job title, keywords, etc.)
	 * - Uses AI to suggest relevant areas of expertise
	 * - Updates profiles with suggested expertise areas
	 * 
	 * @returns Promise with data containing updatedCount (number of profiles updated)
	 * @throws Error if the Edge Function call fails
	 */
	const suggestExpertise = async () => {
		setIsLoading(true);

		try {
			// Invoke Supabase Edge Function for AI expertise suggestions
			// The Edge Function runs server-side and processes profiles securely
			const { data, error } = await supabase.functions.invoke("suggest-expertise");

			if (error) {
				throw error;
			}

			// Show success message with count of updated profiles
			toast.success(
				`${data.updatedCount} profiles updated with AI-suggested areas of expertise`
			);

			return data;
		} catch (error) {
			console.error("[useSuggestExpertise] ❌ Error suggesting expertise:", error);
			toast.error("Failed to generate expertise suggestions. Please try again.");
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	return {
		suggestExpertise,
		isLoading,
	};
}
