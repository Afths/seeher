/**
 * RESET PASSWORD PAGE
 *
 * Handles password reset flow after user clicks the reset link in their email.
 * When users click the password reset link, Supabase redirects them to this page with a recovery session and allows them to set a new password.
 *
 * Features:
 * - Checks for valid recovery session from password reset link
 * - Password input with confirmation
 * - Password visibility toggle
 * - Updates password via Supabase Auth
 * - Redirects to home page after successful password reset
 * - Error handling with user-friendly messages
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Eye, EyeOff, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

export default function ResetPassword() {
	const navigate = useNavigate();

	// Form input states
	const [password, setPassword] = useState<string>("");
	const [confirmPassword, setConfirmPassword] = useState<string>("");

	// Password visibility toggles
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

	// Loading state during password update
	const [loading, setLoading] = useState<boolean>(false);

	// Check if user has a valid recovery session (from password reset link)
	const [hasRecoverySession, setHasRecoverySession] = useState<boolean>(false);
	const [checkingSession, setCheckingSession] = useState<boolean>(true);

	/**
	 * Check for recovery session when component mounts
	 * When users click the password reset link, Supabase redirects them here with tokens in the URL hash.
	 * The Supabase client automatically exchanges these tokens for a session.
	 * We check if a session exists before allowing password reset.
	 */
	useEffect(() => {
		const checkRecoverySession = async () => {
			try {
				// Wait a moment for Supabase to process URL hash tokens (if present)
				// This handles the case where tokens are in the URL hash and need to be exchanged
				await new Promise((resolve) => setTimeout(resolve, 500));

				// Get current session
				// If user came from reset link, Supabase will have created a session from URL tokens
				const {
					data: { session },
					error,
				} = await supabase.auth.getSession();

				if (error) {
					console.error("[ResetPassword] ❌ Error getting session:", error);
					throw error;
				}

				// Check if session exists
				// Recovery sessions are created when users click password reset links
				if (session) {
					setHasRecoverySession(true);
				} else {
					// No session - user didn't come from a valid reset link
					toast.error(
						"Invalid or expired reset link. Please request a new password reset."
					);
					setTimeout(() => navigate("/"), 3000); // Redirect to home after 3 seconds
				}
			} catch (error) {
				console.error("[ResetPassword] ❌ Error checking recovery session:", error);
				toast.error("Error verifying reset link. Please try again.");
			} finally {
				setCheckingSession(false);
			}
		};

		checkRecoverySession();
	}, [navigate]);

	/**
	 * Handle password update
	 * Updates the user's password using Supabase Auth
	 */
	const handleResetPassword = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!password || !confirmPassword) return;

		// Validate that passwords match
		if (password !== confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}

		// Validate password length (minimum 6 characters as required by Supabase)
		if (password.length < 6) {
			toast.error("Password must be at least 6 characters long");
			return;
		}

		setLoading(true);

		try {
			// Update password using Supabase Auth
			// This works because we have a recovery session from the reset link
			const { error } = await supabase.auth.updateUser({
				password: password,
			});

			if (error) throw error;

			// Success - password has been updated
			console.log("[ResetPassword] ✅ Password updated successfully");
			toast.success("Password updated successfully! Redirecting to home...");

			// Redirect to home page after a short delay
			setTimeout(() => {
				navigate("/");
			}, 2000);
		} catch (error: any) {
			console.error("[ResetPassword] ❌ Error updating password:", error);
			toast.error(error.message || "Failed to update password. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	// Show loading state while checking for recovery session
	if (checkingSession) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">Verifying reset link...</p>
				</div>
			</div>
		);
	}

	// Show error if no valid recovery session
	if (!hasRecoverySession) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<Card className="max-w-md w-full">
					<CardHeader>
						<CardTitle>Invalid Reset Link</CardTitle>
						<CardDescription>
							This password reset link is invalid or has expired. Please request a new
							one.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button onClick={() => navigate("/")} className="w-full">
							Go to Home
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Show password reset form
	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			<Card className="max-w-md w-full">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
						<Lock className="w-6 h-6 text-primary" />
					</div>
					<CardTitle className="text-2xl">Reset Your Password</CardTitle>
					<CardDescription>
						Enter your new password below. Make sure it's at least 6 characters long.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleResetPassword} className="space-y-4">
						<div>
							<Label htmlFor="new-password">New Password</Label>
							<div className="relative mt-1">
								<Input
									id="new-password"
									type={showPassword ? "text" : "password"}
									placeholder="Enter new password (min. 6 characters)"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									minLength={6}
									className="pr-10"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
								>
									{showPassword ? (
										<EyeOff className="w-4 h-4" />
									) : (
										<Eye className="w-4 h-4" />
									)}
								</button>
							</div>
						</div>

						<div>
							<Label htmlFor="confirm-new-password">Confirm New Password</Label>
							<div className="relative mt-1">
								<Input
									id="confirm-new-password"
									type={showConfirmPassword ? "text" : "password"}
									placeholder="Confirm your new password"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									required
									minLength={6}
									className="pr-10"
								/>
								<button
									type="button"
									onClick={() => setShowConfirmPassword(!showConfirmPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
								>
									{showConfirmPassword ? (
										<EyeOff className="w-4 h-4" />
									) : (
										<Eye className="w-4 h-4" />
									)}
								</button>
							</div>
						</div>

						<Button type="submit" className="w-full" disabled={loading}>
							{loading ? "Updating Password..." : "Update Password"}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
