import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { statsAPI, affiliationsAPI, salesAPI, appsAPI } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Award, MousePointerClick, ShoppingBag, TrendingUp, Copy, ExternalLink, Plus, Clock } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const TIER_INFO = {
    bronze: { name: "Bronze", color: "#A5472A", bg: "#FBE6DF", next: "Prata em R$ 1.000" },
    prata: { name: "Prata", color: "#524F4A", bg: "#E6E1D6", next: "Ouro em R$ 5.000" },
    ouro: { name: "Ouro", color: "#D99B29", bg: "#FBE6DF", next: "Nível máximo" },
};

export default function AffiliateDashboard() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [aff, setAff] = useState([]);
    const [comms, setComms] = useState([]);
    const [availableApps, setAvailableApps] = useState([]);
    const [affiliating, setAffiliating] = useState(null);

    useEffect(() => {
        if (loading) return;
        if (!user) { navigate("/login", { state: { from: "/afiliado" } }); return; }
        Promise.all([
            statsAPI.affiliate().then(setStats).catch(() => {}),
            affiliationsAPI.myAffiliations().then(setAff).catch(() => {}),
            salesAPI.myCommissions().then(setComms).catch(() => {}),
            appsAPI.listForAffiliation().then(setAvailableApps).catch(() => {}),
        ]);
    }, [user, loading, navigate]);

    if (loading || !user) return <Layout><div className="min-h-screen flex items-center justify-center">Carregando...</div></Layout>;

    const tier = TIER_INFO[user.affiliate_tier || "bronze"];
    const cards = [
        { icon: TrendingUp, label: "Comissões totais", value: `R$ ${(stats?.total_earned || 0).toFixed(2)}`, accent: true },
        { icon: ShoppingBag, label: "Vendas geradas", value: stats?.total_sales || 0 },
        { icon: MousePointerClick, label: "Cliques", value: stats?.total_clicks || 0 },
        { icon: Award, label: "Conversão", value: `${stats?.conversion || 0}%` },
    ];

    const copyLink = (code, slug) => {
        navigator.clipboard.writeText(`${window.location.origin}/app/${slug}?ref=${code}`);
        toast.success("Link copiado!");
    };

    const affiliateTo = async (appId) => {
        setAffiliating(appId);
        try {
            const result = await affiliationsAPI.create(appId);
            if (result.status === 'pending') {
                toast.success("Solicitação enviada! Aguarde aprovação do produtor.");
            } else {
                toast.success("Afiliado com sucesso! Seu link já está ativo.");
            }
            affiliationsAPI.myAffiliations().then(setAff);
            appsAPI.listForAffiliation().then(setAvailableApps);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setAffiliating(null);
        }
    };

    return (
        <Layout>
            <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
                <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
                    <div>
                        <span className="text-xs uppercase tracking-widest text-[#D97757] font-semibold">Painel do Afiliado</span>
                        <h1 className="font-serif-display text-4xl font-semibold mt-2">Olá, {user.name?.split(" ")[0]}.</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2 rounded-full font-semibold text-sm" style={{ background: tier.bg, color: tier.color }} data-testid="affiliate-tier">
                            <Award className="w-4 h-4 inline mr-1.5" /> Nível {tier.name}
                        </div>
                        <Link to="/marketplace" className="bg-[#D97757] hover:bg-[#C55D3D] text-white rounded-full px-5 py-2.5 text-sm font-semibold" data-testid="browse-apps-button">Explorar apps</Link>
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {cards.map((c, i) => (
                        <div key={i} className={`rounded-2xl p-6 border ${c.accent ? "bg-[#D97757] text-white border-[#D97757]" : "bg-white border-[#E6E1D6]"}`} data-testid={`affiliate-stat-${i}`}>
                            <c.icon className={`w-5 h-5 mb-3 ${c.accent ? "text-white/80" : "text-[#8A857D]"}`} strokeWidth={1.5} />
                            <div className={`text-xs uppercase tracking-wider mb-1 ${c.accent ? "text-white/80" : "text-[#8A857D]"}`}>{c.label}</div>
                            <div className="font-serif-display text-3xl font-semibold">{c.value}</div>
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-6 mb-10">
                    <div className="lg:col-span-2 bg-white border border-[#E6E1D6] rounded-2xl p-6">
                        <h3 className="font-serif-display text-xl mb-4">Comissões últimos 14 dias</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={stats?.chart || []}>
                                    <CartesianGrid stroke="#EFEBE0" strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#8A857D" }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: "#8A857D" }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E6E1D6", borderRadius: 12 }} />
                                    <Line type="monotone" dataKey="value" stroke="#D97757" strokeWidth={2.5} dot={{ r: 3, fill: "#D97757" }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="bg-white border border-[#E6E1D6] rounded-2xl p-6">
                        <h3 className="font-serif-display text-xl mb-4">Próximo nível</h3>
                        <div className="text-center py-8">
                            <Award className="w-16 h-16 mx-auto mb-3" style={{ color: tier.color }} strokeWidth={1.5} />
                            <p className="font-serif-display text-2xl mb-2">{tier.name}</p>
                            <p className="text-sm text-[#524F4A]">{tier.next}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-[#E6E1D6] rounded-2xl p-6 mb-8">
                    <h3 className="font-serif-display text-xl mb-4">Minhas afiliações ({aff.length})</h3>
                    {aff.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-[#524F4A] mb-4">Você ainda não se afiliou a nenhum app.</p>
                            <Link to="/marketplace" className="inline-block bg-[#D97757] text-white rounded-full px-6 py-2.5 text-sm font-semibold">Explorar marketplace</Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {aff.map((a) => (
                                <div key={a.affiliation_id} className="border border-[#E6E1D6] rounded-2xl p-4 flex items-center gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold">{a.app_name}</div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <code className="text-xs bg-[#FAF9F5] border border-[#E6E1D6] rounded px-2 py-1 truncate">/app/{a.app_slug}?ref={a.code}</code>
                                            <button onClick={() => copyLink(a.code, a.app_slug)} className="p-1.5 rounded hover:bg-[#F5F0E8]" data-testid={`copy-link-${a.code}`}><Copy className="w-4 h-4 text-[#524F4A]" /></button>
                                            <Link to={`/app/${a.app_slug}`} className="p-1.5 rounded hover:bg-[#F5F0E8]"><ExternalLink className="w-4 h-4 text-[#524F4A]" /></Link>
                                        </div>
                                    </div>
                                    <div className="text-right text-sm">
                                        <div className="text-[#8A857D] text-xs">Cliques · Vendas</div>
                                        <div className="font-semibold">{a.clicks} · {a.sales}</div>
                                    </div>
                                    <div className="text-right text-sm border-l border-[#E6E1D6] pl-4">
                                        <div className="text-[#8A857D] text-xs">Ganho</div>
                                        <div className="font-semibold text-[#2D7A5C]">R$ {a.earned.toFixed(2)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {availableApps.length > 0 && (
                    <div className="bg-white border border-[#E6E1D6] rounded-2xl p-6 mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-serif-display text-xl">Apps disponíveis para afiliação</h3>
                            <span className="text-xs bg-[#FDF4F1] text-[#D97757] border border-[#FBE6DF] px-3 py-1 rounded-full font-semibold">{availableApps.length} disponíveis</span>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {availableApps.slice(0, 6).map(app => (
                                <div key={app.id} className="border border-[#E6E1D6] rounded-2xl p-4 hover:border-[#D97757]/40 transition-colors">
                                    <div className="flex items-center gap-3 mb-3">
                                        {app.icon_url ? (
                                            <img src={app.icon_url} alt="" className="w-10 h-10 rounded-xl object-cover" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-xl bg-[#F5F0E8]" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm truncate">{app.name}</p>
                                            <p className="text-xs text-[#8A857D] truncate">{app.tagline}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs text-[#524F4A]">R$ {app.price_monthly?.toFixed(2)}/mês</span>
                                        <span className="text-xs font-semibold text-[#2D7A5C] bg-[#F0F9F4] px-2 py-0.5 rounded-full">{app.commission_pct}% comissão</span>
                                    </div>
                                    <button
                                        onClick={() => affiliateTo(app.id)}
                                        disabled={affiliating === app.id}
                                        className="w-full bg-[#D97757] hover:bg-[#C55D3D] text-white rounded-full py-2 text-xs font-semibold disabled:opacity-60 flex items-center justify-center gap-1.5 transition-colors"
                                        data-testid={`affiliate-btn-${app.id}`}
                                    >
                                        {affiliating === app.id ? "Processando..." : <><Plus className="w-3 h-3" /> Afiliar-se</>}
                                    </button>
                                </div>
                            ))}
                        </div>
                        {availableApps.length > 6 && (
                            <div className="text-center mt-4">
                                <Link to="/marketplace" className="text-sm text-[#D97757] font-semibold hover:underline">Ver todos no marketplace →</Link>
                            </div>
                        )}
                    </div>
                )}

                {/* Afiliações pendentes */}
                {aff.some(a => a.status === 'pending') && (
                    <div className="bg-[#FFF8F0] border border-[#FBE6DF] rounded-2xl p-5 mb-8">
                        <h3 className="font-semibold text-[#A5472A] mb-3 flex items-center gap-2"><Clock className="w-4 h-4" /> Solicitações pendentes</h3>
                        <div className="space-y-2">
                            {aff.filter(a => a.status === 'pending').map(a => (
                                <div key={a.affiliation_id || a.id} className="flex items-center justify-between text-sm">
                                    <span className="font-medium">{a.app_name}</span>
                                    <span className="text-xs text-[#A5472A] bg-[#FDF4F1] px-2 py-0.5 rounded-full">Aguardando aprovação</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="bg-white border border-[#E6E1D6] rounded-2xl p-6">
                    <h3 className="font-serif-display text-xl mb-4">Histórico de comissões</h3>
                    {comms.length === 0 ? (
                        <p className="text-sm text-[#8A857D] py-6 text-center">Nenhuma comissão ainda.</p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs uppercase tracking-wider text-[#8A857D] border-b border-[#E6E1D6]">
                                    <th className="py-3">App</th><th>Comprador</th><th>Valor</th><th className="text-right">Comissão</th>
                                </tr>
                            </thead>
                            <tbody>
                                {comms.slice(0, 20).map((c) => (
                                    <tr key={c.sale_id} className="border-b border-[#EFEBE0]">
                                        <td className="py-3 font-medium">{c.app_name}</td>
                                        <td>{c.buyer_name}</td>
                                        <td>R$ {c.amount.toFixed(2)}</td>
                                        <td className="text-right font-semibold text-[#2D7A5C]">+R$ {c.affiliate_amount.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </section>
        </Layout>
    );
}
