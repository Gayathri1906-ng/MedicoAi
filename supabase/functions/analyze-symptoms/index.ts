// File: functions/analyze-symptoms/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    const { symptoms, severity, user_id } = await req.json();
    if (!symptoms || !user_id) {
      return new Response(JSON.stringify({
        error: "Symptoms and user_id are required"
      }), {
        status: 400,
        headers: corsHeaders
      });
    }
    console.log("🔍 Analyzing symptoms:", symptoms);
    // Get your new OpenAI API key from Supabase environment variables
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      console.error("❌ OPENAI_API_KEY missing");
      return new Response(JSON.stringify({
        error: "Server missing API key"
      }), {
        status: 500,
        headers: corsHeaders
      });
    }
    // Call OpenAI API
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a medical assistant. Respond only in JSON with the following fields:
summary, conditions (array), actions (array), when_to_visit, risk_level, medicines (array).`
          },
          {
            role: "user",
            content: `Analyze these symptoms: ${symptoms}. Severity: ${severity}`
          }
        ],
        temperature: 0.7
      })
    });
    const resultText = await openaiRes.text();
    console.log("🔍 OpenAI raw response:", resultText);
    if (!openaiRes.ok) {
      return new Response(JSON.stringify({
        error: "OpenAI request failed",
        details: resultText
      }), {
        status: 500,
        headers: corsHeaders
      });
    }
    const result = JSON.parse(resultText);
    const aiOutput = JSON.parse(result.choices[0].message.content);
    return new Response(JSON.stringify(aiOutput), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (err) {
    console.error("❌ Server error:", err);
    return new Response(JSON.stringify({
      error: err.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
