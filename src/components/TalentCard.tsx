/**
 * TALENT CARD COMPONENT
 *
 * Displays a preview card for a woman professional profile in the search results.
 * Shows key information in a compact, visually appealing format.
 *
 * Features:
 * - Profile picture with fallback avatar (initials + pastel color)
 * - Name, job title, and company
 * - Short bio (truncated to 3 lines)
 * - Areas of expertise badges (shows first 3, then "+X more")
 * - Keywords badges (shows first 4, then "+X more")
 * - Languages display (shows first 3)
 * - LinkedIn link (if available)
 * - Hover effects for better interactivity
 * - Click handler to open full profile modal
 */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Linkedin } from "lucide-react";

interface TalentCardProps {
	name: string;
	companyName: string | null;
	jobTitle: string | null;
	shortBio: string | null;
	profilePictureUrl: string | null;
	keywords?: string[];
	socialMediaLinks?: any;
	languages?: string[];
	areasOfExpertise?: string[];
	onClick: () => void;
}

export function TalentCard({
	name,
	companyName,
	jobTitle,
	shortBio,
	profilePictureUrl,
	keywords = [],
	socialMediaLinks,
	languages = [],
	areasOfExpertise = [],
	onClick,
}: TalentCardProps) {
	/**
	 * Generate initials from name (first letter of each word, max 2 letters)
	 * Example: "Jane Doe" → "JD"
	 */
	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	/**
	 * Format name with proper capitalization
	 * Example: "jane doe" → "Jane Doe"
	 */
	const formatName = (name: string) => {
		return name
			.split(" ")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
			.join(" ");
	};

	/**
	 * Generate a consistent pastel color based on name
	 * Uses name hash to ensure same person always gets same color
	 * Returns HSL color with 30% opacity for subtle background
	 */
	const getPastelColor = (name: string) => {
		const colors = [
			"hsl(25, 50%, 85%)", // pastel orange
			"hsl(350, 50%, 85%)", // pastel pink
			"hsl(270, 50%, 85%)", // pastel violet
			"hsl(120, 40%, 85%)", // pastel green
		];

		// Use name to generate consistent color for same person
		const hash = name.split("").reduce((a, b) => {
			a = (a << 5) - a + b.charCodeAt(0);
			return a & a;
		}, 0);

		const baseColor = colors[Math.abs(hash) % colors.length];
		// Convert to 30% opacity by adjusting the alpha
		return baseColor.replace("hsl(", "hsla(").replace(")", ", 0.3)");
	};

	const socialLinks = socialMediaLinks || {};

	return (
		<Card
			className="backdrop-blur-sm bg-card/80 border-primary/30 rounded-2xl hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:scale-[1.02] transition-all duration-500 ease-out cursor-pointer"
			onClick={onClick}
		>
			<CardContent className="p-6">
				<div className="flex items-start gap-4">
					{/* Profile picture section - 40x40 avatar */}
					<div className="w-40 h-40 flex-shrink-0">
						<Avatar className="w-full h-full border-2 border-border/20">
							<AvatarImage
								src={profilePictureUrl}
								alt={name}
								className="object-cover"
							/>
							{/* Fallback avatar with initials and pastel color */}
							<AvatarFallback
								className="text-2xl font-medium text-foreground"
								style={{ backgroundColor: getPastelColor(name) }}
							>
								{getInitials(name)}
							</AvatarFallback>
						</Avatar>
					</div>

					{/* Main content section */}
					<div className="flex-1 min-w-0">
						{/* Name and LinkedIn link */}
						<div className="flex items-start justify-between mb-1">
							<h3 className="text-lg font-semibold text-foreground">
								{formatName(name)}
							</h3>
							{/* LinkedIn icon - only shown if LinkedIn URL exists */}
							{socialLinks.raw && socialLinks.raw.includes("linkedin.com") && (
								<a
									href={socialLinks.raw}
									target="_blank"
									rel="noopener noreferrer"
									className="text-muted-foreground hover:text-primary hover:scale-110 transition-all duration-300 ease-out ml-2"
								>
									<Linkedin className="w-5 h-5 hover:fill-current" />
								</a>
							)}
						</div>

						{/* Job title and company */}
						{(jobTitle || companyName) && (
							<p className="text-sm text-primary font-medium mb-2">
								{jobTitle
									? `${jobTitle}${companyName ? ` at ${companyName}` : ""}`
									: `at ${companyName}`}
							</p>
						)}

						{/* Areas of expertise badges - shows first 3, then "+X more" */}
						{areasOfExpertise.length > 0 && (
							<div className="flex flex-wrap gap-1 mb-3">
								{areasOfExpertise.slice(0, 3).map((area, index) => (
									<Badge
										key={index}
										variant="secondary"
										className="text-xs bg-secondary/50 text-secondary-foreground border-0 rounded-full"
									>
										{area}
									</Badge>
								))}
								{areasOfExpertise.length > 3 && (
									<Badge variant="outline" className="text-xs rounded-full">
										+{areasOfExpertise.length - 3}
									</Badge>
								)}
							</div>
						)}

						{/* Short bio - truncated to 3 lines */}
						{shortBio && (
							<p className="text-sm text-foreground/80 mb-3 line-clamp-3">
								{shortBio}
							</p>
						)}

						{/* Keywords badges - shows first 4, then "+X more" */}
						{keywords.length > 0 && (
							<div className="flex flex-wrap gap-1 mb-3">
								{keywords.slice(0, 4).map((keyword, index) => (
									<Badge
										key={index}
										variant="outline"
										className="text-xs rounded-full"
									>
										{keyword}
									</Badge>
								))}
								{keywords.length > 4 && (
									<Badge variant="outline" className="text-xs rounded-full">
										+{keywords.length - 4}
									</Badge>
								)}
							</div>
						)}

						{/* Languages display - shows first 3 */}
						<div className="flex items-center justify-between">
							{languages.length > 0 && (
								<div className="flex gap-1">
									{languages.slice(0, 3).map((lang, index) => (
										<span
											key={index}
											className="text-xs bg-accent px-2 py-1 rounded-full"
										>
											{lang}
										</span>
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
