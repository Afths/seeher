/**
 * NOT FOUND PAGE (404)
 *
 * Displays when a user navigates to a route that doesn't exist.
 * Provides a user-friendly error message and link back to home.
 *
 * Features:
 * - Logs 404 errors to console for debugging
 * - Shows clear error message to user
 * - Provides navigation link back to home page
 *
 * Usage:
 * - Used as catch-all route in React Router
 * - Matches any route that doesn't match defined routes
 */

import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
	const location = useLocation(); // Current route location

	/**
	 * Log 404 errors for debugging
	 * 
	 * Logs the attempted route to console when user hits a 404 page.
	 * Helps identify broken links or typos in navigation.
	 */
	useEffect(() => {
		console.error("404 Error: User attempted to access non-existent route:", location.pathname);
	}, [location.pathname]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100">
			<div className="text-center">
				<h1 className="text-4xl font-bold mb-4">404</h1>
				<p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
				<a href="/" className="text-blue-500 hover:text-blue-700 underline">
					Return to Home
				</a>
			</div>
		</div>
	);
};

export default NotFound;
