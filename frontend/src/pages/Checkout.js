import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { appsAPI } from "../lib/api";
import { Layout } from "../components/Layout";
import { Lock, Check, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";

export default function Checkout() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [app, setApp] = useState(null);
    const [form, setForm] = useState({
        buyer_name: "",
        buyer_email: "",
        installments: 1,
        affiliation_code: new URLSearchParams(window.location.search).get("ref") || "",
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => { appsAPI.getBySlug(slug).then(setApp).catch(() => {}); }, [slug]);

    const submit = async (e) => {
        e.preventDefault();
        if (app.is_demo) {
            toast.warning("Este produto está temporariamente suspenso pelo produtor.");
            return;
        }
        setLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke("create-checkout", {
                body: {
                    appId: app.id,
                    buyerEmail: form.buyer_email,
                    buyerName: form.buyer_name,
                    affiliationCode: form.affiliation_code || null,
                    installments: form.installments,
                },
            });
            if (error || !data?.url) throw new Error(error?.message || "Erro ao criar sessão");
            // Registrar tentativa para rastreamento de carrinhos abandonados
            supabase.from("checkout_attempts").insert({
                app_id: app.id,
                app_name: app.name,
                app_slug: app.slug,
                buyer_email: form.buyer_email.toLowerCase(),
                buyer_name: form.buyer_name,
                amount: app.price_monthly,
                stripe_session_id: data.session_id || null,
                affiliation_code: form.affiliation_code || null,
                status: "pending",
            }).then(() => {});
            window.location.href = data.url;
        } catch (err) {
            toast.error("Erro ao redirecionar para o pagamento. Tente novamente.");
            setLoading(false);
        }
    };

    if (!app) return <Layout><div className="min-h-[60vh] flex items-center justify-center">Carregando...</div></Layout>;

    return (
        <Layout>
            <section className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
                <div className="grid lg:grid-cols-5 gap-12">
                    <form onSubmit={submit} className="lg:col-span-3 space-y-6" data-testid="checkout-form">
                        <h1 className="font-serif-display text-3xl font-semibold mb-2">Finalize sua assinatura</h1>
                        <p className="text-[#524F4A] text-sm flex items-center gap-2">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#2D7A5C]" />
                            Pagamento 100% seguro via Stripe
                        </p>

                        <div className="bg-white border border-[#E6E1D6] rounded-2xl p-6 space-y-4">
                            <h3 className="font-serif-display text-lg font-semibold">Seus dados</h3>
                            <input
                                required
                                value={form.buyer_name}
                                onChange={(e) => setForm({ ...form, buyer_name: e.target.value })}
                                placeholder="Nome completo"
                                className="w-full bg-[#FAF9F5] border border-[#E6E1D6] rounded-xl px-4 py-3 focus:outline-none focus:border-[#D97757]"
                                data-testid="checkout-name"
                            />
                            <input
                                required
                                type="email"
                                value={form.buyer_email}
                                onChange={(e) => setForm({ ...form, buyer_email: e.target.value })}
                                placeholder="E-mail"
                                className="w-full bg-[#FAF9F5] border border-[#E6E1D6] rounded-xl px-4 py-3 focus:outline-none focus:border-[#D97757]"
                                data-testid="checkout-email"
                            />
                        </div>

                        <div className="bg-white border border-[#E6E1D6] rounded-2xl p-6 space-y-4">
                            <h3 className="font-serif-display text-lg font-semibold">Parcelamento</h3>
                            <select
                                value={form.installments}
                                onChange={(e) => setForm({ ...form, installments: parseInt(e.target.value) })}
                                className="w-full bg-[#FAF9F5] border border-[#E6E1D6] rounded-xl px-4 py-3 focus:outline-none focus:border-[#D97757]"
                                data-testid="checkout-installments"
                            >
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                                    <option key={n} value={n}>
                                        {n === 1
                                            ? `À vista — R$ ${app.price_monthly.toFixed(2)}`
                                            : `${n}x de R$ ${(app.price_monthly / n).toFixed(2)} sem juros`}
                                    </option>
                                ))}
                            </select>
                            {form.affiliation_code && (
                                <div className="bg-[#FDF4F1] border border-[#FBE6DF] rounded-xl p-3 text-sm text-[#A5472A]">
                                    Indicação aplicada: <strong>{form.affiliation_code}</strong>
                                </div>
                            )}
                        </div>

                        <div className="bg-[#F0FAF5] border border-[#C3E8D5] rounded-2xl p-4 text-sm text-[#2D7A5C] flex items-start gap-3">
                            <Check className="w-4 h-4 mt-0.5 shrink-0" />
                            <span>Você será redirecionado para o checkout seguro do Stripe. Os dados do cartão são inseridos diretamente no ambiente protegido do Stripe — nunca passam pelo nosso servidor.</span>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#D97757] hover:bg-[#C55D3D] text-white rounded-full py-4 font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                            data-testid="checkout-submit"
                        >
                            <Lock className="w-4 h-4" />
                            {loading ? "Redirecionando..." : `Ir para o pagamento — R$ ${app.price_monthly.toFixed(2)}`}
                        </button>
                    </form>

                    <aside className="lg:col-span-2">
                        <div className="bg-white border border-[#E6E1D6] rounded-2xl p-6 sticky top-24">
                            <h3 className="font-serif-display text-xl font-semibold mb-4">Resumo</h3>
                            <div className="flex items-center gap-3 pb-4 border-b border-[#E6E1D6]">
                                <img src={app.icon_url} alt="" className="w-14 h-14 rounded-xl object-cover" />
                                <div className="flex-1">
                                    <div className="font-semibold">{app.name}</div>
                                    <div className="text-xs text-[#8A857D]">{app.category}</div>
                                </div>
                            </div>
                            <div className="space-y-2 py-4 text-sm">
                                <div className="flex justify-between text-[#524F4A]"><span>Assinatura mensal</span><span>R$ {app.price_monthly.toFixed(2)}</span></div>
                                <div className="flex justify-between text-[#524F4A]"><span>Acesso instantâneo</span><span className="text-[#2D7A5C]">Incluso</span></div>
                            </div>
                            <div className="flex justify-between font-serif-display text-xl pt-4 border-t border-[#E6E1D6]">
                                <span>Total</span>
                                <span>R$ {app.price_monthly.toFixed(2)}</span>
                            </div>
                            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#8A857D]">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Pagamento processado por Stripe
                            </div>
                        </div>
                    </aside>
                </div>
            </section>
        </Layout>
    );
}
