/**
 * PROFILE MODAL COMPONENT
 *
 * Displays a detailed view of a woman professional's profile in a modal dialog.
 * Shows comprehensive information including:
 * - Profile picture and basic info (job title, company, interests)
 * - Areas of expertise (with endorsement functionality) and languages
 * - Contact information (email, phone)
 * - Social media links with platform-specific icons
 * - Biography (short and detailed)
 * - Memberships
 *
 * Features:
 * - Responsive layout (1 column on mobile, 3 columns on desktop)
 * - Scrollable content for long profiles
 * - Social media icons that open links in new tabs
 * - Endorsement system for areas of expertise
 * - Graceful handling of missing data
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Linkedin, Facebook, Instagram, Globe, Edit, ThumbsUp } from "lucide-react";
import { Woman } from "@/types/database";
import { useEndorsements } from "@/hooks/useEndorsements";
import { useAuth } from "@/contexts/AuthContext";

interface ProfileModalProps {
	isOpen: boolean;
	onClose: () => void;
	woman: Woman;
	onEditClick?: () => void; // Edit profile callback - only passed when the user is viewing their own profile
}

export function ProfileModal({ isOpen, onClose, woman, onEditClick }: ProfileModalProps) {
	const { user } = useAuth();

	const {
		loading: endorsementsLoading,
		getEndorsementCount,
		isEndorsedByUser,
		toggleEndorsement,
	} = useEndorsements(woman.id, user?.id);

	const socialMediaLink = woman.social_media;

	// If 'onEditClick' is provided, it means user is viewing their own profile and therefore they can edit it
	const showEditButton = !!onEditClick;

	/**
	 * Determine which social media icon to display based on URL
	 * Supports: LinkedIn, Facebook, Instagram, and generic Globe for all other links
	 */
	const getSocialIcon = (url: string) => {
		const urlLower = url.toLowerCase();
		if (urlLower.includes("linkedin")) return <Linkedin className="w-3 h-3" />;
		if (urlLower.includes("facebook")) return <Facebook className="w-3 h-3" />;
		if (urlLower.includes("instagram")) return <Instagram className="w-3 h-3" />;
		return <Globe className="w-3 h-3" />;
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<div className="flex items-center justify-between">
						<DialogTitle className="text-2xl font-semibold">{woman.name}</DialogTitle>
						{/* Edit Profile button - only shown on user's own profile */}
						{showEditButton && (
							<Button
								variant="default"
								size="sm"
								onClick={onEditClick}
								className="rounded-xl mr-8"
							>
								<Edit className="w-4 h-4 mr-2" />
								Edit Profile
							</Button>
						)}
					</div>
				</DialogHeader>

				{/* MAIN CONTENT GRID - Left column (1/3) for basic info, Right columns (2/3) for detailed info */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{/* LEFT COLUMN - Photo and Basic Info */}
					<div className="space-y-4">
						{/* Profile picture with fallback initials */}
						<Avatar className="w-32 h-32 mx-auto">
							<AvatarImage
								src={woman.profile_picture || undefined}
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

						{/* Languages card */}
						{woman.languages && woman.languages.length > 0 && (
							<Card className="border-primary/30">
								<CardContent className="pt-4">
									<h4 className="text-sm font-medium text-primary mb-2">
										LANGUAGES
									</h4>
									<div className="flex flex-wrap gap-1">
										{woman.languages.map((language) => (
											<Badge
												key={language}
												variant="secondary"
												className="text-xs bg-primary/10 text-primary border-primary/30"
											>
												{language}
											</Badge>
										))}
									</div>
								</CardContent>
							</Card>
						)}

						{/* Areas of Expertise card */}
						{woman.areas_of_expertise && woman.areas_of_expertise.length > 0 && (
							<Card className="border-primary/30">
								<CardContent className="pt-4">
									<h4 className="text-sm font-medium text-primary mb-2">
										AREAS OF EXPERTISE
									</h4>
									<div className="space-y-2">
										{woman.areas_of_expertise.map((area) => {
											const count = getEndorsementCount(area);
											const isEndorsed = isEndorsedByUser(area);
											const canEndorse = user && !showEditButton; // A user can endorse if they are signed in and viewing someone else's profile (not theirs)

											return (
												<div
													key={area}
													className="flex items-center gap-2 flex-wrap"
												>
													<Badge
														variant="secondary"
														className="text-xs bg-primary/10 text-primary border-primary/30 flex items-center gap-1.5"
													>
														{area}
														{canEndorse && (
															<button
																onClick={() =>
																	toggleEndorsement(area)
																}
																disabled={endorsementsLoading}
																className={`ml-1 p-0.5 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
																	isEndorsed
																		? "text-blue-600 hover:text-blue-700"
																		: "text-muted-foreground hover:text-primary"
																}`}
																aria-label={
																	isEndorsed
																		? "Remove endorsement"
																		: "Endorse this area"
																}
															>
																<ThumbsUp className="w-3 h-3" />
															</button>
														)}
													</Badge>
													{count > 0 && (
														<span className="text-xs text-muted-foreground">
															(
															<span className="text-primary font-semibold">
																{count}
															</span>{" "}
															{count === 1
																? "endorsement"
																: "endorsements"}
															)
														</span>
													)}
												</div>
											);
										})}
									</div>
								</CardContent>
							</Card>
						)}

						{/* Memberships card */}
						{woman.memberships && woman.memberships.length > 0 && (
							<Card className="border-primary/30">
								<CardContent className="pt-4">
									<h4 className="text-sm font-medium text-primary mb-2">
										MEMBERSHIPS
									</h4>
									<div className="flex flex-wrap gap-1">
										{woman.memberships.map((membership) => (
											<Badge
												key={membership}
												variant="secondary"
												className="text-xs bg-primary/10 text-primary border-primary/30"
											>
												{membership}
											</Badge>
										))}
									</div>
								</CardContent>
							</Card>
						)}

						{/* Contact Information card */}
						{(woman.email || woman.contact_number || socialMediaLink) && (
							<Card className="border-primary/30">
								<CardContent className="pt-4 space-y-3">
									<h4 className="text-sm font-medium text-primary">
										CONTACT INFORMATION
									</h4>
									<div className="space-y-2">
										{woman.email && (
											<div>
												<h5 className="text-xs font-medium text-primary">
													EMAIL
												</h5>
												<a
													href={`mailto:${woman.email}`}
													className="text-xs text-primary hover:underline"
												>
													{woman.email}
												</a>
											</div>
										)}

										{woman.contact_number && (
											<div>
												<h5 className="text-xs font-medium text-primary">
													PHONE
												</h5>
												<p className="text-xs">{woman.contact_number}</p>
											</div>
										)}
									</div>

									{/* Social media link with platform-specific icon */}
									{socialMediaLink && (
										<div>
											<h5 className="text-xs font-medium text-primary mb-2">
												SOCIAL MEDIA
											</h5>
											<div className="flex flex-wrap gap-1">
												<Button
													variant="outline"
													size="sm"
													onClick={() =>
														window.open(socialMediaLink, "_blank")
													}
													className="text-xs h-6 px-2 hover:scale-105 transition-transform duration-200"
												>
													{getSocialIcon(socialMediaLink)}
												</Button>
											</div>
										</div>
									)}
								</CardContent>
							</Card>
						)}
					</div>

					{/* RIGHT COLUMNS - Detailed Information */}
					<div className="md:col-span-2 space-y-6">
						{/* Job Title & Company card */}
						<Card className="border-primary/30">
							<CardContent className="pt-4 space-y-2">
								{woman.job_title && (
									<div>
										<h4 className="text-sm font-medium text-primary">
											JOB TITLE
										</h4>
										<p className="text-sm">{woman.job_title}</p>
									</div>
								)}

								{woman.company_name && (
									<div>
										<h4 className="text-sm font-medium text-primary">
											COMPANY
										</h4>
										<p className="text-sm">{woman.company_name}</p>
									</div>
								)}
							</CardContent>
						</Card>

						{/* Biography section */}
						{woman.bio && (
							<Card className="border-primary/30">
								<CardContent className="pt-4">
									<h4 className="text-sm font-medium text-primary mb-1">BIO</h4>
									<p className="text-sm">{woman.bio}</p>
								</CardContent>
							</Card>
						)}

						{/* Interested In card */}
						{woman.interested_in && woman.interested_in.length > 0 && (
							<Card className="border-primary/30">
								<CardContent className="pt-4">
									<h4 className="text-sm font-medium text-primary mb-2">
										INTERESTED IN
									</h4>
									<div className="flex flex-wrap gap-1 mb-3">
										{woman.interested_in.map((interest) => (
											<Badge
												key={interest}
												variant="secondary"
												className="text-xs bg-primary/10 text-primary border-primary/30"
											>
												{interest}
											</Badge>
										))}
									</div>
									{woman.interested_in_description && (
										<div className="mt-3 pt-3 border-t border-primary/20">
											<p className="text-sm text-muted-foreground">
												{woman.interested_in_description}
											</p>
										</div>
									)}
								</CardContent>
							</Card>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
