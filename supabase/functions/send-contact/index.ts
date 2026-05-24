const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { name, email, subject, message } = await req.json();
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    const html = `
      <div style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #E6E1D6;">
        <div style="background:#1A1918;padding:24px 32px;">
          <span style="color:#fff;font-size:18px;font-weight:700;letter-spacing:2px;">SINKRONIZE</span>
          <span style="color:#D97757;font-size:13px;margin-left:12px;">Nova mensagem de contato</span>
        </div>
        <div style="padding:32px;">
          <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px;">
            <tr><td style="padding:8px 0;color:#8A857D;width:100px;">Assunto</td><td style="padding:8px 0;font-weight:600;color:#D97757;">${subject}</td></tr>
            <tr><td style="padding:8px 0;color:#8A857D;">Nome</td><td style="padding:8px 0;font-weight:600;">${name}</td></tr>
            <tr><td style="padding:8px 0;color:#8A857D;">E-mail</td><td style="padding:8px 0;"><a href="mailto:${email}" style="color:#D97757;">${email}</a></td></tr>
          </table>
          <div style="background:#F5F0E8;border-radius:12px;padding:20px;">
            <p style="font-size:13px;color:#8A857D;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;">Mensagem</p>
            <p style="font-size:15px;color:#1A1918;margin:0;white-space:pre-wrap;">${message}</p>
          </div>
          <p style="font-size:12px;color:#8A857D;margin-top:24px;">Responda diretamente para: <a href="mailto:${email}" style="color:#D97757;">${email}</a></p>
        </div>
      </div>
    `;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "SINKRONIZE Contato <onboarding@resend.dev>",
        to: "contatosinkronize@gmail.com",
        reply_to: email,
        subject: `[${subject}] ${name} — SINKRONIZE`,
        html,
      }),
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
