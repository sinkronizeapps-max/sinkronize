import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { statsAPI, appsAPI, salesAPI, materialsAPI, affiliationsAPI, couponsAPI } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, TrendingUp, DollarSign, Package, ShoppingBag, X, Megaphone, Copy, Crown, Zap, Check, Pencil, UserCheck, UserX, Clock, Tag, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import AppRegistrationModal from "../components/AppRegistrationModal";

const CATS = ["Bem-estar", "Produtividade", "Fitness", "Finanças", "Culinária", "Educação", "Pets", "Negócios"];

const TIER_META = {
    basico: { label: "Básico", color: "#524F4A", bg: "#F5F0E8", icon: null },
    plus: { label: "Plus", color: "#1E4D7B", bg: "#D9E8F6", icon: Zap },
    premium: { label: "Premium", color: "#8A5A0A", bg: "#FBE9C4", icon: Crown },
};

export default function ProducerDashboard() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [apps, setApps] = useState([]);
    const [sales, setSales] = useState([]);
    const [showCreate, setShowCreate] = useState(false);
    const [showRegModal, setShowRegModal] = useState(false);
    const [editApp, setEditApp] = useState(null);
    const [pendingAffs, setPendingAffs] = useState({});
    const [showMaterials, setShowMaterials] = useState(null);
    const [materials, setMaterials] = useState(null);
    const [showUpgrade, setShowUpgrade] = useState(null);
    const [tiers, setTiers] = useState([]);
    const [activeTab, setActiveTab] = useState("overview");
    const [coupons, setCoupons] = useState([]);
    const [showCouponModal, setShowCouponModal] = useState(false);
    const [couponForm, setCouponForm] = useState({ app_id: "", code: "", discount_type: "percent", discount_value: 10, max_uses: "", valid_until: "" });
    const [form, setForm] = useState({
        name: "", tagline: "", description: "", category: "Produtividade",
        price_monthly: 29.9, commission_pct: 40,
        icon_url: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&q=80",
        cover_url: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80",
    });

    useEffect(() => {
        if (loading) return;
        if (!user) { navigate("/login", { state: { from: "/dashboard" } }); return; }
        Promise.all([
            statsAPI.producer().then(setStats).catch(() => {}),
            appsAPI.myApps().then(setApps).catch(() => {}),
            salesAPI.mySales().then(setSales).catch(() => {}),
            Promise.resolve(appsAPI.tiers()).then(setTiers),
            couponsAPI.list().then(setCoupons).catch(() => {}),
        ]);
    }, [user, loading, navigate]);

    const upgradeTo = async (tier) => {
        try {
            await appsAPI.upgradeTier(showUpgrade.id, tier);
            toast.success(`App atualizado para ${tier === "basico" ? "Básico" : tier === "plus" ? "Plus" : "Premium"}!`);
            setShowUpgrade(null);
            appsAPI.myApps().then(setApps);
        } catch (_e) { toast.error("Erro ao atualizar plano"); }
    };

    const create = async (e) => {
        e.preventDefault();
        try {
            await appsAPI.create(form);
            toast.success("App publicado!");
            setShowCreate(false);
            appsAPI.myApps().then(setApps);
        } catch (_e) { toast.error("Erro ao publicar app"); }
    };

    const openMaterials = async (app) => {
        setShowMaterials(app);
        materialsAPI.get(app.id).then(setMaterials).catch(() => {});
    };

    const loadPending = async (appId) => {
        const data = await affiliationsAPI.pendingForApp(appId).catch(() => []);
        setPendingAffs(p => ({ ...p, [appId]: data }));
    };

    const approveAff = async (affId, appId) => {
        await affiliationsAPI.approve(affId);
        toast.success("Afiliado aprovado!");
        loadPending(appId);
    };

    const rejectAff = async (affId, appId) => {
        await affiliationsAPI.reject(affId);
        toast.success("Afiliado recusado.");
        loadPending(appId);
    };

    const createCoupon = async (e) => {
        e.preventDefault();
        try {
            await couponsAPI.create({
                appId: couponForm.app_id,
                code: couponForm.code,
                discountType: couponForm.discount_type,
                discountValue: parseFloat(couponForm.discount_value),
                maxUses: couponForm.max_uses ? parseInt(couponForm.max_uses) : null,
                validUntil: couponForm.valid_until || null,
            });
            toast.success("Cupom criado!");
            setShowCouponModal(false);
            setCouponForm({ app_id: "", code: "", discount_type: "percent", discount_value: 10, max_uses: "", valid_until: "" });
            couponsAPI.list().then(setCoupons).catch(() => {});
        } catch (err) {
            toast.error("Erro: " + err.message);
        }
    };

    const toggleCoupon = async (c) => {
        await couponsAPI.toggle(c.id, !c.active);
        couponsAPI.list().then(setCoupons).catch(() => {});
    };

    const deleteCoupon = async (id) => {
        if (!window.confirm("Deletar este cupom?")) return;
        await couponsAPI.delete(id);
        couponsAPI.list().then(setCoupons).catch(() => {});
        toast.success("Cupom removido.");
    };

    if (loading || !user) return <Layout><div className="min-h-screen flex items-center justify-center">Carregando...</div></Layout>;

    const cards = [
        { icon: DollarSign, label: "Receita total", value: `R$ ${(stats?.total_revenue || 0).toFixed(2)}`, accent: true },
        { icon: ShoppingBag, label: "Vendas", value: stats?.total_sales || 0 },
        { icon: Package, label: "Apps publicados", value: stats?.apps_count || 0 },
        { icon: TrendingUp, label: "Últimos 30 dias", value: `R$ ${(stats?.revenue_30d || 0).toFixed(2)}` },
    ];

    return (
        <Layout>
            <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
                <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
                    <div>
                        <span className="text-xs uppercase tracking-widest text-[#D97757] font-semibold">Painel do Produtor</span>
                        <h1 className="font-serif-display text-4xl font-semibold mt-2">Olá, {user.name?.split(" ")[0]}.</h1>
                    </div>
                    <button onClick={() => setShowRegModal(true)} className="inline-flex items-center gap-2 bg-[#D97757] hover:bg-[#C55D3D] text-white rounded-full px-6 py-3 font-semibold transition-colors" data-testid="create-app-button">
                        <Plus className="w-4 h-4" /> Publicar novo app
                    </button>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {cards.map((c, i) => (
                        <div key={i} className={`rounded-2xl p-6 border ${c.accent ? "bg-[#1A1918] text-white border-[#1A1918]" : "bg-white border-[#E6E1D6]"}`} data-testid={`stat-card-${i}`}>
                            <c.icon className={`w-5 h-5 mb-3 ${c.accent ? "text-[#D97757]" : "text-[#8A857D]"}`} strokeWidth={1.5} />
                            <div className={`text-xs uppercase tracking-wider ${c.accent ? "text-white/60" : "text-[#8A857D]"} mb-1`}>{c.label}</div>
                            <div className="font-serif-display text-3xl font-semibold">{c.value}</div>
                        </div>
                    ))}
                </div>

                {/* Tab navigation */}
                <div className="flex gap-2 mb-6 border-b border-[#E6E1D6]">
                    {[
                        { id: "overview", label: "Visão Geral" },
                        { id: "apps",     label: `Meus Apps (${apps.length})` },
                        { id: "coupons",  label: `Cupons (${coupons.length})` },
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${activeTab === t.id ? "border-[#D97757] text-[#D97757]" : "border-transparent text-[#8A857D] hover:text-[#1A1918]"}`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* ===== TAB: VISÃO GERAL ===== */}
                {activeTab === "overview" && (
                    <>
                    <div className="grid lg:grid-cols-3 gap-6 mb-10">
                        <div className="lg:col-span-2 bg-white border border-[#E6E1D6] rounded-2xl p-6">
                            <h3 className="font-serif-display text-xl mb-4">Receita últimos 14 dias</h3>
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
                            <h3 className="font-serif-display text-xl mb-4">Últimas vendas</h3>
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {sales.slice(0, 8).map((s) => (
                                    <div key={s.sale_id} className="flex justify-between text-sm pb-2 border-b border-[#EFEBE0] last:border-0">
                                        <div>
                                            <div className="font-medium text-[#1A1918]">{s.app_name}</div>
                                            <div className="text-xs text-[#8A857D]">{s.buyer_name}</div>
                                        </div>
                                        <div className="text-right font-semibold text-[#2D7A5C]">+R$ {s.producer_amount.toFixed(2)}</div>
                                    </div>
                                ))}
                                {sales.length === 0 && <p className="text-sm text-[#8A857D]">Nenhuma venda ainda.</p>}
                            </div>
                        </div>
                    </div>
                    </>
                )}

                {/* ===== TAB: MEUS APPS ===== */}
                {activeTab === "apps" && (
                    <div className="bg-white border border-[#E6E1D6] rounded-2xl p-6">
                        <h3 className="font-serif-display text-xl mb-4">Meus apps ({apps.length})</h3>
                        {apps.length === 0 ? (
                            <p className="text-sm text-[#8A857D] py-8 text-center">Você ainda não publicou nenhum app. Clique em "Publicar novo app" para começar.</p>
                        ) : (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {apps.map((a) => {
                                    const meta = TIER_META[a.tier || "basico"];
                                    return (
                                    <div key={a.id} className="border border-[#E6E1D6] rounded-2xl p-4">
                                        <div className="flex items-center gap-3 mb-3">
                                            <img src={a.icon_url} alt="" className="w-12 h-12 rounded-xl object-cover" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <div className="font-semibold truncate">{a.name}</div>
                                                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold" style={{ background: meta.bg, color: meta.color }}>
                                                        {meta.icon && <meta.icon className="w-2.5 h-2.5" />} {meta.label}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-[#8A857D]">{a.category} · {a.commission_pct}% comissão</div>
                                            </div>
                                        </div>
                                        <div className="text-xs text-[#524F4A] space-y-1 mb-3">
                                            <div>Assinantes: <strong>{a.subscribers}</strong></div>
                                            <div>Preço: <strong>R$ {a.price_monthly.toFixed(2)}</strong></div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button onClick={() => openMaterials(a)} className="text-xs bg-[#FDF4F1] text-[#A5472A] border border-[#FBE6DF] rounded-full py-2 font-semibold hover:bg-[#FBE6DF] flex items-center justify-center gap-1.5" data-testid={`materials-${a.id}`}>
                                                <Megaphone className="w-3 h-3" /> Materiais
                                            </button>
                                            <button onClick={() => setEditApp(a)} className="text-xs bg-white border border-[#E6E1D6] rounded-full py-2 font-semibold hover:border-[#D97757] flex items-center justify-center gap-1.5 text-[#524F4A]" data-testid={`edit-${a.id}`}>
                                                <Pencil className="w-3 h-3" /> Editar
                                            </button>
                                            <button onClick={() => setShowUpgrade(a)} className="text-xs bg-[#1A1918] text-white rounded-full py-2 font-semibold hover:bg-[#2A2825] flex items-center justify-center gap-1.5" data-testid={`upgrade-${a.id}`}>
                                                <Crown className="w-3 h-3" /> Plano
                                            </button>
                                            {a.affiliate_mode === 'manual' && (
                                                <button onClick={() => loadPending(a.id)} className="text-xs bg-[#F0F9F4] text-[#2D7A5C] border border-[#C3E8D5] rounded-full py-2 font-semibold hover:bg-[#C3E8D5] flex items-center justify-center gap-1.5" data-testid={`pending-affs-${a.id}`}>
                                                    <Clock className="w-3 h-3" /> Afiliados
                                                </button>
                                            )}
                                        </div>
                                        {pendingAffs[a.id] && pendingAffs[a.id].length > 0 && (
                                            <div className="mt-3 border-t border-[#E6E1D6] pt-3 space-y-2">
                                                <p className="text-xs font-semibold text-[#524F4A] uppercase tracking-wider">Aguardando aprovação</p>
                                                {pendingAffs[a.id].map(aff => (
                                                    <div key={aff.id} className="flex items-center justify-between gap-2">
                                                        <span className="text-xs text-[#1A1918] truncate">{aff.profiles?.name || "Afiliado"}</span>
                                                        <div className="flex gap-1 shrink-0">
                                                            <button onClick={() => approveAff(aff.id, a.id)} className="p-1 rounded-full bg-[#F0F9F4] hover:bg-[#2D7A5C] hover:text-white text-[#2D7A5C] transition-colors" title="Aprovar"><UserCheck className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => rejectAff(aff.id, a.id)} className="p-1 rounded-full bg-[#FDF4F1] hover:bg-[#B04646] hover:text-white text-[#B04646] transition-colors" title="Recusar"><UserX className="w-3.5 h-3.5" /></button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {pendingAffs[a.id] && pendingAffs[a.id].length === 0 && (
                                            <p className="mt-2 text-xs text-[#8A857D]">Nenhum afiliado pendente.</p>
                                        )}
                                    </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ===== TAB: CUPONS ===== */}
                {activeTab === "coupons" && (
                    <div className="bg-white border border-[#E6E1D6] rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="font-serif-display text-xl">Cupons de desconto</h3>
                                <p className="text-sm text-[#8A857D] mt-1">Crie cupons para seus apps e atraia mais compradores</p>
                            </div>
                            <button
                                onClick={() => { setCouponForm(f => ({ ...f, app_id: apps[0]?.id || "" })); setShowCouponModal(true); }}
                                className="inline-flex items-center gap-2 bg-[#D97757] hover:bg-[#C55D3D] text-white rounded-full px-5 py-2.5 text-sm font-semibold transition-colors"
                                data-testid="create-coupon-btn"
                            >
                                <Plus className="w-4 h-4" /> Novo cupom
                            </button>
                        </div>

                        {coupons.length === 0 ? (
                            <div className="text-center py-12">
                                <Tag className="w-12 h-12 text-[#E6E1D6] mx-auto mb-3" />
                                <p className="text-[#8A857D]">Nenhum cupom criado ainda.</p>
                                <p className="text-sm text-[#8A857D] mt-1">Crie cupons de desconto para seus apps e aumente suas vendas.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {coupons.map(c => (
                                    <div key={c.id} className={`flex items-center justify-between p-4 border rounded-2xl transition-colors ${c.active ? "border-[#E6E1D6] bg-white" : "border-[#E6E1D6] bg-[#FAF9F5] opacity-60"}`}>
                                        <div className="flex items-center gap-4">
                                            <div className="bg-[#FDF4F1] border border-[#FBE6DF] rounded-xl px-3 py-1.5">
                                                <span className="font-mono font-bold text-[#A5472A] text-sm tracking-widest">{c.code}</span>
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-[#1A1918]">
                                                    {c.discount_type === "percent" ? `${c.discount_value}% de desconto` : `R$ ${c.discount_value.toFixed(2)} de desconto`}
                                                </div>
                                                <div className="text-xs text-[#8A857D] mt-0.5 space-x-3">
                                                    <span>Usos: {c.uses}{c.max_uses ? `/${c.max_uses}` : ""}</span>
                                                    {c.valid_until && <span>Válido até: {new Date(c.valid_until).toLocaleDateString("pt-BR")}</span>}
                                                    <span>{apps.find(a => a.id === c.app_id)?.name || "App"}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => toggleCoupon(c)} className={`p-1.5 rounded-full transition-colors ${c.active ? "text-[#2D7A5C] hover:bg-[#F0F9F4]" : "text-[#8A857D] hover:bg-[#F5F0E8]"}`} title={c.active ? "Desativar" : "Ativar"}>
                                                {c.active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                                            </button>
                                            <button onClick={() => deleteCoupon(c.id)} className="p-1.5 rounded-full text-[#8A857D] hover:text-[#B04646] hover:bg-[#FDF4F1] transition-colors" title="Excluir">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </section>

            {showRegModal && (
                <AppRegistrationModal
                    onClose={() => setShowRegModal(false)}
                    onSuccess={() => appsAPI.myApps().then(setApps)}
                />
            )}

            {editApp && (
                <AppRegistrationModal
                    initialData={editApp}
                    onClose={() => setEditApp(null)}
                    onSuccess={() => appsAPI.myApps().then(setApps)}
                />
            )}

            {showCreate && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
                    <form onClick={(e) => e.stopPropagation()} onSubmit={create} className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto" data-testid="create-app-modal">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="font-serif-display text-2xl font-semibold">Publicar novo app</h2>
                                <p className="text-sm text-[#524F4A]">Preencha os detalhes do seu aplicativo.</p>
                            </div>
                            <button type="button" onClick={() => setShowCreate(false)}><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-4">
                            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome do app" className="w-full bg-[#FAF9F5] border border-[#E6E1D6] rounded-xl px-4 py-3 focus:outline-none focus:border-[#D97757]" data-testid="app-name" />
                            <input required value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} placeholder="Tagline (1 linha)" className="w-full bg-[#FAF9F5] border border-[#E6E1D6] rounded-xl px-4 py-3 focus:outline-none focus:border-[#D97757]" data-testid="app-tagline" />
                            <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descrição completa" rows={4} className="w-full bg-[#FAF9F5] border border-[#E6E1D6] rounded-xl px-4 py-3 focus:outline-none focus:border-[#D97757]" data-testid="app-description" />
                            <div className="grid grid-cols-3 gap-3">
                                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="bg-[#FAF9F5] border border-[#E6E1D6] rounded-xl px-4 py-3" data-testid="app-category">
                                    {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <input required type="number" step="0.01" value={form.price_monthly} onChange={(e) => setForm({ ...form, price_monthly: parseFloat(e.target.value) })} placeholder="Preço/mês" className="bg-[#FAF9F5] border border-[#E6E1D6] rounded-xl px-4 py-3" data-testid="app-price" />
                                <input required type="number" value={form.commission_pct} onChange={(e) => setForm({ ...form, commission_pct: parseInt(e.target.value) })} placeholder="% comissão" className="bg-[#FAF9F5] border border-[#E6E1D6] rounded-xl px-4 py-3" data-testid="app-commission" />
                            </div>
                            <input value={form.icon_url} onChange={(e) => setForm({ ...form, icon_url: e.target.value })} placeholder="URL do ícone" className="w-full bg-[#FAF9F5] border border-[#E6E1D6] rounded-xl px-4 py-3" data-testid="app-icon" />
                        </div>
                        <button type="submit" className="mt-6 w-full bg-[#D97757] hover:bg-[#C55D3D] text-white rounded-full py-3 font-semibold" data-testid="app-submit">Publicar app</button>
                    </form>
                </div>
            )}

            {showMaterials && materials && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => { setShowMaterials(null); setMaterials(null); }}>
                    <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="font-serif-display text-2xl">Materiais — {showMaterials.name}</h2>
                                <p className="text-sm text-[#524F4A]">Disponíveis para todos os afiliados deste app</p>
                            </div>
                            <button onClick={() => { setShowMaterials(null); setMaterials(null); }}><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-semibold mb-3">Banners</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {materials.banners.map((b, i) => (
                                        <div key={i} className="border border-[#E6E1D6] rounded-xl p-3 text-center">
                                            <img src={b.url} alt="" className="w-full aspect-square object-cover rounded-lg mb-2" />
                                            <p className="text-xs font-semibold">{b.label}</p>
                                            <p className="text-[10px] text-[#8A857D]">{b.size}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-3">Copy pronta</h3>
                                <div className="space-y-3">
                                    {materials.copy.map((c, i) => (
                                        <div key={i} className="bg-[#FAF9F5] border border-[#E6E1D6] rounded-xl p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs uppercase tracking-wider text-[#8A857D] font-semibold">{c.title}</span>
                                                <button onClick={() => { navigator.clipboard.writeText(c.text); toast.success("Copiado!"); }} className="text-[#D97757]" data-testid={`copy-text-${i}`}><Copy className="w-4 h-4" /></button>
                                            </div>
                                            <p className="text-sm text-[#1A1918]">{c.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-3">Hashtags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {materials.hashtags.map((h, i) => (
                                        <span key={i} className="bg-[#FDF4F1] text-[#A5472A] border border-[#FBE6DF] px-3 py-1 rounded-full text-xs font-semibold">{h}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showUpgrade && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowUpgrade(null)}>
                    <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto" data-testid="upgrade-modal">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="font-serif-display text-2xl font-semibold">Plano do app — {showUpgrade.name}</h2>
                                <p className="text-sm text-[#524F4A]">Escolha um plano para destacar seu app. Cobrança real será ativada com o Stripe.</p>
                            </div>
                            <button onClick={() => setShowUpgrade(null)}><X className="w-5 h-5" /></button>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                            {tiers.map((t) => {
                                const current = (showUpgrade.tier || "basico") === t.id;
                                const isPremium = t.id === "premium";
                                return (
                                    <div key={t.id} className={`relative rounded-2xl p-6 border-2 ${current ? "border-[#D97757]" : isPremium ? "border-[#E8C97A] bg-[#FBE9C4]/30" : "border-[#E6E1D6]"}`}>
                                        {isPremium && <Crown className="w-5 h-5 text-[#8A5A0A] absolute top-4 right-4" />}
                                        {t.id === "plus" && <Zap className="w-5 h-5 text-[#1E4D7B] absolute top-4 right-4" />}
                                        <h3 className="font-serif-display text-2xl font-semibold mb-1">{t.name}</h3>
                                        <div className="flex items-baseline gap-1 mb-4">
                                            <span className="font-serif-display text-4xl font-semibold">R$ {t.price}</span>
                                            <span className="text-xs text-[#8A857D]">/mês</span>
                                        </div>
                                        <ul className="space-y-2 mb-6 text-sm text-[#524F4A]">
                                            {t.perks.map((p, i) => <li key={i} className="flex items-start gap-2"><Check className="w-4 h-4 text-[#2D7A5C] mt-0.5 shrink-0" /> {p}</li>)}
                                        </ul>
                                        {current ? (
                                            <button disabled className="w-full bg-[#F5F0E8] text-[#524F4A] rounded-full py-2.5 text-sm font-semibold cursor-default" data-testid={`tier-current-${t.id}`}>Plano atual</button>
                                        ) : (
                                            <button onClick={() => upgradeTo(t.id)} className={`w-full rounded-full py-2.5 text-sm font-semibold transition-colors ${isPremium ? "bg-[#8A5A0A] hover:bg-[#6B4408] text-white" : t.id === "plus" ? "bg-[#1E4D7B] hover:bg-[#163A5C] text-white" : "bg-white border border-[#E6E1D6] hover:border-[#D97757] text-[#1A1918]"}`} data-testid={`tier-select-${t.id}`}>
                                                Escolher {t.name}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <p className="text-xs text-[#8A857D] text-center mt-6">Cobrança recorrente via Stripe será ativada em breve. Por enquanto a troca de plano é livre.</p>
                    </div>
                </div>
            )}

            {/* Modal: Criar cupom */}
            {showCouponModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowCouponModal(false)}>
                    <form onClick={e => e.stopPropagation()} onSubmit={createCoupon} className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl" data-testid="coupon-modal">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-serif-display text-2xl font-semibold">Novo cupom</h2>
                            <button type="button" onClick={() => setShowCouponModal(false)}><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">App *</label>
                                <select
                                    required
                                    value={couponForm.app_id}
                                    onChange={e => setCouponForm(f => ({ ...f, app_id: e.target.value }))}
                                    className="w-full bg-[#FAF9F5] border border-[#E6E1D6] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D97757]"
                                >
                                    <option value="">Selecione o app</option>
                                    {apps.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Código do cupom *</label>
                                <input
                                    required
                                    value={couponForm.code}
                                    onChange={e => setCouponForm(f => ({ ...f, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "") }))}
                                    placeholder="Ex: PROMO20"
                                    maxLength={20}
                                    className="w-full bg-[#FAF9F5] border border-[#E6E1D6] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D97757] font-mono uppercase"
                                    data-testid="coupon-code-input"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Tipo de desconto</label>
                                    <select
                                        value={couponForm.discount_type}
                                        onChange={e => setCouponForm(f => ({ ...f, discount_type: e.target.value }))}
                                        className="w-full bg-[#FAF9F5] border border-[#E6E1D6] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D97757]"
                                    >
                                        <option value="percent">Percentual (%)</option>
                                        <option value="fixed">Valor fixo (R$)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">
                                        {couponForm.discount_type === "percent" ? "Desconto (%)" : "Desconto (R$)"} *
                                    </label>
                                    <input
                                        required
                                        type="number"
                                        min="1"
                                        max={couponForm.discount_type === "percent" ? 100 : 9999}
                                        step={couponForm.discount_type === "percent" ? 1 : 0.01}
                                        value={couponForm.discount_value}
                                        onChange={e => setCouponForm(f => ({ ...f, discount_value: e.target.value }))}
                                        className="w-full bg-[#FAF9F5] border border-[#E6E1D6] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D97757]"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Máx. de usos</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={couponForm.max_uses}
                                        onChange={e => setCouponForm(f => ({ ...f, max_uses: e.target.value }))}
                                        placeholder="Sem limite"
                                        className="w-full bg-[#FAF9F5] border border-[#E6E1D6] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D97757]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Válido até</label>
                                    <input
                                        type="date"
                                        value={couponForm.valid_until}
                                        onChange={e => setCouponForm(f => ({ ...f, valid_until: e.target.value }))}
                                        className="w-full bg-[#FAF9F5] border border-[#E6E1D6] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D97757]"
                                    />
                                </div>
                            </div>
                        </div>
                        <button type="submit" className="mt-6 w-full bg-[#D97757] hover:bg-[#C55D3D] text-white rounded-full py-3 font-semibold transition-colors" data-testid="coupon-submit">
                            Criar cupom
                        </button>
                    </form>
                </div>
            )}
        </Layout>
    );
}
