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
		const { email, name }: SubmissionEmailRequest = await req.json();

		if (!email || !name) {
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
			return new Response(JSON.stringify({ error: "Email service not configured" }), {
				status: 500,
				headers: { "Content-Type": "application/json", ...corsHeaders },
			});
		}

		// Send submission confirmation email via Loop.so API
		const loopsResponse = await fetch("https://app.loops.so/api/v1/transactional", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${loopsApiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				transactionalId: Deno.env.get("LOOPS_SUBMISSION_EMAIL_ID"),
				email: email,
				dataVariables: {
					name: name,
				},
			}),
		});

		if (!loopsResponse.ok) {
			const errorText = await loopsResponse.text();
			console.error("[send-submission-email] ❌ Loop.so API error:", errorText);
			throw new Error(`Failed to send email: ${loopsResponse.status} ${errorText}`);
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
