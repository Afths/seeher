/**
 * PREDEFINED CONSTANTS
 *
 * Predefined lists for form fields that require standardized values.
 */

/**
 * Predefined list of languages
 * Users can only select from these languages
 */
export const LANGUAGES = [
	"Arabic",
	"Chinese",
	"Czech",
	"Dutch",
	"English",
	"French",
	"German",
	"Greek",
	"Hungarian",
	"Italian",
	"Polish",
	"Portuguese",
	"Romanian",
	"Russian",
	"Serbo-Croatian",
	"Spanish",
	"Turkish",
	"Ukrainian",
] as const;

/**
 * Predefined list of memberships
 * Users can only select from these memberships
 */
export const MEMBERSHIPS = [
	"Cyprus Chamber of Commerce and Industry (CCCI)",
	"International Chamber of Commerce (ICC)",
] as const;

/**
 * Type helpers for type safety
 */
export type Language = (typeof LANGUAGES)[number];
export type Membership = (typeof MEMBERSHIPS)[number];
