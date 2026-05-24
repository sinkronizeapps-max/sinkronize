import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-04-10" });
const PLATFORM_FEE_PCT = 9.9;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "onboarding@resend.dev";

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: `SINKRONIZE <${FROM_EMAIL}>`, to, subject, html }),
  });
}

function emailBase(content: string) {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#FAF9F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #E6E1D6;">
    <div style="background:#1A1918;padding:28px 32px;text-align:center;">
      <span style="color:#fff;font-size:20px;font-weight:700;letter-spacing:2px;">SINKRONIZE</span>
    </div>
    <div style="padding:32px;">${content}</div>
    <div style="padding:20px 32px;border-top:1px solid #E6E1D6;text-align:center;">
      <p style="font-size:12px;color:#8A857D;margin:0;">© ${new Date().getFullYear()} SINKRONIZE · <a href="https://sinkronize.com.br" style="color:#D97757;text-decoration:none;">sinkronize.com.br</a></p>
    </div>
  </div></body></html>`;
}

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
  let affiliateEmail = null;
  let affiliateName = null;

  if (affiliationCode) {
    const { data: aff } = await supabase
      .from("affiliations")
      .select("*, profiles(email, name)")
      .eq("code", affiliationCode)
      .single();
    if (aff && aff.app_id === appId) {
      affiliateId = aff.affiliate_id;
      affiliateAmount = parseFloat((afterPlatform * commissionPct / 100).toFixed(2));
      affiliateEmail = aff.profiles?.email;
      affiliateName = aff.profiles?.name;
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

  // Fetch producer info
  let producerEmail = null;
  let producerName = app.producer_name;
  if (app.producer_id) {
    const { data: prod } = await supabase.from("profiles").select("balance, email, name").eq("id", app.producer_id).single();
    if (prod) {
      producerEmail = prod.email;
      producerName = prod.name;
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

  // ── EMAILS ──────────────────────────────────────────────

  // 1. E-mail para o COMPRADOR
  await sendEmail(
    buyerEmail,
    `Compra confirmada — ${app.name}`,
    emailBase(`
      <h2 style="font-size:22px;color:#1A1918;margin:0 0 8px;">Tudo certo! 🎉</h2>
      <p style="color:#524F4A;margin:0 0 20px;">Olá <strong>${buyerName}</strong>, sua assinatura do <strong>${app.name}</strong> foi confirmada.</p>
      <div style="background:#F5F0E8;border-radius:12px;padding:20px;margin-bottom:24px;">
        <p style="margin:0 0 8px;font-size:13px;color:#8A857D;text-transform:uppercase;letter-spacing:1px;">Resumo</p>
        <p style="margin:0 0 4px;font-size:15px;"><strong>${app.name}</strong></p>
        <p style="margin:0 0 4px;color:#524F4A;font-size:14px;">Valor: <strong>R$ ${amount.toFixed(2)}/mês</strong></p>
        <p style="margin:0;color:#524F4A;font-size:14px;">Status: <span style="color:#2D7A5C;font-weight:600;">✓ Pago</span></p>
      </div>
      ${app.thank_you_url ? `<a href="${app.thank_you_url}?email=${encodeURIComponent(buyerEmail)}&app=${app.slug}" style="display:inline-block;background:#D97757;color:#fff;text-decoration:none;padding:12px 28px;border-radius:50px;font-weight:600;font-size:15px;">Acessar ${app.name} →</a>` : ""}
      <p style="font-size:13px;color:#8A857D;margin-top:24px;">Dúvidas? Fale com a gente em <a href="mailto:suporte@sinkronize.com.br" style="color:#D97757;">suporte@sinkronize.com.br</a></p>
    `)
  );

  // 2. E-mail para o PRODUTOR
  if (producerEmail) {
    await sendEmail(
      producerEmail,
      `💰 Nova venda — ${app.name}`,
      emailBase(`
        <h2 style="font-size:22px;color:#1A1918;margin:0 0 8px;">Nova venda! 🚀</h2>
        <p style="color:#524F4A;margin:0 0 20px;">Olá <strong>${producerName}</strong>, você acaba de receber uma nova assinatura.</p>
        <div style="background:#F5F0E8;border-radius:12px;padding:20px;margin-bottom:24px;">
          <p style="margin:0 0 8px;font-size:13px;color:#8A857D;text-transform:uppercase;letter-spacing:1px;">Detalhes</p>
          <p style="margin:0 0 4px;"><strong>${buyerName}</strong> (${buyerEmail})</p>
          <p style="margin:0 0 4px;color:#524F4A;font-size:14px;">App: ${app.name}</p>
          <p style="margin:0 0 4px;color:#524F4A;font-size:14px;">Valor total: R$ ${amount.toFixed(2)}</p>
          <p style="margin:0;font-size:16px;"><strong style="color:#2D7A5C;">Você recebe: R$ ${producerAmount.toFixed(2)}</strong></p>
        </div>
        <a href="https://sinkronize.com.br/dashboard" style="display:inline-block;background:#1A1918;color:#fff;text-decoration:none;padding:12px 28px;border-radius:50px;font-weight:600;font-size:15px;">Ver no painel →</a>
      `)
    );
  }

  // 3. E-mail para o AFILIADO
  if (affiliateEmail && affiliateAmount > 0) {
    await sendEmail(
      affiliateEmail,
      `🎯 Comissão recebida — R$ ${affiliateAmount.toFixed(2)}`,
      emailBase(`
        <h2 style="font-size:22px;color:#1A1918;margin:0 0 8px;">Comissão confirmada! 🎯</h2>
        <p style="color:#524F4A;margin:0 0 20px;">Olá <strong>${affiliateName}</strong>, você acabou de ganhar uma comissão!</p>
        <div style="background:#F0F9F4;border-radius:12px;padding:20px;margin-bottom:24px;border:1px solid #C3E8D5;">
          <p style="margin:0 0 8px;font-size:13px;color:#8A857D;text-transform:uppercase;letter-spacing:1px;">Comissão</p>
          <p style="margin:0 0 4px;color:#524F4A;font-size:14px;">App: ${app.name}</p>
          <p style="margin:0;font-size:28px;font-weight:700;color:#2D7A5C;">+ R$ ${affiliateAmount.toFixed(2)}</p>
        </div>
        <a href="https://sinkronize.com.br/afiliado" style="display:inline-block;background:#D97757;color:#fff;text-decoration:none;padding:12px 28px;border-radius:50px;font-weight:600;font-size:15px;">Ver no painel →</a>
      `)
    );
  }

  // 4. Chamar webhook do produtor (se configurado)
  if (app.webhook_url) {
    fetch(app.webhook_url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "sale.confirmed",
        app_id: appId,
        app_slug: app.slug,
        buyer_email: buyerEmail,
        buyer_name: buyerName,
        amount,
        producer_amount: producerAmount,
        affiliate_amount: affiliateAmount,
        affiliation_code: affiliationCode,
        created_at: new Date().toISOString(),
      }),
    }).catch(() => {});
  }

  return new Response(JSON.stringify({ received: true, sale_id: sale?.id }), { status: 200 });
});
