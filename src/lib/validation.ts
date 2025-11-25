import { z } from "zod";

// Profile submission validation schema
export const profileSubmissionSchema = z.object({
	name: z
		.string()
		.min(1, "Name is required")
		.max(100, "Name must be less than 100 characters")
		.regex(/^[a-zA-Z\s\-'\.]+$/, "Name contains invalid characters"),

	email: z
		.string()
		.email("Invalid email address")
		.max(255, "Email must be less than 255 characters"),

	job_title: z
		.string()
		.min(1, "Job title is required")
		.max(100, "Job title must be less than 100 characters"),

	company_name: z.string().max(100, "Company name must be less than 100 characters").optional(),

	nationality: z
		.string()
		.min(1, "Nationality is required")
		.max(50, "Nationality must be less than 50 characters"),

	contact_number: z
		.string()
		.regex(/^\+[1-9]\d{1,14}$/, "Phone number must be in format +[digits] (e.g., +35799123456)")
		.optional()
		.or(z.literal("")),

	alt_contact_name: z
		.string()
		.max(100, "Alternative contact name must be less than 100 characters")
		.optional(),

	short_bio: z
		.string()
		.min(1, "Short bio is required")
		.max(500, "Short bio must be less than 500 characters"),

	long_bio: z.string().max(2000, "Long bio must be less than 2000 characters").optional(),

	areas_of_expertise: z
		.array(z.string().max(50))
		.min(1, "At least one area of expertise is required")
		.max(10, "Maximum 10 areas of expertise allowed"),

	languages: z
		.array(z.string().max(30))
		.min(1, "At least one language is required")
		.max(15, "Maximum 15 languages allowed"),

	keywords: z.array(z.string().max(30)).max(20, "Maximum 20 keywords allowed"),

	memberships: z.array(z.string().max(100)).max(10, "Maximum 10 memberships allowed"),

	interested_in: z
		.array(z.enum(["Speaker", "Panelist", "Board Member"]))
		.min(1, "At least one role must be selected"),

	social_media_links: z.record(z.string().url("Invalid URL format")).optional(),

	consent: z.boolean().refine((val) => val === true, "Consent is required"),
});

export type ProfileSubmissionData = z.infer<typeof profileSubmissionSchema>;

// Profile update validation schema (same as submission, but without consent and email)
// Consent is only set once during initial submission and cannot be changed
// Email is locked to authenticated user's email and cannot be changed
export const profileUpdateSchema = profileSubmissionSchema.omit({ consent: true, email: true });

export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;

// Search filters validation
export const searchFiltersSchema = z.object({
	searchTerm: z.string().max(100, "Search term too long").optional(),
	languages: z.array(z.string()).max(15),
	areasOfExpertise: z.array(z.string()).max(10),
	memberships: z.array(z.string()).max(10),
	interestedIn: z.string().optional(),
});

/**
 * Sanitize input string to prevent XSS attacks
 * Removes HTML tags (< >) and trims whitespace
 *
 * @param input - The string to sanitize
 * @returns Sanitized string, or undefined if input is empty
 */
export const sanitizeInput = (input: string): string | undefined => {
	if (!input || input.trim() === "") return undefined;

	const sanitized = input
		.replace(/[<>]/g, "") // Remove potential HTML tags
		.trim();

	return sanitized;
};

// Rate limiting helper
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (
	identifier: string,
	maxRequests: number = 5,
	windowMs: number = 60000
): boolean => {
	const now = Date.now();
	const record = rateLimitMap.get(identifier);

	if (!record || now > record.resetTime) {
		rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
		return true;
	}

	if (record.count >= maxRequests) {
		return false;
	}

	record.count++;
	return true;
};
