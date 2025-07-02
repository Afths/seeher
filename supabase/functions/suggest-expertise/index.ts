import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get profiles without areas of expertise
    const { data: profiles, error: fetchError } = await supabase
      .from('women')
      .select('id, name, short_bio, long_bio, job_title, company_name')
      .or('areas_of_expertise.is.null,areas_of_expertise.eq.{}')
      .eq('status', 'APPROVED');

    if (fetchError) {
      throw new Error(`Failed to fetch profiles: ${fetchError.message}`);
    }

    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'No profiles found that need expertise suggestions',
        updatedCount: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let updatedCount = 0;

    for (const profile of profiles) {
      const bioText = [
        profile.short_bio,
        profile.long_bio,
        profile.job_title,
        profile.company_name
      ].filter(Boolean).join(' ');

      if (!bioText.trim()) {
        continue; // Skip profiles with no bio content
      }

      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `You are an expert at analyzing professional profiles and suggesting relevant areas of expertise. Based on the provided bio information, suggest up to 3 specific, professional areas of expertise that best match this person's background. 

Return ONLY a JSON array of strings with the expertise areas, no additional text or explanation. Examples of good expertise areas: "Digital Marketing", "Software Engineering", "Financial Analysis", "Human Resources", "Product Management", "Data Science", "Public Relations", "Legal Compliance", "UX Design", "Operations Management".`
              },
              {
                role: 'user',
                content: `Analyze this professional profile and suggest 3 areas of expertise:\n\n${bioText}`
              }
            ],
            temperature: 0.3,
            max_tokens: 200,
          }),
        });

        if (!response.ok) {
          console.error(`OpenAI API error for profile ${profile.id}:`, response.status);
          continue;
        }

        const data = await response.json();
        const suggestedExpertise = JSON.parse(data.choices[0].message.content);

        if (Array.isArray(suggestedExpertise) && suggestedExpertise.length > 0) {
          const { error: updateError } = await supabase
            .from('women')
            .update({ areas_of_expertise: suggestedExpertise.slice(0, 3) })
            .eq('id', profile.id);

          if (updateError) {
            console.error(`Failed to update profile ${profile.id}:`, updateError.message);
          } else {
            updatedCount++;
            console.log(`Updated ${profile.name} with expertise: ${suggestedExpertise.join(', ')}`);
          }
        }
      } catch (aiError) {
        console.error(`AI analysis error for profile ${profile.id}:`, aiError.message);
        continue;
      }

      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return new Response(JSON.stringify({ 
      message: `Successfully updated ${updatedCount} profiles with suggested expertise areas`,
      updatedCount,
      totalProcessed: profiles.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in suggest-expertise function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to process expertise suggestions',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});