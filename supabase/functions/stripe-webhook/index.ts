import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-04-10" });
const PLATFORM_FEE_PCT = 9.9;

Deno.serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!
    );
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const meta = session.metadata!;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const appId = meta.app_id;
  const buyerEmail = meta.buyer_email;
  const buyerName = meta.buyer_name;
  const affiliationCode = meta.affiliation_code || null;
  const installments = parseInt(meta.installments || "1");

  // Fetch app
  const { data: app } = await supabase.from("apps").select("*").eq("id", appId).single();
  if (!app) return new Response("App not found", { status: 404 });

  const amount = parseFloat(app.price_monthly);
  const platformAmount = parseFloat((amount * PLATFORM_FEE_PCT / 100).toFixed(2));
  const afterPlatform = amount - platformAmount;
  const commissionPct = parseFloat(app.commission_pct);

  let affiliateId = null;
  let affiliateAmount = 0;

  if (affiliationCode) {
    const { data: aff } = await supabase
      .from("affiliations")
      .select("*")
      .eq("code", affiliationCode)
      .single();
    if (aff && aff.app_id === appId) {
      affiliateId = aff.affiliate_id;
      affiliateAmount = parseFloat((afterPlatform * commissionPct / 100).toFixed(2));
      await supabase.from("affiliations").update({
        sales: aff.sales + 1,
        earned: aff.earned + affiliateAmount,
      }).eq("code", affiliationCode);
    }
  }

  const producerAmount = parseFloat((afterPlatform - affiliateAmount).toFixed(2));

  // Create sale record
  const { data: sale } = await supabase.from("sales").insert({
    app_id: appId,
    app_name: app.name,
    buyer_email: buyerEmail.toLowerCase(),
    buyer_name: buyerName,
    amount,
    installments,
    installment_amount: parseFloat((amount / installments).toFixed(2)),
    producer_id: app.producer_id,
    affiliate_id: affiliateId,
    affiliation_code: affiliationCode,
    producer_amount: producerAmount,
    affiliate_amount: affiliateAmount,
    platform_amount: platformAmount,
    status: "paid",
    stripe_session_id: session.id,
  }).select().single();

  // Update app subscribers
  await supabase.from("apps").update({ subscribers: app.subscribers + 1 }).eq("id", appId);

  // Update producer balance
  if (app.producer_id) {
    const { data: prod } = await supabase.from("profiles").select("balance").eq("id", app.producer_id).single();
    if (prod) {
      await supabase.from("profiles").update({ balance: prod.balance + producerAmount }).eq("id", app.producer_id);
      await supabase.from("notifications").insert({
        user_id: app.producer_id,
        title: "Nova venda!",
        message: `${buyerName} assinou ${app.name} (+R$ ${producerAmount.toFixed(2)})`,
      });
    }
  }

  // Update affiliate balance
  if (affiliateId) {
    const { data: aff } = await supabase.from("profiles").select("balance, affiliate_tier").eq("id", affiliateId).single();
    if (aff) {
      const newBalance = aff.balance + affiliateAmount;
      const tier = newBalance >= 5000 ? "ouro" : newBalance >= 1000 ? "prata" : "bronze";
      await supabase.from("profiles").update({ balance: newBalance, affiliate_tier: tier }).eq("id", affiliateId);
      await supabase.from("notifications").insert({
        user_id: affiliateId,
        title: "Comissão recebida!",
        message: `Você ganhou R$ ${affiliateAmount.toFixed(2)} com a venda de ${app.name}`,
      });
    }
  }

  return new Response(JSON.stringify({ received: true, sale_id: sale?.id }), { status: 200 });
});
