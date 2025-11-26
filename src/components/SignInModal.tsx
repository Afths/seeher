/**
 * SIGN IN MODAL COMPONENT
 *
 * Provides email/password authentication with the following features:
 * - Sign in with email and password
 * - Sign up for new accounts
 * - Password reset functionality
 *
 * Features:
 * - Toggle between sign in and sign up modes
 * - Email and password inputs with validation
 * - Password reset flow
 * - Loading states during authentication
 * - Error handling with toast notifications
 * - Form reset on close
 * - Automatic modal close on successful authentication
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mail, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { AuthMode } from "@/types/auth";

interface SignInModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export function SignInModal({ isOpen, onClose }: SignInModalProps) {
	// Current authentication mode (sign in, sign up, or password reset)
	const [mode, setMode] = useState<AuthMode>("signin");

	// Form input states
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [confirmPassword, setConfirmPassword] = useState<string>("");

	// Password visibility toggle (for password fields)
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

	// Loading state during authentication operations
	const [loading, setLoading] = useState<boolean>(false);

	// Success state for password reset - true after reset email is sent
	const [resetEmailSent, setResetEmailSent] = useState<boolean>(false);

	/**
	 * Handle modal close
	 * Resets all form state before closing
	 */
	const handleClose = () => {
		// Reset all form fields
		setEmail("");
		setPassword("");
		setConfirmPassword("");
		setShowPassword(false);
		setShowConfirmPassword(false);
		setResetEmailSent(false);
		setLoading(false);
		setMode("signin"); // Reset to sign in mode
		onClose();
	};

	/**
	 * Handle sign in with email and password
	 * Authenticates existing users using their email and password
	 */
	const handleSignIn = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email || !password) return;

		setLoading(true);

		try {
			// Sign in with email and password using Supabase Auth
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (error) {
				const msg = error.message.toLowerCase();

				if (msg.includes("email not confirmed")) {
					toast.error("Please confirm your email before signing in.");
					return;
				}

				if (msg.includes("invalid login credentials")) {
					toast.error("Incorrect email or password.");
					return;
				}

				throw error;
			}

			// Success - user is now authenticated
			// The AuthContext will automatically update via the auth state listener
			console.log("[SignInModal] ✅ Successfully signed in:", data);

			toast.success("Signed in!");
			handleClose(); // Close modal on successful sign in
		} catch (error: any) {
			console.error("[SignInModal] ❌ Error signing in:", error);

			// Show user-friendly error messages
			toast.error(error.message || "Failed to sign in");
		} finally {
			setLoading(false);
		}
	};

	/**
	 * Handle sign up with email and password
	 * Creates a new user account with email and password
	 */
	const handleSignUp = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email || !password || !confirmPassword) return;

		// Validate that passwords match
		if (password !== confirmPassword) {
			toast.error("Passwords do not match.");
			return;
		}

		// Validate password length (minimum 6 characters as required by Supabase)
		if (password.length < 6) {
			toast.error("Password must be at least 6 characters long.");
			return;
		}

		setLoading(true);

		try {
			// Sign up with email and password using Supabase Auth
			const { data, error } = await supabase.auth.signUp({
				email,
				password,
				options: {
					emailRedirectTo: `${window.location.origin}/`,
				},
			});

			if (error) {
				const msg = error.message.toLowerCase();

				if (msg.includes("already registered")) {
					toast.error(
						"An account already exists with this email. Please sign in instead."
					);
					setMode("signin");
					return;
				}

				throw error;
			}

			// Check if email confirmation is required
			// If data.session is null, it means email confirmation is required
			// The user needs to click the confirmation link in their email before they can sign in
			if (!data.session) {
				toast.success("Check your email to confirm your account before signing in.");
			} else {
				toast.success("Account created! You can now sign in.");
			}

			// Switch to sign in mode
			setMode("signin");
			setPassword("");
			setConfirmPassword("");
		} catch (error: any) {
			console.error("[SignInModal] ❌ Error signing up:", error);

			toast.error(error.message || "Failed to create account");
		} finally {
			setLoading(false);
		}
	};

	/**
	 * Handle password reset request
	 * Sends a password reset email to the user
	 */
	const handlePasswordReset = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email) return;

		setLoading(true);

		try {
			// Send password reset email via Supabase Auth
			const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
				redirectTo: `${window.location.origin}/reset-password`,
			});

			if (error) throw error;

			setResetEmailSent(true);

			console.log(
				"[SignInModal] ✅ Password reset email sent successfully (if an account exists with this email):",
				data
			);
			toast.success("If an account exists with this email, a reset link was sent.");
		} catch (error: any) {
			console.error("[SignInModal] ❌ Error sending password reset email:", error);
			toast.error(error.message || "Failed to send password reset email");
		} finally {
			setLoading(false);
		}
	};

	/**
	 * Switch to password reset mode
	 */
	const handleForgotPassword = () => {
		setMode("reset");
		setPassword("");
		setConfirmPassword("");
		setResetEmailSent(false);
	};

	/**
	 * Switch back to sign in mode from password reset
	 */
	const handleSwitchToSignIn = () => {
		setMode("signin");
		setResetEmailSent(false);
	};

	/**
	 * Switch to sign up mode
	 */
	const handleSwitchToSignUp = () => {
		setMode("signup");
		setPassword("");
		setConfirmPassword("");
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle className="text-2xl text-center">
						{mode === "signup"
							? "Create Account"
							: mode === "reset"
							? "Reset Password"
							: "Sign In"}
					</DialogTitle>
				</DialogHeader>

				{/* Password reset success state */}
				{resetEmailSent ? (
					<div className="text-center py-6">
						<Mail className="w-16 h-16 mx-auto mb-4 text-primary" />
						<h3 className="text-lg font-semibold mb-2">Check your inbox!</h3>
						<p className="text-muted-foreground mb-4">
							We've sent a password reset link to <strong>{email}</strong>
						</p>
						<p className="text-sm text-muted-foreground mb-4">
							Click the link in your email to reset your password. You can close this
							window.
						</p>
					</div>
				) : (
					<>
						{/* Sign in form */}
						{mode === "signin" && (
							<form onSubmit={handleSignIn} className="space-y-4">
								<div>
									<Label htmlFor="email-signin">Email address</Label>
									{/* Email address field */}
									<Input
										id="email-signin"
										type="email"
										placeholder="Enter your email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										required
										className="mt-1"
									/>
								</div>

								<div>
									<Label htmlFor="password-signin">Password</Label>
									<div className="relative mt-1">
										{/* Password field */}
										<Input
											id="password-signin"
											type={showPassword ? "text" : "password"}
											placeholder="Enter your password"
											value={password}
											onChange={(e) => setPassword(e.target.value)}
											required
											className="pr-10"
										/>
										{/* Password visibility toggle */}
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

								{/* Forgot password link */}
								<div className="text-right">
									<button
										type="button"
										onClick={handleForgotPassword}
										className="text-sm text-primary hover:underline"
									>
										Forgot password?
									</button>
								</div>

								{/* Sign in button */}
								<Button
									type="submit"
									size="sm"
									className="w-full"
									disabled={loading}
								>
									{loading ? "Signing in..." : "Sign In"}
								</Button>

								{/* Switch to sign up */}
								<div className="text-center text-sm text-muted-foreground">
									Don't have an account?{" "}
									<button
										type="button"
										onClick={handleSwitchToSignUp}
										className="text-primary hover:underline font-medium"
									>
										Sign up
									</button>
								</div>
							</form>
						)}

						{/* Sign up form */}
						{mode === "signup" && (
							<form onSubmit={handleSignUp} className="space-y-4">
								<div>
									<Label htmlFor="email-signup">Email address</Label>
									{/* Email address field */}
									<Input
										id="email-signup"
										type="email"
										placeholder="Enter your email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										required
										className="mt-1"
									/>
								</div>

								<div>
									<Label htmlFor="password-signup">Password</Label>
									<div className="relative mt-1">
										{/* Password field */}
										<Input
											id="password-signup"
											type={showPassword ? "text" : "password"}
											placeholder="Create a password (min. 6 characters)"
											value={password}
											onChange={(e) => setPassword(e.target.value)}
											required
											minLength={6}
											className="pr-10"
										/>
										{/* Password visibility toggle */}
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
									<Label htmlFor="confirm-password">Confirm Password</Label>
									<div className="relative mt-1">
										{/* Confirm password field */}
										<Input
											id="confirm-password"
											type={showConfirmPassword ? "text" : "password"}
											placeholder="Confirm your password"
											value={confirmPassword}
											onChange={(e) => setConfirmPassword(e.target.value)}
											required
											minLength={6}
											className="pr-10"
										/>
										{/* Confirm assword visibility toggle */}
										<button
											type="button"
											onClick={() =>
												setShowConfirmPassword(!showConfirmPassword)
											}
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

								{/* Sign up button */}
								<Button
									type="submit"
									size="sm"
									className="w-full"
									disabled={loading}
								>
									{loading ? "Creating account..." : "Create Account"}
								</Button>

								{/* Switch to sign in */}
								<div className="text-center text-sm text-muted-foreground">
									Already have an account?{" "}
									<button
										type="button"
										onClick={() => {
											setMode("signin");
											setPassword("");
											setConfirmPassword("");
										}}
										className="text-primary hover:underline font-medium"
									>
										Sign in
									</button>
								</div>
							</form>
						)}

						{/* Password reset form */}
						{mode === "reset" && (
							<form onSubmit={handlePasswordReset} className="space-y-4">
								<div>
									<Label htmlFor="email-reset">Email address</Label>
									{/* Email address field */}
									<Input
										id="email-reset"
										type="email"
										placeholder="Enter your email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										required
										className="mt-1"
									/>
									<p className="text-xs text-muted-foreground mt-2">
										We'll send you a link to reset your password.
									</p>
								</div>

								{/* Send reset link button */}
								<Button
									type="submit"
									size="sm"
									className="w-full"
									disabled={loading}
								>
									{loading ? "Sending..." : "Send Reset Link"}
								</Button>

								{/* Back to sign in */}
								<div className="text-center">
									<button
										type="button"
										onClick={handleSwitchToSignIn}
										className="text-sm text-primary hover:underline"
									>
										Back to Sign In
									</button>
								</div>
							</form>
						)}
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
