// A POST endpoint that sends notification emails to all admins when a user submits a profile for review.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
	// Handle CORS preflight requests
	if (req.method === "OPTIONS") {
		return new Response(null, { headers: corsHeaders });
	}

	try {
		// No payload required - we fetch admin info from the database

		const loopsApiKey = Deno.env.get("LOOPS_API_KEY");
		if (!loopsApiKey) {
			console.error(
				"[send-admin-notification-email] ❌ LOOPS_API_KEY environment variable is not set"
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

		const loopsEmailId = Deno.env.get("LOOPS_ADMIN_NOTIFICATION_EMAIL_ID");
		if (!loopsEmailId) {
			console.error(
				"[send-admin-notification-email] ❌ LOOPS_ADMIN_NOTIFICATION_EMAIL_ID environment variable is not set"
			);

			return new Response(
				JSON.stringify({
					error: "Email service not configured",
					details: "LOOPS_ADMIN_NOTIFICATION_EMAIL_ID environment variable is missing",
				}),
				{
					status: 500,
					headers: { "Content-Type": "application/json", ...corsHeaders },
				}
			);
		}

		// Get app URL for admin dashboard link
		const appUrl = Deno.env.get("APP_URL");
		if (!appUrl) {
			console.error(
				"[send-admin-notification-email] ❌ APP_URL environment variable is not set"
			);
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

		// Construct admin dashboard URL with query parameter
		// The frontend will detect when the admin needs to sign in and open the appropriate modal
		const adminDashboardUrl = `${appUrl}/?adminDashboard=true`;

		// Create Supabase client with service role key to query admins table
		const supabaseUrl = Deno.env.get("SUPABASE_URL");
		const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

		if (!supabaseUrl || !supabaseServiceKey) {
			console.error(
				"[send-admin-notification-email] ❌ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables are not set"
			);
			return new Response(
				JSON.stringify({
					error: "Database service not configured",
					details:
						"SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables are missing",
				}),
				{
					status: 500,
					headers: { "Content-Type": "application/json", ...corsHeaders },
				}
			);
		}

		const supabase = createClient(supabaseUrl, supabaseServiceKey);

		// Fetch all admins (email and name) from the database
		const { data: admins, error: adminError } = await supabase
			.from("admins")
			.select("email, name");

		if (adminError) {
			console.error("[send-admin-notification-email] ❌ Error fetching admins:", adminError);
			return new Response(
				JSON.stringify({
					error: "Failed to fetch admins",
					details: adminError.message,
				}),
				{
					status: 500,
					headers: { "Content-Type": "application/json", ...corsHeaders },
				}
			);
		}

		if (!admins || admins.length === 0) {
			console.warn("[send-admin-notification-email] ⚠️ No admins found in database");
			return new Response(
				JSON.stringify({
					success: true,
					message: "No admins found, skipping notification",
					sentCount: 0,
				}),
				{
					status: 200,
					headers: { "Content-Type": "application/json", ...corsHeaders },
				}
			);
		}

		// Send notification email to each admin
		const emailPromises = admins.map(async (admin) => {
			try {
				// Use the name field directly from the database
				const adminName = admin.name;

				const loopsResponse = await fetch("https://app.loops.so/api/v1/transactional", {
					method: "POST",
					headers: {
						Authorization: `Bearer ${loopsApiKey}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						transactionalId: loopsEmailId,
						email: admin.email,
						dataVariables: {
							admin: adminName,
							admin_dashboard_url: adminDashboardUrl,
						},
					}),
				});

				if (!loopsResponse.ok) {
					const errorText = await loopsResponse.text();
					console.error(
						`[send-admin-notification-email] ❌ Failed to send email to ${admin.email}:`,
						errorText
					);
					return { success: false, email: admin.email, error: errorText };
				}

				const result = await loopsResponse.json();
				console.log(
					`[send-admin-notification-email] ✅ Notification email sent to ${admin.email}`
				);
				return { success: true, email: admin.email, result };
			} catch (error: any) {
				console.error(
					`[send-admin-notification-email] ❌ Error sending email to ${admin.email}:`,
					error
				);
				return { success: false, email: admin.email, error: error.message };
			}
		});

		// Wait for all emails to be sent
		const results = await Promise.all(emailPromises);
		const successCount = results.filter((r) => r.success).length;
		const failureCount = results.filter((r) => !r.success).length;

		console.log(
			`[send-admin-notification-email] ✅ Sent ${successCount} notification emails, ${failureCount} failed`
		);

		return new Response(
			JSON.stringify({
				success: true,
				sentCount: successCount,
				failedCount: failureCount,
				results,
			}),
			{
				status: 200,
				headers: {
					"Content-Type": "application/json",
					...corsHeaders,
				},
			}
		);
	} catch (error: any) {
		console.error("[send-admin-notification-email] ❌ Error:", error);
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: { "Content-Type": "application/json", ...corsHeaders },
		});
	}
};

serve(handler);
