import { z } from "zod";

// Profile submission validation schema
export const profileSubmissionSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z\s\-'\.]+$/, "Name contains invalid characters"),
  
  email: z.string()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters"),
  
  job_title: z.string()
    .max(100, "Job title must be less than 100 characters")
    .optional(),
  
  company_name: z.string()
    .max(100, "Company name must be less than 100 characters")
    .optional(),
  
  nationality: z.string()
    .max(50, "Nationality must be less than 50 characters")
    .optional(),
  
  contact_number: z.string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, "Invalid phone number format")
    .optional()
    .or(z.literal("")),
  
  alt_contact_name: z.string()
    .max(100, "Alternative contact name must be less than 100 characters")
    .optional(),
  
  short_bio: z.string()
    .max(500, "Short bio must be less than 500 characters")
    .optional(),
  
  long_bio: z.string()
    .max(2000, "Long bio must be less than 2000 characters")
    .optional(),
  
  areas_of_expertise: z.array(z.string().max(50)).max(10, "Maximum 10 areas of expertise allowed"),
  
  languages: z.array(z.string().max(30)).max(15, "Maximum 15 languages allowed"),
  
  keywords: z.array(z.string().max(30)).max(20, "Maximum 20 keywords allowed"),
  
  memberships: z.array(z.string().max(100)).max(10, "Maximum 10 memberships allowed"),
  
  interested_in: z.enum(["speaker", "panelist", "board member"]),
  
  social_media_links: z.record(z.string().url("Invalid URL format")).optional(),
  
  consent: z.boolean().refine(val => val === true, "Consent is required")
});

export type ProfileSubmissionData = z.infer<typeof profileSubmissionSchema>;

// Search filters validation
export const searchFiltersSchema = z.object({
  searchTerm: z.string().max(100, "Search term too long").optional(),
  languages: z.array(z.string()).max(15),
  areasOfExpertise: z.array(z.string()).max(10),
  memberships: z.array(z.string()).max(10),
  interestedIn: z.string().optional()
});

// Sanitization function to prevent XSS
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim();
};

// Rate limiting helper
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (identifier: string, maxRequests: number = 5, windowMs: number = 60000): boolean => {
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