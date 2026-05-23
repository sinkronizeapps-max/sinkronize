import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { appsAPI, affiliationsAPI, reviewsAPI } from "../lib/api";
import { Layout } from "../components/Layout";
import { Star, TrendingUp, Users, Check, Link2, Copy } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

export default function AppDetail() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [app, setApp] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [aff, setAff] = useState(null);
    const [newReview, setNewReview] = useState({ rating: 5, comment: "" });

    useEffect(() => {
        appsAPI.getBySlug(slug).then((appData) => {
            setApp(appData);
            reviewsAPI.list(appData.id).then(setReviews).catch(() => {});
        }).catch(() => {});
    }, [slug]);

    const becomeAffiliate = async () => {
        if (!user) { navigate("/login"); return; }
        if (app.is_demo) {
            toast.info("Este é um app demonstrativo. Em breve apps reais estarão disponíveis!");
            return;
        }
        try {
            const r = await affiliationsAPI.create(app.id);
            setAff(r);
            toast.success("Você agora é afiliado deste app!");
        } catch (e) {
            toast.error("Erro ao virar afiliado");
        }
    };

    const submitReview = async (e) => {
        e.preventDefault();
        if (!user) { navigate("/login"); return; }
        try {
            await reviewsAPI.add({ appId: app.id, rating: newReview.rating, comment: newReview.comment });
            const rr = await reviewsAPI.list(app.id);
            setReviews(rr);
            setNewReview({ rating: 5, comment: "" });
            toast.success("Avaliação enviada!");
        } catch (_e) { toast.error("Erro ao enviar avaliação"); }
    };

    const copyLink = () => {
        const link = `${window.location.origin}/app/${app.slug}?ref=${aff.code}`;
        navigator.clipboard.writeText(link);
        toast.success("Link copiado!");
    };

    if (!app) return <Layout><div className="min-h-[60vh] flex items-center justify-center text-[#8A857D]">Carregando...</div></Layout>;

    return (
        <Layout>
            <section className="bg-gradient-to-br from-[#F5F0E8] to-[#FAF9F5] py-16">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                    <div className="grid lg:grid-cols-12 gap-12 items-start">
                        <div className="lg:col-span-7">
                            <div className="aspect-[16/9] rounded-3xl overflow-hidden border border-[#E6E1D6] mb-8">
                                <img src={app.cover_url || app.icon_url} alt={app.name} className="w-full h-full object-cover" />
                            </div>
                            <span className="inline-block bg-[#FDF4F1] text-[#A5472A] border border-[#FBE6DF] px-3 py-1 rounded-full text-xs font-semibold tracking-wide mb-4">{app.category}</span>
                            <h1 className="font-serif-display text-4xl lg:text-5xl font-semibold tracking-tight text-[#1A1918] mb-4">{app.name}</h1>
                            <p className="text-xl text-[#524F4A] leading-relaxed mb-6">{app.tagline}</p>
                            <div className="flex gap-6 text-sm pb-8 border-b border-[#E6E1D6]">
                                <div className="flex items-center gap-1.5"><Star className="w-4 h-4 fill-[#D99B29] text-[#D99B29]" /><span className="font-semibold">{app.rating?.toFixed(1)}</span> <span className="text-[#8A857D]">({app.reviews_count})</span></div>
                                <div className="flex items-center gap-1.5 text-[#524F4A]"><Users className="w-4 h-4" />{app.subscribers.toLocaleString()} assinantes</div>
                                <div className="flex items-center gap-1.5 text-[#D97757] font-semibold"><TrendingUp className="w-4 h-4" />{app.commission_pct}% comissão</div>
                            </div>
                            <h2 className="font-serif-display text-2xl mt-8 mb-4">Sobre o app</h2>
                            <p className="text-[#524F4A] leading-relaxed whitespace-pre-line">{app.description}</p>
                        </div>

                        <div className="lg:col-span-5 lg:sticky lg:top-24">
                            <div className="bg-white border border-[#E6E1D6] rounded-3xl p-8 shadow-[0_8px_32px_rgba(26,25,24,0.06)]">
                                <div className="text-xs uppercase tracking-widest text-[#8A857D] font-semibold mb-2">Assinatura mensal</div>
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className="font-serif-display text-5xl font-semibold text-[#1A1918]">R$ {app.price_monthly.toFixed(2).replace(".", ",")}</span>
                                    <span className="text-[#8A857D]">/mês</span>
                                </div>
                                <p className="text-xs text-[#524F4A] mb-6">ou em até <strong>12x de R$ {(app.price_monthly / 12).toFixed(2).replace(".", ",")}</strong> sem juros no cartão</p>
                                <button onClick={() => navigate(`/checkout/${app.slug}`)} className="w-full bg-[#D97757] hover:bg-[#C55D3D] text-white rounded-full py-3.5 font-semibold transition-colors mb-3" data-testid="app-subscribe-button">
                                    Assinar agora
                                </button>
                                {!aff ? (
                                    <button onClick={becomeAffiliate} className="w-full bg-white border border-[#E6E1D6] hover:border-[#D97757] hover:text-[#D97757] rounded-full py-3.5 font-semibold transition-colors flex items-center justify-center gap-2" data-testid="app-affiliate-button">
                                        <Link2 className="w-4 h-4" /> Quero ser afiliado
                                    </button>
                                ) : (
                                    <div className="bg-[#FDF4F1] border border-[#FBE6DF] rounded-2xl p-4">
                                        <p className="text-xs uppercase tracking-wider text-[#A5472A] font-semibold mb-2 flex items-center gap-1"><Check className="w-3 h-3" /> Você é afiliado</p>
                                        <div className="flex items-center gap-2 bg-white border border-[#E6E1D6] rounded-lg p-2">
                                            <code className="flex-1 text-xs text-[#1A1918] truncate">/app/{app.slug}?ref={aff.code}</code>
                                            <button onClick={copyLink} className="p-1.5 rounded hover:bg-[#F5F0E8]" data-testid="copy-affiliate-link"><Copy className="w-4 h-4 text-[#524F4A]" /></button>
                                        </div>
                                    </div>
                                )}
                                <div className="mt-6 pt-6 border-t border-[#E6E1D6] space-y-2 text-sm text-[#524F4A]">
                                    <p className="flex items-center gap-2"><Check className="w-4 h-4 text-[#2D7A5C]" />Cancele quando quiser</p>
                                    <p className="flex items-center gap-2"><Check className="w-4 h-4 text-[#2D7A5C]" />Comissões recorrentes para afiliados</p>
                                    <p className="flex items-center gap-2"><Check className="w-4 h-4 text-[#2D7A5C]" />Materiais de divulgação prontos</p>
                                </div>
                            </div>
                            <div className="mt-6 text-center text-sm text-[#524F4A]">Por <Link to="#" className="font-semibold text-[#1A1918]">{app.producer_name}</Link></div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
                <h2 className="font-serif-display text-3xl font-semibold mb-8">Avaliações ({reviews.length})</h2>
                {user && (
                    <form onSubmit={submitReview} className="bg-white border border-[#E6E1D6] rounded-2xl p-6 mb-8" data-testid="review-form">
                        <div className="flex items-center gap-2 mb-3">
                            {[1, 2, 3, 4, 5].map((n) => (
                                <button key={n} type="button" onClick={() => setNewReview({ ...newReview, rating: n })} data-testid={`star-${n}`}>
                                    <Star className={`w-6 h-6 ${n <= newReview.rating ? "fill-[#D99B29] text-[#D99B29]" : "text-[#E6E1D6]"}`} />
                                </button>
                            ))}
                        </div>
                        <textarea value={newReview.comment} onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })} placeholder="Conte sua experiência..." required className="w-full bg-[#FAF9F5] border border-[#E6E1D6] rounded-xl px-4 py-3 focus:outline-none focus:border-[#D97757] min-h-[80px]" data-testid="review-comment" />
                        <button type="submit" className="mt-3 bg-[#1A1918] text-white rounded-full px-6 py-2 text-sm font-semibold hover:bg-[#2A2825]" data-testid="review-submit">Publicar</button>
                    </form>
                )}
                <div className="space-y-4">
                    {reviews.map((r) => (
                        <div key={r.review_id} className="bg-white border border-[#E6E1D6] rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-2">
                                <div className="font-semibold text-[#1A1918]">{r.user_name}</div>
                                <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? "fill-[#D99B29] text-[#D99B29]" : "text-[#E6E1D6]"}`} />)}</div>
                            </div>
                            <p className="text-[#524F4A] text-sm">{r.comment}</p>
                        </div>
                    ))}
                </div>
            </section>
        </Layout>
    );
}
