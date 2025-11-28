import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
serve(async (req)=>{
  if (req.method === "OPTIONS") {
    // Handle CORS preflight request
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  }
  // Your actual POST handling
  if (req.method === "POST") {
    const body = await req.json();
    // TODO: Process the uploaded image
    const result = {
      message: "Image processed successfully!"
    };
    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
  return new Response("Method Not Allowed", {
    status: 405
  });
});
