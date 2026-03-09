import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const DOMAINS = [
  "Security",
  "Economy",
  "Politics",
  "Technology",
  "Environment",
  "Business",
  "Health",
  "Education",
  "Culture",
  "Sports",
  "Science",
  "General"
];

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { content } = await req.json();
    
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Content is required and must be a non-empty string" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a semantic text classifier. Your task is to classify the given text into one or two domains from this list: ${DOMAINS.join(", ")}.

Rules:
1. Always return a primary domain - never leave it empty
2. If the text clearly relates to a second domain, include it as secondary_domain
3. If the text is ambiguous, choose the best fitting domain and assign lower confidence
4. Confidence is a percentage (0-100) reflecting how certain you are
5. For ambiguous or general text, use "General" as primary with appropriate low confidence
6. Extract 3-5 relevant keywords from the text. Keywords should be short (1-2 words), lowercase, and capture the key topics/concepts

Return ONLY valid JSON in this exact format:
{
  "primary_domain": "string",
  "secondary_domain": "string or null",
  "confidence": number,
  "reasoning": "brief explanation",
  "suggested_keywords": ["keyword1", "keyword2", "keyword3"]
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Classify this text:\n\n${content}` }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service payment required." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI classification failed");
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;
    
    if (!aiResponse) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response from AI
    let classification;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, aiResponse];
      const jsonStr = jsonMatch[1].trim();
      classification = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiResponse);
      // Fallback to General with low confidence if parsing fails
      classification = {
        primary_domain: "General",
        secondary_domain: null,
        confidence: 35,
        reasoning: "Classification uncertain"
      };
    }

    // Validate and sanitize the response
    const suggestedKeywords = Array.isArray(classification.suggested_keywords)
      ? classification.suggested_keywords
          .filter((k: unknown) => typeof k === 'string')
          .map((k: string) => k.trim().toLowerCase())
          .slice(0, 5)
      : [];

    const result = {
      primary_domain: DOMAINS.includes(classification.primary_domain) 
        ? classification.primary_domain 
        : "General",
      secondary_domain: classification.secondary_domain && DOMAINS.includes(classification.secondary_domain)
        ? classification.secondary_domain
        : null,
      confidence: typeof classification.confidence === 'number' 
        ? Math.min(100, Math.max(0, Math.round(classification.confidence)))
        : 50,
      reasoning: classification.reasoning || "Classification complete",
      suggested_keywords: suggestedKeywords
    };

    console.log("Classification result:", result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Classification error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred",
        // Provide fallback classification on error
        fallback: {
          primary_domain: "General",
          secondary_domain: null,
          confidence: 25,
          reasoning: "Error during classification"
        }
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
