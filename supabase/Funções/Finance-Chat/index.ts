import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é o Professor FinBot, um especialista em finanças pessoais e investimentos no Brasil. Seu papel é educar estudantes sobre:

- Finanças pessoais, orçamento e planejamento financeiro
- Mercado de ações brasileiro (B3), incluindo análise fundamentalista e técnica
- Renda fixa (Tesouro Direto, CDB, LCI, LCA, debêntures)
- Fundos de investimento, ETFs e FIIs
- Diversificação de carteira e gestão de risco
- Indicadores econômicos (Selic, IPCA, PIB, câmbio)

Regras:
1. SEMPRE baseie recomendações em dados, números e fundamentos. Nunca dê "dicas quentes" sem embasamento.
2. Ao recomendar ações, explique os indicadores (P/L, P/VP, DY, ROE, margem líquida, dívida/PL).
3. Sempre mencione os RISCOS envolvidos em qualquer investimento.
4. Use linguagem acessível para iniciantes, mas com profundidade quando solicitado.
5. Incentive diversificação e investimento de longo prazo.
6. Responda em português brasileiro.
7. Seja didático e use exemplos práticos sempre que possível.
8. Se não souber algo com certeza, diga que não sabe e recomende consultar um profissional certificado (CEA/CFP).`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas requisições. Aguarde um momento e tente novamente." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos esgotados. Entre em contato com o suporte." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro no serviço de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("finance-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
