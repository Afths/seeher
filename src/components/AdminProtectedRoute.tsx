/**
 * ADMIN PROTECTED ROUTE COMPONENT
 *
 * Wraps routes that require admin privileges.
 * Checks admin status BEFORE rendering the protected component.
 */

import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";

interface AdminProtectedRouteProps {
	children: React.ReactNode;
}

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
	const { user, loading: authLoading } = useAuth();
	const { isAdmin, loading: adminLoading } = useIsAdmin();

	// Show loading spinner while checking authentication/admin status
	if (authLoading || adminLoading) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
			</div>
		);
	}

	// Redirect to home if not authenticated or not admin
	if (!user || !isAdmin) {
		return <Navigate to="/" replace />;
	}

	// User is authenticated and is an admin - render the protected component
	return <>{children}</>;
}
