/**
 * AUTHENTICATION CONTEXT
 *
 * This context provides authentication state management throughout the application.
 * It uses Supabase for authentication and manages:
 * - User session state
 * - User information
 * - Loading states during auth checks
 * - Sign out functionality
 *
 * The context listens to Supabase auth state changes and automatically updates when users sign in, sign out, or their session expires.
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

/**
 * Type definition for the authentication context
 * - user: Current authenticated user (null if not logged in)
 * - session: Current session object (contains tokens, etc.)
 * - loading: Whether auth state is being checked
 * - signOut: Function to sign out the current user
 */
interface AuthContextType {
	user: User | null;
	session: Session | null;
	loading: boolean;
	signOut: () => Promise<void>;
}

/**
 * STEP 1: CREATE THE CONTEXT
 *
 * Think of Context as an empty "box" that will hold our authentication data.
 * Right now it's empty (undefined), but the Provider will fill it later.
 *
 * Note: TypeScript doesn't know WHERE useContext() will be called, so it types it as potentially undefined (i.e. called outside Provider) to be safe. This is a TypeScript safety feature!
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider Component
 *
 * Wraps the application and provides authentication state to all child components.
 * Sets up listeners for auth state changes and initializes session on mount.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
	// State for current user (null if not authenticated)
	const [user, setUser] = useState<User | null>(null);

	// State for current session (contains access token, refresh token, etc.)
	const [session, setSession] = useState<Session | null>(null);

	// Loading state: true while checking for existing session
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		/**
		 * STEP 1: FIRST set up auth state listener
		 * This listener will fire whenever auth state changes:
		 * - User signs in (event: "SIGNED_IN")
		 * - User signs out (event: "SIGNED_OUT")
		 * - Session expires (event: "SESSION_EXPIRED")
		 * - Token is refreshed (event: "TOKEN_REFRESHED")
		 */
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event, session) => {
			// Log important auth events for debugging
			if (event === "SIGNED_IN") {
				console.log("[AuthContext] ✅ User signed in:", session?.user?.email);
			} else if (event === "SIGNED_OUT") {
				console.log("[AuthContext] ✅ User signed out");
			} else if (event === "TOKEN_REFRESHED") {
				console.log("[AuthContext] 🔄 Session token refreshed");
			} else if (event === "USER_UPDATED") {
				console.log("[AuthContext] 👤 User data updated:", session?.user?.email);
			} else if (event === "PASSWORD_RECOVERY") {
				console.log("[AuthContext] 🔐 Password recovery initiated");
			}

			// Update state whenever auth changes
			setSession(session);
			setUser(session?.user ?? null); // Use null if session is null (i.e. if user is not logged in)
			setLoading(false);
		});

		/**
		 * STEP 2: THEN check for existing session
		 *
		 * This handles the case where:
		 * - User refreshes the page (session stored in localStorage)
		 * - User returns to the app later (session still valid)
		 * - App first loads (no session = user not logged in)
		 */
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session); // Note: session can be NULL here (when user is not logged in)
			setUser(session?.user ?? null); // If a session exists, set the user, otherwise set to null
			setLoading(false);
		});

		// STEP 3: Cleanup: unsubscribe from auth state changes when component unmounts
		// This prevents memory leaks
		return () => subscription.unsubscribe();
	}, []);

	/**
	 * Sign out function
	 */
	const signOut = async (): Promise<void> => {
		try {
			// Clear the current session and signs out the user
			// The state will be updated automatically via the auth state listener
			const { error } = await supabase.auth.signOut();

			if (error) {
				console.error("[AuthContext] ❌ Error signing out:", error);
				toast.error("Failed to sign out. Please try again.");
				throw error;
			}

			console.log("[AuthContext] ✅ User signed out successfully");
			toast.success("Signed out.");
		} catch (error) {
			// Error already logged and toast shown above
			throw error;
		}
	};

	/**
	 * STEP 2: CREATE THE VALUE TO PROVIDE
	 *
	 * This is the actual data we want to share "globally" (to all child components).
	 * It contains: user, session, loading state, and signOut function.
	 */
	const value = {
		user, // NULL when not logged in
		session, // NULL when not logged in
		loading,
		signOut,
	};

	/**
	 * STEP 3: PROVIDE THE VALUE TO ALL CHILDREN
	 *
	 * AuthContext.Provider is like a "delivery service" that takes our value and makes it available to ALL components inside it (and their children).
	 *
	 * In App.tsx, we wrap the entire app with <AuthProvider>, so EVERY component can access the authentication data through useAuth().
	 */
	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * STEP 4: CREATE A HOOK TO ACCESS THE CONTEXT
 *
 * This is a custom hook that components use to "read" the authentication data.

 * @throws Error if used outside AuthProvider (safety check)
 * @returns AuthContextType with user, session, loading, and signOut
 */
export function useAuth() {
	// React's built-in hook to read context values
	// Note: Although 'AuthProvider' always provides a value, TypeScript doesn't know if we're inside or outside the Provider and thus types this as: AuthContextType | undefined (safety feature)
	const context = useContext(AuthContext);

	// If context is undefined, it means it's been called outside the Provider → Throw an error (fail fast)
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}

	return context;
}
