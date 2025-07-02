import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface MagicLinkRequest {
  email: string;
  name: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name }: MagicLinkRequest = await req.json();

    // Generate a magic link URL (you'll need to implement the actual magic link generation)
    const magicLinkUrl = `${Deno.env.get("SUPABASE_URL")}/auth/v1/magiclink?email=${encodeURIComponent(email)}`;

    const emailResponse = await resend.emails.send({
      from: "SeeHer <onboarding@resend.dev>",
      to: [email],
      subject: "Congratulations! Your profile is live on SeeHer!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; text-align: center;">Congratulations, ${name}!</h1>
          
          <p style="font-size: 16px; line-height: 1.6; color: #666;">
            Great news! Your profile has been approved and is now live on SeeHer.
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #666;">
            Click the button below to validate your account and see your profile:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${magicLinkUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              Validate Your Account & See Your Profile
            </a>
          </div>
          
          <p style="font-size: 14px; line-height: 1.6; color: #999; text-align: center;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${magicLinkUrl}" style="color: #007bff;">${magicLinkUrl}</a>
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #666; margin-top: 30px;">
            Welcome to the SeeHer community!
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #666;">
            Best regards,<br>
            The SeeHer Team
          </p>
        </div>
      `,
    });

    console.log("Magic link email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-magic-link function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);