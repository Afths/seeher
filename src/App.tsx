/**
 * MAIN APP COMPONENT - SeeHer Application
 *
 * This is the root component that sets up the application's provider hierarchy
 * and routing. The component structure follows this order:
 *
 * 1. QueryClientProvider - Provides React Query for server state management
 * 2. TooltipProvider - Provides tooltip context for UI components
 * 3. AuthProvider - Provides authentication context throughout the app
 * 4. Toast notifications (Toaster) - For user feedback
 * 5. BrowserRouter - Handles client-side routing
 *
 * Routes:
 * - "/" - Main search/discovery page (Index)
 * - "/admin" - Admin dashboard for managing profile submissions
 * - "*" - 404 Not Found page (catch-all route)
 */

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";
import Index from "./pages/Index";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

// Create a React Query client instance for managing server state and caching
// This enables features like data fetching, caching, and synchronization
const queryClient = new QueryClient();

const App = () => (
	// Manages server state, caching, and data synchronization
	<QueryClientProvider client={queryClient}>
		{/* Enables tooltip functionality across the app */}
		<TooltipProvider delayDuration={200}>
			{/* Manages user authentication state and session */}
			<AuthProvider>
				{/* Toast notification component */}
				<Toaster />
				{/* Browser Router - Handles client-side routing */}
				<BrowserRouter>
					<Routes>
						{/* Main page: Search and discover women professionals */}
						<Route path="/" element={<Index />} />

						{/* Admin dashboard: Review and approve profile submissions */}
						<Route
							path="/admin"
							element={
								// This route makes the dashobard only accessible to admin users
								<AdminProtectedRoute>
									<AdminDashboard />
								</AdminProtectedRoute>
							}
						/>

						{/* Catch-all route: 404 Not Found page for any unmatched paths */}
						<Route path="*" element={<NotFound />} />
					</Routes>
				</BrowserRouter>
			</AuthProvider>
		</TooltipProvider>
	</QueryClientProvider>
);

export default App;
