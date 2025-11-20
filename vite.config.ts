/**
 * VITE CONFIGURATION
 *
 * Vite is the build tool and development server for this project.
 * This configuration file sets up:
 * - React plugin with SWC (fast compiler)
 * - Path aliases (@/ points to ./src directory)
 * - Development server settings
 * - Component tagger for Lovable (development only)
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
	// Development server configuration
	server: {
		host: "::", // Listen on all network interfaces (IPv6)
		port: 8080, // Port for the development server
	},

	// Vite plugins
	plugins: [
		react(), // React plugin with SWC for fast compilation
		// Component tagger only enabled in development mode (for Lovable IDE)
		mode === "development" && componentTagger(),
	].filter(Boolean), // Remove any falsy values from the array

	// Path resolution aliases
	resolve: {
		alias: {
			// Allows importing with @/ instead of relative paths
			// Example: import { Button } from "@/components/ui/button"
			"@": path.resolve(__dirname, "./src"),
		},
	},
}));
