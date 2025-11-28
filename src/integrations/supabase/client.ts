/**
 * SUPABASE CLIENT CONFIGURATION
 * 
 * This file sets up the Supabase client for database and authentication operations.
 * Supabase is the backend-as-a-service platform used for:
 * - Database (PostgreSQL) - stores profile data
 * - Authentication - handles user sign-in/sign-out
 * - Storage - for profile pictures and other files
 * - Edge Functions - serverless functions for backend logic
 * 
 * Environment Variables:
 * - VITE_SUPABASE_URL: Your Supabase project URL
 * - VITE_SUPABASE_ANON_KEY: Your Supabase anonymous/public key (safe to expose in client-side code)
 * 
 * These should be set in your .env file
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Supabase project URL - loaded from environment variables
// In Vite, environment variables must be prefixed with VITE_ to be exposed to the client
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// Supabase anonymous/public key - safe to expose in client-side code
// This key has limited permissions (anon role) and is restricted by Row Level Security policies
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate that required environment variables are set
if (!SUPABASE_URL) {
	throw new Error("Missing env.VITE_SUPABASE_URL");
}

if (!SUPABASE_PUBLISHABLE_KEY) {
	throw new Error("Missing env.VITE_SUPABASE_ANON_KEY");
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

/**
 * Supabase client instance
 * 
 * This is the main client used throughout the application to:
 * - Query the database (supabase.from('table').select())
 * - Manage authentication (supabase.auth.signIn(), signOut(), etc.)
 * - Call edge functions (supabase.functions.invoke())
 * 
 * Configuration:
 * - storage: Uses browser localStorage to persist sessions
 * - persistSession: Keeps user logged in across page refreshes
 * - autoRefreshToken: Automatically refreshes expired tokens
 */
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,      // Store auth tokens in browser localStorage
    persistSession: true,       // Keep session alive across page refreshes
    autoRefreshToken: true,     // Automatically refresh expired access tokens
  }
});