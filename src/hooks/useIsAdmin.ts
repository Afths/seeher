/**
 * ADMIN STATUS CHECK HOOK
 *
 * Determines if the currently authenticated user has admin privileges.
 * Checks the user's role in the database by calling a Supabase RPC function.
 *
 * Features:
 * - Automatically checks admin status when user changes
 * - Returns loading state while checking
 * - Returns false if user is not authenticated
 * - Uses database function `is_admin()` for secure role checking
 *
 * Security:
 * - Uses Supabase RLS (Row Level Security) policies
 * - Database function checks `profiles.role = 'admin'`
 * - Prevents client-side role manipulation
 *
 * Usage:
 * - Used in AdminDashboard to protect admin routes
 * - Used in Index page to show/hide admin dashboard button
 * - Used in useAdminSecurity to enable security features
 *
 * Returns:
 * - isAdmin: boolean - true if user has admin role, false otherwise
 * - loading: boolean - true while checking admin status
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useIsAdmin() {
	const { user } = useAuth(); // Current authenticated user (can be null)
	const [isAdmin, setIsAdmin] = useState<boolean>(false); // Admin status result
	const [loading, setLoading] = useState<boolean>(true); // Loading state while checking

	/**
	 * Check admin status whenever user changes
	 *
	 * Calls Supabase RPC function `is_admin()` which:
	 * - Checks if user exists in profiles table
	 * - Verifies if user's role is 'admin'
	 * - Returns boolean result securely from database
	 *
	 * Security Note:
	 * - Database function prevents client-side role manipulation
	 * - Uses RLS policies to ensure secure access
	 */
	useEffect(() => {
		async function checkAdminStatus() {
			// If no user is authenticated, they cannot be admin
			if (!user) {
				setIsAdmin(false);
				setLoading(false);
				return;
			}

			try {
				// Call Supabase RPC function to check admin status
				// This function queries the database securely and returns true/false
				const { data, error } = await supabase.rpc("is_admin", {
					_user_id: user.id,
				});

				if (error) {
					console.error("[useIsAdmin] ❌ Error checking admin status:", error);
					// On error, default to false (fail secure)
					setIsAdmin(false);
				} else {
					// Set admin status based on database result
					setIsAdmin(data || false);
				}
			} catch (error) {
				console.error("[useIsAdmin] ❌ Error checking admin status:", error);
				// On exception, default to false (fail secure)
				setIsAdmin(false);
			} finally {
				setLoading(false);
			}
		}

		checkAdminStatus();
	}, [user]); // Re-check whenever user changes

	return { isAdmin, loading };
}
