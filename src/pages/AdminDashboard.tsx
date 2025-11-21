/**
 * ADMIN DASHBOARD PAGE
 *
 * This page is accessible only to admin users and provides functionality to:
 * - Review profile submissions that are pending approval
 * - Approve profiles (changes status to APPROVED and sends welcome email)
 * - Reject profiles (changes status to NOT_APPROVED)
 * - View rejected profiles
 * - Use AI to suggest areas of expertise for profiles
 *
 * Security:
 * - Protected route - redirects non-admin users to home page
 * - Logs all admin actions for security auditing
 *
 * The dashboard shows profiles with status "PENDING_APPROVAL" or "NOT_APPROVED"
 * and allows admins to take action on them.
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useSuggestExpertise } from "@/hooks/useSuggestExpertise";
import { useAdminSecurity } from "@/hooks/useAdminSecurity";
import { SubmissionType } from "@/types";

export default function AdminDashboard() {
	const { suggestExpertise, isLoading: isGeneratingExpertise } = useSuggestExpertise(); // AI expertise suggestion hook
	const { logAdminAction } = useAdminSecurity(); // Security logging hook

	const [submissions, setSubmissions] = useState<SubmissionType[]>([]); // List of submissions to review
	const [loading, setLoading] = useState<boolean>(true); // Loading state

	/**
	 * Fetch profile submissions from database
	 * Retrieves profiles with status PENDING_APPROVAL or NOT_APPROVED
	 * Ordered by creation date (newest first)
	 */
	const fetchSubmissions = async () => {
		try {
			const { data, error } = await supabase
				.from("women")
				.select("*")
				.in("status", ["PENDING_APPROVAL", "NOT_APPROVED"]) // Only show pending and rejected profiles
				.order("created_at", { ascending: false }); // Newest first

			if (error) {
				console.error("[AdminDashboard] ❌ Error fetching submissions:", error);
				throw error;
			}

			console.log("[AdminDashboard] ✅ Submissions fetched successfully", data);

			setSubmissions(data || []);
		} catch (error) {
			console.error("[AdminDashboard] ❌ Error fetching submissions:", error);
		} finally {
			setLoading(false);
		}
	};

	/**
	 * Fetch submissions when component mounts
	 */
	useEffect(() => {
		fetchSubmissions();
	}, []);

	/**
	 * Handle approving a profile submission
	 *
	 * This function:
	 * 1. Logs the admin action for security auditing
	 * 2. Updates the profile status to "APPROVED"
	 * 3. Sends a welcome email with magic link to the profile owner
	 * 4. Refreshes the submissions list
	 */
	const handleApprove = async (submission: SubmissionType) => {
		try {
			// Log admin action for security auditing
			logAdminAction("APPROVE_SUBMISSION", {
				submissionId: submission.id,
				submissionName: submission.name,
			});

			// Update profile status to APPROVED in database
			const { error: updateError } = await supabase
				.from("women")
				.update({ status: "APPROVED" })
				.eq("id", submission.id);

			if (updateError) {
				console.error("[AdminDashboard] ❌ Error updating profile status:", updateError);
				throw updateError;
			}

			// Send approval email via Loop.so Edge Function
			// This notifies the user that their profile has been approved and includes a magic link to sign in
			const { error: emailError } = await supabase.functions.invoke("send-approval-email", {
				body: {
					email: submission.email,
					name: submission.name,
				},
			});

			if (emailError) {
				console.error("[AdminDashboard] ❌ Error sending approval email:", emailError);
				// Don't throw - profile is already approved, email failure shouldn't block the action
			} else {
				console.log("[AdminDashboard] ✅ Approval email sent successfully");
			}

			// Refresh the submissions list to remove the approved profile
			fetchSubmissions();
		} catch (error) {
			console.error("[AdminDashboard] ❌ Error approving submission:", error);
		}
	};

	/**
	 * Handle rejecting a profile submission
	 *
	 * This function:
	 * 1. Logs the admin action for security auditing
	 * 2. Updates the profile status to "NOT_APPROVED"
	 * 3. Sends a rejection email notification to the user
	 * 4. Refreshes the submissions list
	 *
	 * Note: Rejected profiles are kept in the database (not deleted) for:
	 * - Audit trail and compliance purposes
	 * - Historical record keeping
	 * - Analytics on rejection patterns
	 * Users with rejected profiles can resubmit (the app treats NOT_APPROVED as "no profile")
	 */
	const handleReject = async (submission: SubmissionType) => {
		try {
			// Log admin action for security auditing
			logAdminAction("REJECT_SUBMISSION", {
				submissionId: submission.id,
				submissionName: submission.name,
			});

			// Update profile status to NOT_APPROVED in database
			// Note: Profile is kept in DB for audit purposes, but user can resubmit
			const { error } = await supabase
				.from("women")
				.update({ status: "NOT_APPROVED" })
				.eq("id", submission.id);

			if (error) {
				console.error("[AdminDashboard] ❌ Error rejecting submission:", error);
				throw error;
			}

			// Send rejection email via Loop.so Edge Function
			// This notifies the user that their profile submission was not approved
			const { error: emailError } = await supabase.functions.invoke("send-rejection-email", {
				body: {
					email: submission.email,
					name: submission.name,
					// Optional: Add rejection reason if you want to provide feedback
					// reason: "Your profile did not meet our current requirements..."
				},
			});

			if (emailError) {
				console.error("[AdminDashboard] ❌ Error sending rejection email:", emailError);
				// Don't throw - profile is already rejected, email failure shouldn't block the action
			} else {
				console.log("[AdminDashboard] ✅ Rejection email sent successfully");
			}

			console.log("[AdminDashboard] ✅ Profile has been rejected");

			// Refresh the submissions list
			fetchSubmissions();
		} catch (error) {
			console.error("[AdminDashboard] ❌ Error rejecting submission:", error);
		}
	};

	/**
	 * Calculate and format how many days ago a date was
	 * Used to display submission age in the UI
	 */
	const getDaysAgo = (dateString: string): string => {
		const diffTime = Math.abs(Date.now() - new Date(dateString).getTime());
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
	};

	return (
		<div className="min-h-screen bg-background">
			{/* HEADER SECTION */}
			<div className="bg-gradient-to-r from-background via-accent/30 to-background border-b border-border/40">
				<div className="container mx-auto px-6 py-8">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							{/* Back to home button */}
							<Link to="/">
								<Button variant="outline" size="sm" className="rounded-xl">
									<ArrowLeft className="w-4 h-4 mr-2" />
									Back to Home
								</Button>
							</Link>
							<h1 className="text-3xl font-semibold text-foreground">
								Admin Dashboard
							</h1>
						</div>
					</div>
				</div>
			</div>

			{/* MAIN CONTENT AREA */}
			<div className="container mx-auto px-6 py-8">
				{/* Dashboard header with stats and actions */}
				<div className="mb-6 flex items-center justify-between">
					<div>
						<h2 className="text-2xl font-semibold mb-2">Profile Submissions</h2>
						{/* Display counts of pending and rejected submissions */}
						<p className="text-muted-foreground">
							{submissions.filter((s) => s.status === "PENDING_APPROVAL").length}{" "}
							pending approval,{" "}
							{submissions.filter((s) => s.status === "NOT_APPROVED").length} rejected
						</p>
					</div>

					{/* AI-powered expertise suggestion button */}
					{/* Uses AI to analyze profiles and suggest areas of expertise */}
					<Button
						onClick={() => suggestExpertise()}
						disabled={isGeneratingExpertise}
						size="sm"
						className="rounded-xl"
					>
						{isGeneratingExpertise ? (
							<>
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
								Analyzing Profiles...
							</>
						) : (
							"Suggest Areas of Expertise"
						)}
					</Button>
				</div>

				{/* SUBMISSIONS LIST */}
				{loading ? (
					/* Loading state - show spinner while fetching submissions */
					<div className="text-center py-12">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
						<p className="text-muted-foreground mt-4">Loading submissions...</p>
					</div>
				) : submissions.length === 0 ? (
					/* Empty state - no submissions to review */
					<div className="text-center py-12">
						<p className="text-muted-foreground">No submissions to review</p>
					</div>
				) : (
					/* Submissions grid - display each submission in a card */
					<div className="grid gap-6">
						{submissions.map((submission) => (
							<Card key={submission.id} className="w-full">
								<CardHeader>
									<div className="flex items-center justify-between">
										{/* Profile name */}
										<CardTitle className="text-xl">{submission.name}</CardTitle>
										<div className="flex items-center gap-2">
											{/* Status badge - different color for pending vs rejected */}
											<Badge
												variant={
													submission.status === "PENDING_APPROVAL"
														? "secondary"
														: "destructive"
												}
											>
												{submission.status?.replace("_", " ")}
											</Badge>
											{/* Submission age */}
											<span className="text-sm text-muted-foreground">
												{getDaysAgo(submission.created_at)}
											</span>
										</div>
									</div>
								</CardHeader>
								<CardContent>
									{/* Profile information grid */}
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
										<div>
											<p className="text-sm font-medium">Email:</p>
											<p className="text-sm text-muted-foreground">
												{submission.email || "Not provided"}
											</p>
										</div>
										<div>
											<p className="text-sm font-medium">Job Title:</p>
											<p className="text-sm text-muted-foreground">
												{submission.job_title || "Not provided"}
											</p>
										</div>
										<div>
											<p className="text-sm font-medium">Company:</p>
											<p className="text-sm text-muted-foreground">
												{submission.company_name || "Not provided"}
											</p>
										</div>
										<div>
											<p className="text-sm font-medium">Interested In:</p>
											<p className="text-sm text-muted-foreground">
												{submission.interested_in || "Not specified"}
											</p>
										</div>
									</div>

									{/* Short bio section - only shown if bio exists */}
									{submission.short_bio && (
										<div className="mb-4">
											<p className="text-sm font-medium mb-1">Short Bio:</p>
											<p className="text-sm text-muted-foreground">
												{submission.short_bio}
											</p>
										</div>
									)}

									{/* Areas of expertise - displayed as badges */}
									{submission.areas_of_expertise &&
										submission.areas_of_expertise.length > 0 && (
											<div className="mb-4">
												<p className="text-sm font-medium mb-2">
													Areas of Expertise:
												</p>
												<div className="flex flex-wrap gap-1">
													{submission.areas_of_expertise.map(
														(area, index) => (
															<Badge
																key={index}
																variant="outline"
																className="text-xs"
															>
																{area}
															</Badge>
														)
													)}
												</div>
											</div>
										)}

									{/* Action buttons - only shown for pending submissions */}
									{submission.status === "PENDING_APPROVAL" && (
										<div className="flex gap-2 pt-4">
											{/* Approve button - approves profile and sends welcome email */}
											<Button
												onClick={() => handleApprove(submission)}
												size="sm"
												className="bg-green-600 hover:bg-green-700"
											>
												<Check className="w-4 h-4 mr-2" />
												Approve
											</Button>
											{/* Reject button - marks profile as rejected */}
											<Button
												onClick={() => handleReject(submission)}
												variant="destructive"
												size="sm"
											>
												<X className="w-4 h-4 mr-2" />
												Reject
											</Button>
										</div>
									)}
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
