// A POST endpoint that sends a submission confirmation email to the user who submitted their profile.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubmissionEmailRequest {
	email: string;
	name: string;
}

const handler = async (req: Request): Promise<Response> => {
	// Handle CORS preflight requests
	if (req.method === "OPTIONS") {
		return new Response(null, { headers: corsHeaders });
	}

	try {
		// Unpacking the payload
		const { email, name }: SubmissionEmailRequest = await req.json();

		if (!email || !name) {
			console.error(
				"[send-submission-email] ❌ Email and name are required as part of the payload"
			);

			return new Response(JSON.stringify({ error: "Email and name are required" }), {
				status: 400,
				headers: { "Content-Type": "application/json", ...corsHeaders },
			});
		}

		const loopsApiKey = Deno.env.get("LOOPS_API_KEY");
		if (!loopsApiKey) {
			console.error(
				"[send-submission-email] ❌ LOOPS_API_KEY environment variable is not set"
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

		const loopsEmailId = Deno.env.get("LOOPS_SUBMISSION_EMAIL_ID");
		if (!loopsEmailId) {
			console.error(
				"[send-submission-email] ❌ LOOPS_SUBMISSION_EMAIL_ID environment variable is not set"
			);

			return new Response(
				JSON.stringify({
					error: "Email service not configured",
					details: "LOOPS_SUBMISSION_EMAIL_ID environment variable is missing",
				}),
				{
					status: 500,
					headers: { "Content-Type": "application/json", ...corsHeaders },
				}
			);
		}

		// Send submission confirmation email via Loop.so API
		const loopsResponse = await fetch("https://app.loops.so/api/v1/transactional", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${loopsApiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				transactionalId: loopsEmailId,
				email: email,
				dataVariables: {
					name: name,
				},
			}),
		});

		if (!loopsResponse.ok) {
			const errorText = await loopsResponse.text();

			console.error("[send-submission-email] ❌ Loop.so API error:", errorText);

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
		console.log("[send-submission-email] ✅ Submission email sent successfully:", result);

		return new Response(JSON.stringify({ success: true, result }), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
				...corsHeaders,
			},
		});
	} catch (error: any) {
		console.error("[send-submission-email] ❌ Error:", error);
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: { "Content-Type": "application/json", ...corsHeaders },
		});
	}
};

serve(handler);
