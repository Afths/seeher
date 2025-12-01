/**
 * Hook that manages endorsement functionality for areas of expertise on profiles.
 * Allows users to endorse specific areas of expertise and view endorsement counts.
 *
 * Features:
 * - Fetch all endorsements for a profile
 * - Get endorsement count for a specific area of expertise
 * - Check if current user has endorsed an area of expertise
 * - Toggle endorsement (add/remove)
 * - Optimistic updates for better UX
 * - Error handling and loading states
 *
 * Security:
 * - Users cannot endorse their own profiles (checked in component)
 * - Users can delete their own endorsements
 */

import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Endorsement } from "@/types/database";

interface EndorsementCounts {
	[area: string]: number;
}

interface UserEndorsements {
	[area: string]: boolean;
}

// Note: User here is optional because a profile can be viewed without being signed in (i.e. userId is falsy)
export function useEndorsements(womanId: string, userId?: string) {
	const [loading, setLoading] = useState<boolean>(false);
	const [endorsements, setEndorsements] = useState<Endorsement[]>([]);
	const [endorsementCounts, setEndorsementCounts] = useState<EndorsementCounts>({});
	const [userEndorsements, setUserEndorsements] = useState<UserEndorsements>({});

	/**
	 * Fetch all endorsements for the profile
	 * Populates both counts and user endorsement state
	 */
	const fetchEndorsements = useCallback(async () => {
		setLoading(true);

		try {
			const { data, error } = await supabase
				.from("endorsements")
				.select("*")
				.eq("woman_id", womanId);

			if (error) {
				console.error("[useEndorsements] ❌ Error fetching endorsements:", error);
				throw error;
			}

			const endorsementsData = data || [];

			console.log("[useEndorsements] ✅ Endorsements fetched:", endorsementsData);
			setEndorsements(endorsementsData);

			// Calculate counts per area
			const countsMap: EndorsementCounts = {};
			endorsementsData.forEach((endorsement) => {
				const area = endorsement.area_of_expertise;
				countsMap[area] = (countsMap[area] || 0) + 1;
			});

			console.log("[useEndorsements] ✅ Endorsement counts calculated:", countsMap);
			setEndorsementCounts(countsMap);

			// Check which areas current user has endorsed for the current woman
			if (userId) {
				const userEndorsementsMap: UserEndorsements = {};
				endorsementsData.forEach((endorsement) => {
					if (endorsement.user_id === userId) {
						userEndorsementsMap[endorsement.area_of_expertise] = true;
					}
				});
				setUserEndorsements(userEndorsementsMap);
			} else {
				setUserEndorsements({});
			}
		} catch (error) {
			console.error("[useEndorsements] ❌ Error fetching endorsements:", error);
			toast.error("Failed to load endorsements. Please try again.");
		} finally {
			setLoading(false);
		}
	}, [womanId, userId]);

	// Auto-fetch endorsements when woman profile changes
	useEffect(() => {
		fetchEndorsements();
	}, [womanId, fetchEndorsements]);

	/**
	 * Get endorsement count for a specific area of expertise
	 */
	const getEndorsementCount = useCallback(
		(area: string): number => {
			return endorsementCounts[area] || 0;
		},
		[endorsementCounts]
	);

	/**
	 * Check if current user has endorsed a specific area of expertise
	 */
	const isEndorsedByUser = useCallback(
		(area: string): boolean => {
			return userEndorsements[area] || false;
		},
		[userEndorsements]
	);

	/**
	 * Toggle endorsement for a specific area of expertise
	 * Adds endorsement if not exists, removes if exists
	 * Uses optimistic updates for better UX
	 */
	const toggleEndorsement = useCallback(
		async (area: string) => {
			const isEndorsed = isEndorsedByUser(area);
			const currentCount = getEndorsementCount(area);

			// Optimistic update - this immediately updates the UI state without waiting for the database to update
			// If the database request succeeds, the local state will stay updated
			// If the database request fails, the local state will be rolled back to the previous value
			// This is a good UX compromise between performance and UX
			const newCount = isEndorsed ? currentCount - 1 : currentCount + 1;
			setEndorsementCounts((prev) => ({ ...prev, [area]: Math.max(0, newCount) }));
			setUserEndorsements((prev) => ({ ...prev, [area]: !isEndorsed }));

			try {
				// If 'isEndorsed' is true, it means that the user has already endorsed the area of expertise, so we need to remove the endorsement
				if (isEndorsed) {
					// Remove endorsement
					const { error } = await supabase
						.from("endorsements")
						.delete()
						.eq("woman_id", womanId)
						.eq("area_of_expertise", area)
						.eq("user_id", userId);

					if (error) {
						console.error("[useEndorsements] ❌ Error removing endorsement:", error);
						throw error;
					}

					console.log("[useEndorsements] ✅ Endorsement removed successfully");

					// Remove from local state
					setEndorsements((prev) =>
						prev.filter(
							(e) =>
								!(
									e.woman_id === womanId &&
									e.area_of_expertise === area &&
									e.user_id === userId
								)
						)
					);
					// If 'isEndorsed' is false, it means that the user has not endorsed the area of expertise, so we need to add the endorsement
				} else {
					// Add endorsement
					const { data, error } = await supabase
						.from("endorsements")
						.insert({
							woman_id: womanId,
							area_of_expertise: area,
							user_id: userId,
						})
						.select()
						.single();

					if (error) {
						console.error("[useEndorsements] ❌ Error adding endorsement:", error);
						throw error;
					}

					console.log("[useEndorsements] ✅ Endorsement added successfully");

					// Add to local state with real data from database
					if (data) {
						setEndorsements((prev) => [...prev, data]);
					}
				}
			} catch (error: any) {
				// If the database endorsment update fails, roll back the optimistic update
				setEndorsementCounts((prev) => ({ ...prev, [area]: currentCount }));
				setUserEndorsements((prev) => ({ ...prev, [area]: isEndorsed }));

				console.error("[useEndorsements] ❌ Error toggling endorsement:", error);

				// Handle unique constraint violation (user already endorsed)
				if (error?.code === "23505") {
					toast.error("You have already endorsed this area.");
				} else {
					toast.error("Failed to update endorsement. Please try again.");
				}
			}
		},
		[womanId, userId, isEndorsedByUser, getEndorsementCount]
	);

	return {
		loading,
		endorsements,
		endorsementCounts,
		userEndorsements,
		fetchEndorsements,
		getEndorsementCount,
		isEndorsedByUser,
		toggleEndorsement,
	};
}
