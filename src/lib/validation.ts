import { z } from "zod";
import { LANGUAGES, MEMBERSHIPS } from "./constants";

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

	contact_number: z
		.string()
		.regex(/^\+[1-9]\d{1,14}$/, "Phone number must be in format +[digits] (e.g., +35799123456)")
		.optional()
		.or(z.literal("")),

	bio: z.string().min(1, "Bio is required").max(500, "Bio must be less than 500 characters"),

	areas_of_expertise: z
		.array(z.string().max(50))
		.min(1, "At least one area of expertise is required")
		.max(10, "Maximum 10 areas of expertise allowed"),

	languages: z
		.array(z.string())
		.min(1, "At least one language is required")
		.max(15, "Maximum 15 languages allowed")
		.refine((values) => values.every((val) => (LANGUAGES as readonly string[]).includes(val)), {
			message: "All languages must be from the predefined list",
		}),

	memberships: z
		.array(z.string())
		.max(10, "Maximum 10 memberships allowed")
		.refine(
			(values) => values.every((val) => (MEMBERSHIPS as readonly string[]).includes(val)),
			{ message: "All memberships must be from the predefined list" }
		),

	interested_in: z
		.array(z.enum(["Speaker", "Panelist", "Board Member"]))
		.min(1, "At least one role must be selected"),

	social_media: z.string().url("Invalid URL format").optional(),
});

export type ProfileSubmissionData = z.infer<typeof profileSubmissionSchema>;

// Profile update validation schema (same as submission, but without email)
// Email is locked to authenticated user's email and cannot be changed
export const profileUpdateSchema = profileSubmissionSchema.omit({ email: true });

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
