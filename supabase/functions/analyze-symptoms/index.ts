// File: supabase/functions/analyze-symptoms/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ✅ CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, supabase-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

// Initialize Supabase client
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

serve(async (req) => {
  // ✅ Preflight handling
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Parse request body
    const { symptoms, severity, user_id } = await req.json();

    if (!symptoms || !user_id) {
      return new Response(
        JSON.stringify({ error: "symptoms and user_id are required" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    // ---------- OPENAI PROMPT ----------
    const messages = [
      {
        role: "system",
        content: `
You are a clinical symptom-analysis assistant.

STRICT RULES:
1. Provide condition-specific guidance ONLY.
2. DO NOT include COVID-19 or pandemic/vaccination advice
   unless symptoms explicitly suggest COVID (loss of taste/smell, exposure, severe breathing difficulty).
3. Focus on the MOST LIKELY common clinical conditions.
4. Precautions and prevention must be tailored to EACH condition.
5. Avoid definitive diagnosis; this is informational support only.
6. Use simple, realistic medical guidance.

Return ONLY valid JSON in this exact format:

{
  "summary": "string",
  "conditions": ["string"],
  "actions": ["string"],
  "precautions": ["string"],
  "prevention": ["string"],
  "when_to_visit": "string",
  "risk_level": "low | medium | high",
  "medicines": ["string"]
}
        `,
      },
      {
        role: "user",
        content: `Symptoms: ${symptoms}\nSeverity: ${severity || "medium"}`,
      },
    ];

    // ---------- CALL OPENAI ----------
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.6,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      throw new Error("Failed to analyze symptoms");
    }

    const aiResponse = await response.json();
    const aiContent = aiResponse.choices[0]?.message?.content || "";

    // ---------- PARSE AI JSON ----------
    const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid AI JSON response");

    const analysisResult: any = JSON.parse(jsonMatch[0]);

    // Remove any unwanted generic public-health advice
    analysisResult.precautions = (analysisResult.precautions || []).filter(
      (p: string) => !p.toLowerCase().includes("covid") && !p.toLowerCase().includes("vaccine")
    );

    analysisResult.prevention = (analysisResult.prevention || []).filter(
      (p: string) => !p.toLowerCase().includes("covid") && !p.toLowerCase().includes("vaccine")
    );

    // Normalize risk level
    analysisResult.risk_level =
      ["low", "medium", "high"].includes(analysisResult.risk_level?.toLowerCase())
        ? analysisResult.risk_level.toLowerCase()
        : "medium";

    // ---------- SAVE TO DATABASE ----------
    const { error: dbError } = await supabase.from("analyses").insert([
      {
        user_id,
        symptoms,
        risk_level: analysisResult.risk_level,
        analysis_result: analysisResult,
        created_at: new Date().toISOString(),
      },
    ]);

    if (dbError) {
      console.error("Supabase insert error:", dbError);
      throw new Error("Failed to save analysis");
    }

    // ---------- RETURN RESPONSE ----------
    return new Response(JSON.stringify(analysisResult), { headers: corsHeaders });
  } catch (err: any) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});
