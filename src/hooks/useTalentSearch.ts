/**
 * This hook manages the talent search functionality.
 * It handles:
 * - Fetching profiles from the database
 * - Filtering by interest type (speaker, panelist, board member)
 * - Text search across multiple fields (name, bio, expertise)
 * - Filtering by languages, areas of expertise, and memberships
 * - Loading filter options dynamically from the database
 * - Sorting results by profile completeness
 *
 * The hook automatically performs searches when filters change, providing real-time search results as users adjust their criteria.
 *
 * Returns search results, loading state, filters, and filter options
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WomanPublic } from "@/types/database";
import { searchFiltersSchema, sanitizeInput } from "@/lib/validation";
import { useAuth } from "@/contexts/AuthContext";
import { LANGUAGES, MEMBERSHIPS } from "@/lib/constants";

/**
 * Defines all the filter criteria users can apply to their search
 */
interface SearchFilters {
	interestedIn: string; // "all", "Speaker", "Panelist", "Board Member"
	searchTerm: string; // Search query
	languages: string[]; // Selected languages
	areasOfExpertise: string[]; // Selected expertise areas
	memberships: string[]; // Selected memberships
}

export function useTalentSearch() {
	const { user } = useAuth();

	// Search results - array of matching profiles
	const [results, setResults] = useState<WomanPublic[]>([]);

	// Loading state - true while performing search
	const [loading, setLoading] = useState<boolean>(false);

	// Available filter options (populated from the database)
	const [allLanguages, setAllLanguages] = useState<string[]>([]);
	const [allAreasOfExpertise, setAllAreasOfExpertise] = useState<string[]>([]);
	const [allMemberships, setAllMemberships] = useState<string[]>([]);

	// Current filter state
	const [filters, setFilters] = useState<SearchFilters>({
		interestedIn: "all", // Default: show all profiles
		searchTerm: "", // Default: no text search
		languages: [], // Default: no language filter
		areasOfExpertise: [], // Default: no expertise filter
		memberships: [], // Default: no membership filter
	});

	/**
	 * Load filter options
	 *
	 * Languages and memberships use predefined lists.
	 * Areas of expertise are fetched from approved profiles in the database.
	 */
	useEffect(() => {
		// Set predefined lists for languages and memberships
		setAllLanguages([...LANGUAGES]);
		setAllMemberships([...MEMBERSHIPS]);

		// Fetch areas of expertise from database
		const loadExpertiseOptions = async () => {
			const { data, error } = await supabase
				.from("women")
				.select("areas_of_expertise")
				.eq("status", "APPROVED");

			if (error) {
				console.error("[useTalentSearch] ❌ Error fetching expertise options:", error);
				return;
			}

			const areas = new Set<string>();
			data.forEach((item) => {
				item.areas_of_expertise?.forEach((area) => areas.add(area));
			});

			setAllAreasOfExpertise(Array.from(areas).sort());
		};

		loadExpertiseOptions();
	}, []);

	/**
	 * Perform search based on current filters
	 *
	 * This function:
	 * 1. Validates filters using Zod schema
	 * 2. Queries the database for approved profiles
	 * 3. Applies text search across multiple fields
	 * 4. Applies array filters (languages, expertise, memberships)
	 * 5. Sorts results by profile completeness
	 * 6. Updates the results state
	 */
	const performSearch = async () => {
		setLoading(true);

		try {
			// Validate search filters to prevent injection attacks and ensure data integrity
			const validationResult = searchFiltersSchema.safeParse(filters);

			if (!validationResult.success) {
				// If validation fails, log the errors and use empty filters as fallback
				console.warn(
					"[useTalentSearch] ⚠️ Search filter validation failed:",
					validationResult.error.errors
				);
				// Continue with search using empty filters rather than failing completely
				// This prevents the search from breaking if filter state gets corrupted
			}

			// Use validated data if available, otherwise use original filters (they'll be sanitized later)
			const validatedFilters = validationResult.success ? validationResult.data : filters;

			// Query the women table for approved profiles
			// We exclude sensitive fields (email, contact_number)
			let query = supabase
				.from("women")
				.select(
					"id, name, job_title, company_name, bio, profile_picture, areas_of_expertise, languages, memberships, interested_in, created_at, social_media, status, user_id"
				)
				.eq("status", "APPROVED");

			// If user is signed in, filter out their own profile
			// Note: We use .or() to handle NULL user_id values correctly
			// .neq() excludes NULL values, so we need to explicitly include them
			// This handles edge cases where profiles might not have user_id set yet
			if (user) {
				// Filter: (user_id IS NULL) OR (user_id != current_user_id)
				// This ensures profiles with NULL user_id are still included
				query = query.or(`user_id.is.null,user_id.neq.${user.id}`);
			}

			// Filter by interest type (Speaker, Panelist, Board Member)
			// interested_in is stored as an array, so we check if the filter value is contained in it
			if (validatedFilters.interestedIn && validatedFilters.interestedIn !== "all") {
				query = query.contains("interested_in", [validatedFilters.interestedIn]);
			}

			// Filter by languages
			// Profile must have at least one of the selected languages (OR logic)
			if (validatedFilters.languages.length > 0) {
				// Use .overlaps() to check if arrays have any common elements
				query = query.overlaps("languages", validatedFilters.languages);
			}

			// Filter by areas of expertise
			if (validatedFilters.areasOfExpertise.length > 0) {
				query = query.overlaps("areas_of_expertise", validatedFilters.areasOfExpertise);
			}

			// Filter by memberships
			if (validatedFilters.memberships.length > 0) {
				query = query.overlaps("memberships", validatedFilters.memberships);
			}

			// Execute the database query with all filters applied
			const { data, error } = await query;

			if (error) {
				console.error("[useTalentSearch] ❌ Error filtering:", error);
				throw error;
			}

			console.log(`[useTalentSearch] ✅ Successfully filtered ${data?.length || 0} results`);

			// Type assertion needed because Supabase types don't perfectly match our select fields
			let filteredResults = (data || []) as WomanPublic[];

			/**
			 * TEXT SEARCH
			 * Search across multiple fields: bio, job title, name, company, expertise, memberships
			 * Uses case-insensitive matching
			 */
			if (validatedFilters.searchTerm?.trim()) {
				const searchTerm = sanitizeInput(validatedFilters.searchTerm.toLowerCase());
				filteredResults = filteredResults.filter((item) => {
					// Search in text fields
					const matchesText =
						item.bio?.toLowerCase().includes(searchTerm) ||
						item.job_title?.toLowerCase().includes(searchTerm) ||
						item.name?.toLowerCase().includes(searchTerm) ||
						item.company_name?.toLowerCase().includes(searchTerm);

					// Search in areas of expertise array
					const matchesAreas =
						item.areas_of_expertise?.some((area) =>
							area.toLowerCase().includes(searchTerm)
						) || false;

					// Search in memberships array
					const matchesMemberships =
						item.memberships?.some((membership) =>
							membership.toLowerCase().includes(searchTerm)
						) || false;

					// Return true if search term matches any field
					return matchesText || matchesAreas || matchesMemberships;
				});
			}

			/**
			 * SORT BY COMPLETENESS
			 * Profiles with more filled fields appear first
			 * This helps users see the most complete and useful profiles
			 */
			const sortByCompleteness = (profiles: WomanPublic[]) => {
				return profiles.sort((a, b) => {
					// Calculate completeness score for a profile
					const getCompleteness = (profile: WomanPublic) => {
						// List of important fields to check
						const fields = [
							"name",
							"job_title",
							"company_name",
							"bio",
							"profile_picture",
							"areas_of_expertise",
							"languages",
							"memberships",
						];

						let score = 0;
						fields.forEach((field) => {
							const value = profile[field];
							if (value !== null && value !== undefined) {
								if (Array.isArray(value)) {
									// Array fields: count as complete if array has items
									score += value.length > 0 ? 1 : 0;
								} else if (typeof value === "string") {
									// String fields: count as complete if not empty
									score += value.trim().length > 0 ? 1 : 0;
								} else {
									// Other types: count as complete if not null/undefined
									score += 1;
								}
							}
						});
						return score;
					};

					// Sort descending: most complete profiles first
					return getCompleteness(b) - getCompleteness(a);
				});
			};

			const sortedResults = sortByCompleteness(filteredResults);
			setResults(sortedResults);
		} catch (error) {
			console.error("[useTalentSearch] ❌ Error performing search:", error);
			setResults([]);
		} finally {
			setLoading(false);
		}
	};

	/**
	 * Auto-search when filters change or user changes
	 * This effect triggers an initial search (with default filters) and a new search whenever any filter is updated.
	 * Also re-runs when user changes (login/logout) to update the exclusion of own profile
	 */
	useEffect(() => {
		performSearch();
	}, [filters, user?.id]);

	return {
		results, // Array of matching profiles
		loading, // Loading state for search
		filters, // Current filter state
		setFilters, // Function to update filters
		allLanguages, // Available languages for filter dropdown
		allAreasOfExpertise, // Available expertise areas for filter dropdown
		allMemberships, // Available memberships for filter dropdown
	};
}
