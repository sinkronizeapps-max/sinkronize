import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { Layout } from "../components/Layout";
import { Lock, Check } from "lucide-react";
import { toast } from "sonner";

export default function Checkout() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [app, setApp] = useState(null);
    const [done, setDone] = useState(null);
    const [form, setForm] = useState({
        buyer_name: "", buyer_email: "",
        card_number: "4242 4242 4242 4242", card_name: "",
        installments: 1,
        affiliation_code: new URLSearchParams(window.location.search).get("ref") || "",
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => { api.get(`/apps/${slug}`).then((r) => setApp(r.data)); }, [slug]);

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const r = await api.post("/checkout", { ...form, app_id: app.app_id });
            setDone(r.data);
        } catch (_err) {
            toast.error("Erro ao processar pagamento");
        } finally { setLoading(false); }
    };

    if (!app) return <Layout><div className="min-h-[60vh] flex items-center justify-center">Carregando...</div></Layout>;

    if (done) {
        return (
            <Layout>
                <section className="max-w-2xl mx-auto px-6 py-24 text-center">
                    <div className="w-20 h-20 mx-auto rounded-full bg-[#2D7A5C]/10 flex items-center justify-center mb-6">
                        <Check className="w-10 h-10 text-[#2D7A5C]" strokeWidth={2} />
                    </div>
                    <h1 className="font-serif-display text-4xl font-semibold mb-4">Assinatura confirmada!</h1>
                    <p className="text-[#524F4A] mb-8">Seja bem-vindo ao <strong>{app.name}</strong>. Você receberá os acessos por e-mail em instantes.</p>
                    <div className="bg-white border border-[#E6E1D6] rounded-2xl p-6 text-left space-y-2 text-sm" data-testid="checkout-receipt">
                        <p><span className="text-[#8A857D]">ID da venda:</span> {done.sale_id}</p>
                        <p><span className="text-[#8A857D]">Valor:</span> R$ {done.amount.toFixed(2)}</p>
                        <p><span className="text-[#8A857D]">Produtor recebe:</span> R$ {done.producer_amount.toFixed(2)}</p>
                        {done.affiliate_amount > 0 && <p><span className="text-[#8A857D]">Afiliado recebe:</span> R$ {done.affiliate_amount.toFixed(2)}</p>}
                        <p><span className="text-[#8A857D]">Taxa plataforma:</span> R$ {done.platform_amount.toFixed(2)}</p>
                    </div>
                    <button onClick={() => navigate("/marketplace")} className="mt-8 bg-[#D97757] text-white rounded-full px-8 py-3 font-semibold hover:bg-[#C55D3D]" data-testid="checkout-back">Voltar ao marketplace</button>
                </section>
            </Layout>
        );
    }

    return (
        <Layout>
            <section className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
                <div className="grid lg:grid-cols-5 gap-12">
                    <form onSubmit={submit} className="lg:col-span-3 space-y-6" data-testid="checkout-form">
                        <h1 className="font-serif-display text-3xl font-semibold mb-2">Finalize sua assinatura</h1>
                        <p className="text-[#524F4A] text-sm flex items-center gap-2"><Lock className="w-3.5 h-3.5" />Pagamento simulado para demonstração</p>

                        <div className="bg-white border border-[#E6E1D6] rounded-2xl p-6 space-y-4">
                            <h3 className="font-serif-display text-lg font-semibold">Seus dados</h3>
                            <input required value={form.buyer_name} onChange={(e) => setForm({ ...form, buyer_name: e.target.value })} placeholder="Nome completo" className="w-full bg-[#FAF9F5] border border-[#E6E1D6] rounded-xl px-4 py-3 focus:outline-none focus:border-[#D97757]" data-testid="checkout-name" />
                            <input required type="email" value={form.buyer_email} onChange={(e) => setForm({ ...form, buyer_email: e.target.value })} placeholder="E-mail" className="w-full bg-[#FAF9F5] border border-[#E6E1D6] rounded-xl px-4 py-3 focus:outline-none focus:border-[#D97757]" data-testid="checkout-email" />
                        </div>

                        <div className="bg-white border border-[#E6E1D6] rounded-2xl p-6 space-y-4">
                            <h3 className="font-serif-display text-lg font-semibold">Pagamento</h3>
                            <input required value={form.card_number} onChange={(e) => setForm({ ...form, card_number: e.target.value })} placeholder="Número do cartão" className="w-full bg-[#FAF9F5] border border-[#E6E1D6] rounded-xl px-4 py-3 focus:outline-none focus:border-[#D97757]" data-testid="checkout-card" />
                            <input required value={form.card_name} onChange={(e) => setForm({ ...form, card_name: e.target.value })} placeholder="Nome no cartão" className="w-full bg-[#FAF9F5] border border-[#E6E1D6] rounded-xl px-4 py-3 focus:outline-none focus:border-[#D97757]" data-testid="checkout-card-name" />
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-[#8A857D] font-semibold mb-2">Parcelamento</label>
                                <select value={form.installments} onChange={(e) => setForm({ ...form, installments: parseInt(e.target.value) })} className="w-full bg-[#FAF9F5] border border-[#E6E1D6] rounded-xl px-4 py-3 focus:outline-none focus:border-[#D97757]" data-testid="checkout-installments">
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                                        <option key={n} value={n}>
                                            {n === 1 ? `À vista — R$ ${app.price_monthly.toFixed(2)}` : `${n}x de R$ ${(app.price_monthly / n).toFixed(2)} sem juros`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {form.affiliation_code && (
                                <div className="bg-[#FDF4F1] border border-[#FBE6DF] rounded-xl p-3 text-sm text-[#A5472A]">
                                    Indicação aplicada: <strong>{form.affiliation_code}</strong>
                                </div>
                            )}
                        </div>

                        <button type="submit" disabled={loading} className="w-full bg-[#D97757] hover:bg-[#C55D3D] text-white rounded-full py-4 font-semibold transition-colors disabled:opacity-60" data-testid="checkout-submit">
                            {loading ? "Processando..." : (form.installments === 1 ? `Pagar R$ ${app.price_monthly.toFixed(2)}` : `Pagar ${form.installments}x de R$ ${(app.price_monthly / form.installments).toFixed(2)}`)}
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
                        </div>
                    </aside>
                </div>
            </section>
        </Layout>
    );
}
