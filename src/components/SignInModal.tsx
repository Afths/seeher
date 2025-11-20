/**
 * SIGN IN MODAL COMPONENT
 *
 * Provides authentication via magic link (passwordless sign-in).
 * Users enter their email and receive a secure link to sign in.
 *
 * Features:
 * - Email input with validation
 * - Magic link sending via Supabase Auth
 * - Success state showing confirmation message
 * - Loading states during link sending
 * - Error handling with toast notifications
 * - Form reset on close
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

interface SignInModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export function SignInModal({ isOpen, onClose }: SignInModalProps) {
	// Email input state
	const [email, setEmail] = useState<string>("");

	// Loading state while sending magic link
	const [loading, setLoading] = useState<boolean>(false);

	// Success state - true after magic link is sent
	const [emailSent, setEmailSent] = useState<boolean>(false);

	/**
	 * Handle sending magic link
	 * Sends passwordless sign-in link to user's email via Supabase Auth
	 */
	const handleSendMagicLink = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email) return;

		setLoading(true);

		try {
			const { error } = await supabase.auth.signInWithOtp({
				email,
				options: {
					emailRedirectTo: `${window.location.origin}/`,
				},
			});

			if (error) throw error;

			// Success - show confirmation message
			setEmailSent(true);
			toast.success("Check your inbox! We've sent you a magic link to sign in.");
		} catch (error: any) {
			console.error("Error sending magic link:", error);
			toast.error(error.message || "Failed to send magic link");
		} finally {
			setLoading(false);
		}
	};

	/**
	 * Handle modal close
	 * Resets all form state before closing
	 */
	const handleClose = () => {
		setEmail("");
		setEmailSent(false);
		setLoading(false);
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle className="text-2xl text-center">Sign In</DialogTitle>
				</DialogHeader>

				{/* Success state - shown after magic link is sent */}
				{emailSent ? (
					<div className="text-center py-6">
						<Mail className="w-16 h-16 mx-auto mb-4 text-primary" />
						<h3 className="text-lg font-semibold mb-2">Check your inbox!</h3>
						<p className="text-muted-foreground mb-4">
							We've sent a magic link to <strong>{email}</strong>
						</p>
						<p className="text-sm text-muted-foreground">
							Click the link in your email to sign in. You can close this window.
						</p>
						<Button variant="outline" onClick={handleClose} className="mt-4" size="sm">
							Close
						</Button>
					</div>
				) : (
					/* Email input form */
					<form onSubmit={handleSendMagicLink} className="space-y-4">
						<div>
							<Label htmlFor="email">Email address</Label>
							<Input
								id="email"
								type="email"
								placeholder="Enter your email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								className="mt-1"
							/>
						</div>

						<Button type="submit" size="sm" className="w-full" disabled={loading}>
							{loading ? "Sending..." : "Send link"}
						</Button>

						<p className="text-xs text-muted-foreground text-center">
							We'll send you a secure link to sign in without a password.
						</p>
					</form>
				)}
			</DialogContent>
		</Dialog>
	);
}
