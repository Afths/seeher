/**
 * PROFILE MODAL COMPONENT
 *
 * Displays a detailed view of a woman professional's profile in a modal dialog.
 * Shows comprehensive information including:
 * - Profile picture and basic info (job title, company, nationality, interests)
 * - Areas of expertise and languages
 * - Contact information (email, phone, alternative contact)
 * - Social media links with platform-specific icons
 * - Biography (short and detailed)
 * - Keywords and memberships
 *
 * Features:
 * - Responsive layout (1 column on mobile, 3 columns on desktop)
 * - Scrollable content for long profiles
 * - Social media icons that open links in new tabs
 * - Graceful handling of missing data
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Linkedin, Twitter, Facebook, Instagram, Youtube, Globe } from "lucide-react";
import { Woman } from "@/types";

interface ProfileModalProps {
	isOpen: boolean;
	onClose: () => void;
	woman: Woman | null;
}

export function ProfileModal({ isOpen, onClose, woman }: ProfileModalProps) {
	// Don't render if no woman data provided
	if (!woman) return null;

	const socialLinks = woman.social_media_links as Record<string, string> | null;

	/**
	 * Determine which social media icon to display based on URL
	 * Supports: LinkedIn, Twitter/X, Facebook, Instagram, YouTube, and generic Globe
	 */
	const getSocialIcon = (url: string) => {
		const urlLower = url.toLowerCase();
		if (urlLower.includes("linkedin")) return <Linkedin className="w-3 h-3" />;
		if (urlLower.includes("twitter") || urlLower.includes("x.com"))
			return <Twitter className="w-3 h-3" />;
		if (urlLower.includes("facebook")) return <Facebook className="w-3 h-3" />;
		if (urlLower.includes("instagram")) return <Instagram className="w-3 h-3" />;
		if (urlLower.includes("youtube")) return <Youtube className="w-3 h-3" />;
		return <Globe className="w-3 h-3" />;
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="text-2xl font-semibold">{woman.name}</DialogTitle>
				</DialogHeader>

				{/* MAIN CONTENT GRID - Left column (1/3) for basic info, Right columns (2/3) for detailed info */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{/* LEFT COLUMN - Photo and Basic Info */}
					<div className="space-y-4">
						{/* Profile picture with fallback initials */}
						<Avatar className="w-32 h-32 mx-auto">
							<AvatarImage
								src={woman.profile_picture_url || undefined}
								className="object-cover w-full h-full"
							/>
							<AvatarFallback className="text-2xl">
								{woman.name
									?.split(" ")
									.map((n) => n[0])
									.join("")
									.toUpperCase()}
							</AvatarFallback>
						</Avatar>

						{/* Basic information card */}
						<Card>
							<CardContent className="pt-4 space-y-2">
								{woman.job_title && (
									<div>
										<h4 className="text-sm font-medium text-muted-foreground">
											JOB TITLE
										</h4>
										<p className="text-sm">{woman.job_title}</p>
									</div>
								)}

								{woman.company_name && (
									<div>
										<h4 className="text-sm font-medium text-muted-foreground">
											COMPANY
										</h4>
										<p className="text-sm">{woman.company_name}</p>
									</div>
								)}

								{woman.nationality && (
									<div>
										<h4 className="text-sm font-medium text-muted-foreground">
											NATIONALITY
										</h4>
										<p className="text-sm">{woman.nationality}</p>
									</div>
								)}

								{woman.interested_in && (
									<div>
										<h4 className="text-sm font-medium text-muted-foreground">
											INTERESTED IN
										</h4>
										<p className="text-sm">{woman.interested_in.join(", ")}</p>
									</div>
								)}
							</CardContent>
						</Card>

						{/* Areas of Expertise card */}
						{woman.areas_of_expertise && woman.areas_of_expertise.length > 0 && (
							<Card>
								<CardContent className="pt-4">
									<h4 className="text-sm font-medium text-muted-foreground mb-2">
										AREAS OF EXPERTISE
									</h4>
									<div className="flex flex-wrap gap-1">
										{woman.areas_of_expertise.map((area) => (
											<Badge key={area} variant="outline" className="text-xs">
												{area}
											</Badge>
										))}
									</div>
								</CardContent>
							</Card>
						)}

						{/* Languages card */}
						{woman.languages && woman.languages.length > 0 && (
							<Card>
								<CardContent className="pt-4">
									<h4 className="text-sm font-medium text-muted-foreground mb-2">
										LANGUAGES
									</h4>
									<div className="flex flex-wrap gap-1">
										{woman.languages.map((language) => (
											<Badge
												key={language}
												variant="outline"
												className="text-xs"
											>
												{language}
											</Badge>
										))}
									</div>
								</CardContent>
							</Card>
						)}

						{/* Contact Information card */}
						{(woman.email ||
							woman.contact_number ||
							woman.alt_contact_name ||
							socialLinks) && (
							<Card>
								<CardContent className="pt-4 space-y-3">
									<h4 className="text-sm font-medium text-muted-foreground">
										CONTACT INFORMATION
									</h4>
									<div className="space-y-2">
										{woman.email && (
											<div>
												<h5 className="text-xs font-medium text-muted-foreground">
													EMAIL
												</h5>
												<p className="text-xs">{woman.email}</p>
											</div>
										)}

										{woman.contact_number && (
											<div>
												<h5 className="text-xs font-medium text-muted-foreground">
													PHONE
												</h5>
												<p className="text-xs">{woman.contact_number}</p>
											</div>
										)}

										{woman.alt_contact_name && (
											<div>
												<h5 className="text-xs font-medium text-muted-foreground">
													ALTERNATIVE CONTACT
												</h5>
												<p className="text-xs">{woman.alt_contact_name}</p>
											</div>
										)}
									</div>

									{/* Social media links with platform-specific icons */}
									{socialLinks && Object.keys(socialLinks).length > 0 && (
										<div>
											<h5 className="text-xs font-medium text-muted-foreground mb-2">
												SOCIAL MEDIA
											</h5>
											<div className="flex flex-wrap gap-1">
												{Object.entries(socialLinks).map(
													([platform, url]) => (
														<Button
															key={platform}
															variant="outline"
															size="sm"
															onClick={() =>
																window.open(url, "_blank")
															}
															className="text-xs h-6 px-2 hover:scale-105 transition-transform duration-200"
														>
															{getSocialIcon(url)}
														</Button>
													)
												)}
											</div>
										</div>
									)}
								</CardContent>
							</Card>
						)}
					</div>

					{/* RIGHT COLUMNS - Detailed Information */}
					<div className="md:col-span-2 space-y-6">
						{/* Biography section */}
						{(woman.short_bio || woman.long_bio) && (
							<div>
								<h3 className="text-lg font-semibold mb-3">BIOGRAPHY</h3>
								{woman.short_bio && (
									<div className="mb-3">
										<h4 className="text-sm font-medium text-muted-foreground mb-1">
											SHORT BIO
										</h4>
										<p className="text-sm">{woman.short_bio}</p>
									</div>
								)}
								{woman.long_bio && (
									<div>
										<h4 className="text-sm font-medium text-muted-foreground mb-1">
											DETAILED BIO
										</h4>
										<p className="text-sm whitespace-pre-wrap">
											{woman.long_bio}
										</p>
									</div>
								)}
							</div>
						)}

						<Separator />

						{/* Keywords and Memberships grid */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{woman.keywords && woman.keywords.length > 0 && (
								<div>
									<h4 className="text-sm font-medium text-muted-foreground mb-2">
										KEYWORDS
									</h4>
									<div className="flex flex-wrap gap-1">
										{woman.keywords.map((keyword) => (
											<Badge
												key={keyword}
												variant="secondary"
												className="text-xs"
											>
												{keyword}
											</Badge>
										))}
									</div>
								</div>
							)}

							{woman.memberships && woman.memberships.length > 0 && (
								<div>
									<h4 className="text-sm font-medium text-muted-foreground mb-2">
										MEMBERSHIPS
									</h4>
									<div className="flex flex-wrap gap-1">
										{woman.memberships.map((membership) => (
											<Badge
												key={membership}
												variant="outline"
												className="text-xs"
											>
												{membership}
											</Badge>
										))}
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
