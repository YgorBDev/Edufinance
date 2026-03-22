import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const BRAPI_BASE = "https://brapi.dev/api";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const endpoint = url.searchParams.get("endpoint") || "quote/list";
    const params = url.searchParams.get("params") || "";

    const brapiToken = Deno.env.get("BRAPI_API_TOKEN") || "tXYG3ReGee3C6sJK4ve1Uk";

    // Check if this is a multi-ticker quote request
    const quoteMatch = endpoint.match(/^quote\/(.+)$/);
    if (quoteMatch) {
      const tickers = quoteMatch[1].split(",");

      // Batch: 1 ticker per request due to free plan limit
      const allResults = [];
      for (const ticker of tickers) {
        try {
          const separator = params ? "&" : "";
          const tokenParam = brapiToken ? `${separator}token=${brapiToken}` : "";
          const brapiUrl = `${BRAPI_BASE}/quote/${ticker}${params ? `?${params}` : "?"}${tokenParam}`;

          const response = await fetch(brapiUrl, {
            headers: { "Accept": "application/json" },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.results && data.results.length > 0) {
              allResults.push(...data.results);
            }
          }
        } catch (e) {
          console.error(`Error fetching ${ticker}:`, e);
        }
      }

      return new Response(JSON.stringify({ results: allResults }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Non-quote endpoints: pass through as before
    const separator = params ? "&" : "";
    const tokenParam = brapiToken ? `${separator}token=${brapiToken}` : "";
    const brapiUrl = `${BRAPI_BASE}/${endpoint}${params ? `?${params}` : "?"}${tokenParam}`;

    const response = await fetch(brapiUrl, {
      headers: { "Accept": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Brapi API error [${response.status}]: ${await response.text()}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Brapi proxy error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
