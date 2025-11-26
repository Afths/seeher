// A POST endpoint that sends a rejection email to the user when their profile is rejected.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RejectionEmailRequest {
	email: string;
	name: string;
	rejection_explanation?: string; // Optional rejection reason
}

const handler = async (req: Request): Promise<Response> => {
	// Handle CORS preflight requests
	if (req.method === "OPTIONS") {
		return new Response(null, { headers: corsHeaders });
	}

	try {
		const { email, name, rejection_explanation }: RejectionEmailRequest = await req.json();

		if (!email || !name) {
			console.error(
				"[send-rejection-email] ❌ Email and name are required as part of the payload"
			);

			return new Response(JSON.stringify({ error: "Email and name are required" }), {
				status: 400,
				headers: { "Content-Type": "application/json", ...corsHeaders },
			});
		}

		const loopsApiKey = Deno.env.get("LOOPS_API_KEY");
		if (!loopsApiKey) {
			console.error(
				"[send-rejection-email] ❌ LOOPS_API_KEY environment variable is not set"
			);

			return new Response(
				JSON.stringify({
					error: "Email service not configured",
					details: "LOOPS_API_KEY environment variable is missing",
				}),
				{
					status: 500,
					headers: { "Content-Type": "application/json", ...corsHeaders },
				}
			);
		}

		const loopsEmailId = Deno.env.get("LOOPS_REJECTION_EMAIL_ID");
		if (!loopsEmailId) {
			console.error(
				"[send-rejection-email] ❌ LOOPS_REJECTION_EMAIL_ID environment variable is not set"
			);

			return new Response(
				JSON.stringify({
					error: "Email service not configured",
					details: "LOOPS_REJECTION_EMAIL_ID environment variable is missing",
				}),
				{
					status: 500,
					headers: { "Content-Type": "application/json", ...corsHeaders },
				}
			);
		}

		// Get app URL for profile resubmit link
		const appUrl = Deno.env.get("APP_URL");
		if (!appUrl) {
			console.error("[send-rejection-email] ❌ APP_URL environment variable is not set");
			return new Response(
				JSON.stringify({
					error: "App URL not configured",
					details: "APP_URL environment variable is missing",
				}),
				{
					status: 500,
					headers: { "Content-Type": "application/json", ...corsHeaders },
				}
			);
		}

		// Construct resubmit URL with query parameter to open profile submission modal
		// The frontend will detect when users need to sign in and open the appropriate modals
		const resubmitUrl = `${appUrl}/?resubmit=true`;

		// Send rejection email via Loop.so API
		const loopsResponse = await fetch("https://app.loops.so/api/v1/transactional", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${loopsApiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				transactionalId: Deno.env.get("LOOPS_REJECTION_EMAIL_ID"),
				email: email,
				dataVariables: {
					name: name,
					rejection_explanation: rejection_explanation,
					resubmit_url: resubmitUrl,
				},
			}),
		});

		if (!loopsResponse.ok) {
			const errorText = await loopsResponse.text();

			console.error("[send-rejection-email] ❌ Loop.so API error:", errorText);

			return new Response(
				JSON.stringify({
					error: "Failed to send email",
					loopsError: errorText,
				}),
				{
					status: 500,
					headers: { "Content-Type": "application/json", ...corsHeaders },
				}
			);
		}

		const result = await loopsResponse.json();

		console.log("[send-rejection-email] ✅ Rejection email sent successfully:", result);

		return new Response(JSON.stringify({ success: true, result }), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
				...corsHeaders,
			},
		});
	} catch (error: any) {
		console.error("[send-rejection-email] ❌ Error:", error);

		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: { "Content-Type": "application/json", ...corsHeaders },
		});
	}
};

serve(handler);
