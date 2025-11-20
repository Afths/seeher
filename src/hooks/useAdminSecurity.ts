/**
 * ADMIN SECURITY HOOK
 *
 * Provides security features specifically for admin users:
 * - Session timeout: Automatically signs out admins after 30 minutes of inactivity
 * - Activity tracking: Monitors user activity (mouse, keyboard, scroll, touch) to reset timeout
 * - Action logging: Logs admin actions for security auditing
 *
 * Security Features:
 * - Only activates when user is authenticated AND has admin privileges
 * - Automatically cleans up event listeners on unmount
 * - Logs actions to console (in production, this would go to a secure logging service)
 *
 * Usage:
 * - Used in AdminDashboard component to enforce security policies
 * - Automatically handles session management without manual intervention
 */

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/sonner";

export function useAdminSecurity() {
	const { user, signOut } = useAuth();

	/**
	 * Admin session timeout and activity monitoring
	 *
	 * Sets up a 30-minute inactivity timeout that automatically signs out admins.
	 * Monitors user activity (mouse clicks, keyboard input, scrolling, touch) to reset the timer.
	 *
	 * Security Rationale:
	 * - Admin accounts have elevated privileges (can approve/reject profiles)
	 * - Prevents unauthorized access if admin leaves computer unattended
	 * - Balances security with usability (30 minutes is reasonable for active use)
	 *
	 * NOTE: This hook is only used in AdminDashboard, which is protected by AdminProtectedRoute.
	 * Therefore, we can assume user is authenticated and is an admin when this hook runs.
	 */
	useEffect(() => {
		// Admin session timeout - 30 minutes of inactivity
		const ADMIN_SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
		let timeoutId: NodeJS.Timeout;

		/**
		 * Reset the inactivity timeout timer
		 * Clears existing timeout and starts a new one
		 */
		const resetTimeout = () => {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => {
				// Session expired - sign out admin for security
				toast.error("Your admin session has expired for security.");
				signOut();
			}, ADMIN_SESSION_TIMEOUT);
		};

		// List of events that indicate user activity
		// These events reset the inactivity timer
		const activityEvents = ["mousedown", "keydown", "scroll", "touchstart"];

		/**
		 * Handle user activity - reset timeout when user interacts with page
		 */
		const handleActivity = () => {
			resetTimeout();
		};

		// Attach event listeners to monitor user activity
		// Using capture phase (true) to catch events early
		activityEvents.forEach((event) => {
			document.addEventListener(event, handleActivity, true);
		});

		// Start the initial timeout timer
		resetTimeout();

		// Cleanup: Remove event listeners and clear timeout when component unmounts
		// Prevents memory leaks and ensures security features are properly disabled
		// NOTE: If user signs out or loses admin status, AdminProtectedRoute will unmount
		// the component, triggering this cleanup automatically
		return () => {
			clearTimeout(timeoutId);
			activityEvents.forEach((event) => {
				document.removeEventListener(event, handleActivity, true);
			});
		};
	}, [signOut]); // Only signOut in dependencies - user/isAdmin changes cause component unmount

	/**
	 * Log admin actions for security auditing
	 *
	 * Records all admin actions (approve, reject, etc.) with:
	 * - Action type (e.g., "approve_profile", "reject_profile")
	 * - User ID of the admin performing the action
	 * - Timestamp of the action
	 * - Additional details (optional)
	 *
	 * Security Note:
	 * - Currently logs to console (for development)
	 * - In production, this should send logs to a secure logging service
	 * - Helps track who did what and when for security audits
	 *
	 * @param action - Description of the admin action (e.g., "approve_profile")
	 * @param details - Optional additional details about the action
	 */
	const logAdminAction = (action: string, details?: Record<string, any>) => {
		// TODO: In production, send this to a secure logging service (e.g., Sentry, LogRocket, etc.)
		console.log(`Admin Action: ${action}`, {
			userId: user.id,
			timestamp: new Date().toISOString(),
			...details,
		});
	};

	return { logAdminAction };
}
