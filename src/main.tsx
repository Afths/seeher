/**
 * MAIN ENTRY POINT - SeeHer Application
 *
 * This is the entry point of the React application. It:
 * 1. Imports the main App component
 * 2. Imports global CSS styles (Tailwind CSS configuration)
 * 3. Mounts the React app to the DOM element with id="root"
 *
 * The application is a talent discovery platform for women professionals,
 * allowing users to search, filter, and discover talented women in various fields.
 */

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Get the root DOM element and render the App component
createRoot(document.getElementById("root")!).render(<App />);
