import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-04-10" });

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { appId, buyerEmail, buyerName, affiliationCode, installments } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error(`Missing env: url=${!!supabaseUrl} key=${!!serviceRoleKey}`);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: app, error } = await supabase
      .from("apps")
      .select("*")
      .eq("id", appId)
      .single();

    if (error || !app) {
      throw new Error(`App nao encontrado: erro=${error?.message} codigo=${error?.code} appId=${appId}`);
    }

    const amountCents = Math.round(app.price_monthly * 100);
    const origin = req.headers.get("origin") || "https://sinkronize.vercel.app";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: buyerEmail,
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: app.name,
              description: app.tagline || `Assinatura mensal - ${app.name}`,
              images: app.icon_url ? [app.icon_url] : [],
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/checkout/${app.slug}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/${app.slug}`,
      metadata: {
        app_id: appId,
        buyer_email: buyerEmail,
        buyer_name: buyerName,
        affiliation_code: affiliationCode || "",
        installments: String(installments || 1),
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
