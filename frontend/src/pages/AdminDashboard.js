import { useState } from "react";
import { supabase } from "../lib/supabase";
import {
    Users, ShoppingBag, TrendingUp, DollarSign,
    Eye, EyeOff, BarChart3, UserCheck,
    ShoppingCart, Package, Search, RefreshCw,
    Mail, LogOut
} from "lucide-react";

const ADMIN_EMAIL = "sinkronizeapps@gmail.com";
const LOGO = "/sinkronize-icon.png";

const fmt = (v) => {
    const n = parseFloat(v || 0);
    return "R$ " + n.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};
const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—";

export default function AdminDashboard() {
    // ── Auth local ─────────────────────────────────────────────────────────────
    const [email, setEmail]       = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw]     = useState(false);
    const [authErr, setAuthErr]   = useState("");
    const [authLoad, setAuthLoad] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);

    // ── Dados ──────────────────────────────────────────────────────────────────
    const [producers,   setProducers]   = useState([]);
    const [affiliates,  setAffiliates]  = useState([]);
    const [clients,     setClients]     = useState([]);
    const [sales,       setSales]       = useState([]);
    const [apps,        setApps]        = useState([]);
    const [affiliations,setAffiliations]= useState([]);
    const [abandoned,   setAbandoned]   = useState([]);
    const [withdrawals, setWithdrawals] = useState([]);
    const [dataLoad,    setDataLoad]    = useState(false);

    // ── UI ─────────────────────────────────────────────────────────────────────
    const [tab,    setTab]    = useState("overview");
    const [search, setSearch] = useState("");

    // ── Login ──────────────────────────────────────────────────────────────────
    const handleLogin = async (e) => {
        e.preventDefault();
        setAuthErr("");
        setAuthLoad(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw new Error("E-mail ou senha incorretos");
            if (data.user?.email !== ADMIN_EMAIL) {
                await supabase.auth.signOut();
                throw new Error("Acesso não autorizado");
            }
            setLoggedIn(true);
            loadAll();
        } catch (err) {
            setAuthErr(err.message);
        } finally {
            setAuthLoad(false);
        }
    };

    // ── Carregar dados ─────────────────────────────────────────────────────────
    const loadAll = async () => {
        setDataLoad(true);
        try {
            const [
                { data: profsData },
                { data: salesData },
                { data: appsData },
                { data: affsData },
                { data: attemptsData },
                { data: withdrawalsData },
            ] = await Promise.all([
                supabase.from("profiles").select("*").order("created_at", { ascending: false }),
                supabase.from("sales").select("*").order("created_at", { ascending: false }),
                supabase.from("apps").select("*").order("created_at", { ascending: false }),
                supabase.from("affiliations").select("*").order("created_at", { ascending: false }),
                supabase.from("checkout_attempts").select("*").order("created_at", { ascending: false }),
                supabase.from("withdrawals").select("*, profiles(name, email)").order("created_at", { ascending: false }),
            ]);

            const profs = profsData || [];
            setProducers(profs.filter(p => p.role === "producer"));
            setAffiliates(profs.filter(p => p.role === "affiliate"));
            setApps(appsData || []);
            setAffiliations(affsData || []);

            const salesList = salesData || [];
            setSales(salesList);

            const buyerMap = {};
            salesList.forEach(s => {
                if (!buyerMap[s.buyer_email]) {
                    buyerMap[s.buyer_email] = { name: s.buyer_name, email: s.buyer_email, purchases: 0, total: 0 };
                }
                buyerMap[s.buyer_email].purchases++;
                buyerMap[s.buyer_email].total += parseFloat(s.amount || 0);
            });
            setClients(Object.values(buyerMap).sort((a, b) => b.total - a.total));

            const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
            setAbandoned((attemptsData || []).filter(
                a => a.status === "abandoned" || (a.status === "pending" && a.created_at < twoHoursAgo)
            ));
            setWithdrawals(withdrawalsData || []);
        } finally {
            setDataLoad(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setLoggedIn(false);
        setEmail(""); setPassword("");
    };

    const filter = (items, keys) => {
        if (!search.trim()) return items;
        const s = search.toLowerCase();
        return items.filter(item => keys.some(k => String(item[k] || "").toLowerCase().includes(s)));
    };

    // ── Tela de login ──────────────────────────────────────────────────────────
    if (!loggedIn) {
        return (
            <div className="min-h-screen bg-[#1A1918] flex items-center justify-center p-6">
                <div className="w-full max-w-sm">
                    <div className="flex items-center justify-center gap-3 mb-8">
                        <img src={LOGO} alt="" className="w-10 h-10 rounded-xl" />
                        <span className="text-white font-semibold text-xl tracking-widest">SINKRONIZE</span>
                    </div>
                    <div className="bg-[#242220] rounded-3xl p-8 border border-[#333]">
                        <h2 className="text-white text-center font-semibold text-lg mb-1">Painel Administrativo</h2>
                        <p className="text-[#8A857D] text-center text-sm mb-6">Acesso restrito</p>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="E-mail"
                                required
                                autoFocus
                                className="w-full bg-[#1A1918] border border-[#333] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#D97757] transition-colors placeholder:text-[#555]"
                            />
                            <div className="relative">
                                <input
                                    type={showPw ? "text" : "password"}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Senha"
                                    required
                                    className="w-full bg-[#1A1918] border border-[#333] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#D97757] transition-colors placeholder:text-[#555] pr-12"
                                />
                                <button type="button" onClick={() => setShowPw(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-white">
                                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {authErr && <p className="text-red-400 text-xs text-center">{authErr}</p>}
                            <button type="submit" disabled={authLoad}
                                className="w-full bg-[#D97757] hover:bg-[#C55D3D] disabled:opacity-60 text-white rounded-xl py-3 font-semibold transition-colors text-sm">
                                {authLoad ? "Entrando..." : "Entrar"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // ── Métricas ───────────────────────────────────────────────────────────────
    const totalRevenue  = sales.reduce((a, s) => a + parseFloat(s.amount || 0), 0);
    const totalPlatform = sales.reduce((a, s) => a + parseFloat(s.platform_amount || 0), 0);

    const TABS = [
        { id: "overview",   label: "Visão Geral",  icon: BarChart3 },
        { id: "producers",  label: "Produtores",   icon: Package,      count: producers.length },
        { id: "affiliates", label: "Afiliados",    icon: UserCheck,    count: affiliates.length },
        { id: "clients",    label: "Clientes",     icon: Users,        count: clients.length },
        { id: "sales",      label: "Vendas",       icon: DollarSign,   count: sales.length },
        { id: "abandoned",  label: "Abandonados",  icon: ShoppingCart, count: abandoned.length },
        { id: "withdrawals",label: "Saques",       icon: DollarSign,   count: withdrawals.filter(w => w.status === "pending").length },
    ];

    const markWithdrawalPaid = async (id) => {
        await supabase.from("withdrawals").update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", id);
        setWithdrawals(ws => ws.map(w => w.id === id ? { ...w, status: "paid" } : w));
    };

    const TH = ({ children }) => (
        <th className="text-left px-4 py-3 text-xs font-semibold text-[#8A857D] uppercase tracking-wider whitespace-nowrap">{children}</th>
    );
    const TD = ({ children, cls = "" }) => (
        <td className={`px-4 py-3 text-sm text-[#524F4A] ${cls}`}>{children}</td>
    );
    const Avatar = ({ name, picture }) => (
        picture
            ? <img src={picture} className="w-7 h-7 rounded-full object-cover shrink-0" alt="" />
            : <div className="w-7 h-7 rounded-full bg-[#D97757] text-white flex items-center justify-center text-xs font-bold shrink-0">
                {name?.[0]?.toUpperCase() || "?"}
              </div>
    );

    return (
        <div className="min-h-screen bg-[#FAF9F5]">
            {/* Topbar */}
            <header className="bg-[#1A1918] text-white px-6 py-4 flex items-center justify-between sticky top-0 z-40">
                <div className="flex items-center gap-3">
                    <img src={LOGO} alt="" className="w-8 h-8 rounded-lg" />
                    <span className="font-semibold tracking-widest text-sm">SINKRONIZE ADMIN</span>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={loadAll} title="Atualizar" className="text-[#8A857D] hover:text-white transition-colors">
                        <RefreshCw className={`w-4 h-4 ${dataLoad ? "animate-spin" : ""}`} />
                    </button>
                    <button onClick={handleLogout} className="flex items-center gap-1.5 text-[#8A857D] hover:text-white text-xs transition-colors">
                        <LogOut className="w-4 h-4" /> Sair
                    </button>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Tabs */}
                <div className="flex gap-2 flex-wrap mb-8">
                    {TABS.map(t => (
                        <button key={t.id} onClick={() => { setTab(t.id); setSearch(""); }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                tab === t.id ? "bg-[#1A1918] text-white" : "bg-white border border-[#E6E1D6] text-[#524F4A] hover:border-[#D97757]"
                            }`}>
                            <t.icon className="w-4 h-4" />
                            {t.label}
                            {t.count !== undefined && (
                                <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.id ? "bg-white/20" : "bg-[#F5F0E8] text-[#8A857D]"}`}>
                                    {t.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Busca */}
                {tab !== "overview" && (
                    <div className="mb-5">
                        <div className="relative max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A857D]" />
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..."
                                className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E6E1D6] rounded-xl text-sm focus:outline-none focus:border-[#D97757]" />
                        </div>
                    </div>
                )}

                {/* ── VISÃO GERAL ──────────────────────────────────────────── */}
                {tab === "overview" && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: "Volume Total",    value: fmt(totalRevenue),  icon: TrendingUp, color: "text-[#2D7A5C]", bg: "bg-[#F0FAF5]" },
                                { label: "Taxa Plataforma", value: fmt(totalPlatform), icon: DollarSign, color: "text-[#D97757]", bg: "bg-[#FDF4F1]" },
                                { label: "Total Vendas",    value: sales.length,       icon: ShoppingBag,color: "text-[#1A1918]", bg: "bg-[#F5F0E8]" },
                                { label: "Usuários",        value: producers.length + affiliates.length + clients.length, icon: Users, color: "text-[#524F4A]", bg: "bg-[#F5F0E8]" },
                            ].map(m => (
                                <div key={m.label} className="bg-white rounded-2xl p-5 border border-[#E6E1D6]">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs text-[#8A857D] uppercase tracking-wider">{m.label}</span>
                                        <div className={`${m.bg} p-1.5 rounded-lg`}><m.icon className={`w-4 h-4 ${m.color}`} /></div>
                                    </div>
                                    <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
                                </div>
                            ))}
                        </div>
                        <div className="grid lg:grid-cols-3 gap-4">
                            <div className="bg-white rounded-2xl p-5 border border-[#E6E1D6]">
                                <h3 className="font-semibold text-[#1A1918] mb-4">Últimas Vendas</h3>
                                <div className="space-y-3">
                                    {sales.slice(0, 6).map(s => (
                                        <div key={s.id} className="flex items-center justify-between">
                                            <div><p className="text-sm font-medium text-[#1A1918]">{s.buyer_name}</p><p className="text-xs text-[#8A857D]">{s.app_name}</p></div>
                                            <span className="text-sm font-semibold text-[#2D7A5C]">{fmt(s.amount)}</span>
                                        </div>
                                    ))}
                                    {!sales.length && <p className="text-sm text-[#8A857D]">Nenhuma venda ainda</p>}
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl p-5 border border-[#E6E1D6]">
                                <h3 className="font-semibold text-[#1A1918] mb-4">Apps Cadastrados</h3>
                                <div className="space-y-3">
                                    {apps.slice(0, 6).map(a => (
                                        <div key={a.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {a.icon_url ? <img src={a.icon_url} className="w-7 h-7 rounded-lg object-cover" alt="" /> : <div className="w-7 h-7 rounded-lg bg-[#F5F0E8]" />}
                                                <span className="text-sm font-medium text-[#1A1918]">{a.name}</span>
                                            </div>
                                            <span className="text-xs text-[#8A857D]">{a.subscribers || 0} assin.</span>
                                        </div>
                                    ))}
                                    {!apps.length && <p className="text-sm text-[#8A857D]">Nenhum app ainda</p>}
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl p-5 border border-[#E6E1D6]">
                                <h3 className="font-semibold text-[#1A1918] mb-4">Abandonados Recentes</h3>
                                <div className="space-y-3">
                                    {abandoned.slice(0, 6).map(a => (
                                        <div key={a.id} className="flex items-center justify-between">
                                            <div><p className="text-sm font-medium text-[#1A1918]">{a.buyer_name || a.buyer_email}</p><p className="text-xs text-[#8A857D]">{a.app_name}</p></div>
                                            <span className="text-sm font-semibold text-amber-600">{fmt(a.amount)}</span>
                                        </div>
                                    ))}
                                    {!abandoned.length && <p className="text-sm text-[#8A857D]">Nenhum abandono</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── PRODUTORES ─────────────────────────────────────────────── */}
                {tab === "producers" && (
                    <div className="bg-white rounded-2xl border border-[#E6E1D6] overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-[#F5F0E8]"><tr><TH>Nome</TH><TH>E-mail</TH><TH>CNPJ</TH><TH>Saldo</TH><TH>Apps</TH><TH>Cadastro</TH></tr></thead>
                            <tbody className="divide-y divide-[#E6E1D6]">
                                {filter(producers, ["name", "email", "cnpj"]).map(p => (
                                    <tr key={p.id} className="hover:bg-[#FAF9F5]">
                                        <TD><div className="flex items-center gap-2"><Avatar name={p.name} picture={p.picture} /><span className="font-medium text-[#1A1918]">{p.name}</span></div></TD>
                                        <TD><a href={`mailto:${p.email}`} className="flex items-center gap-1 hover:text-[#D97757]"><Mail className="w-3 h-3" />{p.email}</a></TD>
                                        <TD>{p.cnpj || <span className="text-[#C4BDB5]">—</span>}</TD>
                                        <TD cls="font-semibold text-[#2D7A5C]">{fmt(p.balance)}</TD>
                                        <TD>{apps.filter(a => a.producer_id === p.id).length}</TD>
                                        <TD cls="text-xs text-[#8A857D]">{fmtDate(p.created_at)}</TD>
                                    </tr>
                                ))}
                                {!producers.length && <tr><td colSpan={6} className="px-4 py-10 text-center text-[#8A857D]">Nenhum produtor ainda</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── AFILIADOS ──────────────────────────────────────────────── */}
                {tab === "affiliates" && (
                    <div className="bg-white rounded-2xl border border-[#E6E1D6] overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-[#F5F0E8]"><tr><TH>Nome</TH><TH>E-mail</TH><TH>Tier</TH><TH>Saldo</TH><TH>Afiliações</TH><TH>Vendas</TH><TH>Cadastro</TH></tr></thead>
                            <tbody className="divide-y divide-[#E6E1D6]">
                                {filter(affiliates, ["name", "email"]).map(a => {
                                    const myAffs = affiliations.filter(af => af.affiliate_id === a.id);
                                    const totalSales = myAffs.reduce((s, af) => s + (af.sales || 0), 0);
                                    return (
                                        <tr key={a.id} className="hover:bg-[#FAF9F5]">
                                            <TD><div className="flex items-center gap-2"><Avatar name={a.name} picture={a.picture} /><span className="font-medium text-[#1A1918]">{a.name}</span></div></TD>
                                            <TD><a href={`mailto:${a.email}`} className="flex items-center gap-1 hover:text-[#D97757]"><Mail className="w-3 h-3" />{a.email}</a></TD>
                                            <TD>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${a.affiliate_tier === "ouro" ? "bg-yellow-100 text-yellow-700" : a.affiliate_tier === "prata" ? "bg-gray-100 text-gray-600" : "bg-orange-100 text-orange-700"}`}>
                                                    {a.affiliate_tier || "bronze"}
                                                </span>
                                            </TD>
                                            <TD cls="font-semibold text-[#2D7A5C]">{fmt(a.balance)}</TD>
                                            <TD>{myAffs.length}</TD>
                                            <TD>{totalSales}</TD>
                                            <TD cls="text-xs text-[#8A857D]">{fmtDate(a.created_at)}</TD>
                                        </tr>
                                    );
                                })}
                                {!affiliates.length && <tr><td colSpan={7} className="px-4 py-10 text-center text-[#8A857D]">Nenhum afiliado ainda</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── CLIENTES ───────────────────────────────────────────────── */}
                {tab === "clients" && (
                    <div className="bg-white rounded-2xl border border-[#E6E1D6] overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-[#F5F0E8]"><tr><TH>Nome</TH><TH>E-mail</TH><TH>Compras</TH><TH>Total Gasto</TH></tr></thead>
                            <tbody className="divide-y divide-[#E6E1D6]">
                                {filter(clients, ["name", "email"]).map((c, i) => (
                                    <tr key={i} className="hover:bg-[#FAF9F5]">
                                        <TD><div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-[#E6E1D6] text-[#524F4A] flex items-center justify-center text-xs font-bold shrink-0">{c.name?.[0]?.toUpperCase() || "?"}</div><span className="font-medium text-[#1A1918]">{c.name}</span></div></TD>
                                        <TD><a href={`mailto:${c.email}`} className="flex items-center gap-1 hover:text-[#D97757]"><Mail className="w-3 h-3" />{c.email}</a></TD>
                                        <TD>{c.purchases}</TD>
                                        <TD cls="font-semibold text-[#2D7A5C]">{fmt(c.total)}</TD>
                                    </tr>
                                ))}
                                {!clients.length && <tr><td colSpan={4} className="px-4 py-10 text-center text-[#8A857D]">Nenhum cliente ainda</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── VENDAS ─────────────────────────────────────────────────── */}
                {tab === "sales" && (
                    <div className="bg-white rounded-2xl border border-[#E6E1D6] overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-[#F5F0E8]"><tr><TH>Comprador</TH><TH>App</TH><TH>Total</TH><TH>Produtor</TH><TH>Afiliado</TH><TH>Plataforma</TH><TH>Parcelas</TH><TH>Data</TH></tr></thead>
                            <tbody className="divide-y divide-[#E6E1D6]">
                                {filter(sales, ["buyer_name", "buyer_email", "app_name"]).map(s => (
                                    <tr key={s.id} className="hover:bg-[#FAF9F5]">
                                        <TD><p className="font-medium text-[#1A1918]">{s.buyer_name}</p><p className="text-xs text-[#8A857D]">{s.buyer_email}</p></TD>
                                        <TD>{s.app_name}</TD>
                                        <TD cls="font-semibold text-[#1A1918]">{fmt(s.amount)}</TD>
                                        <TD cls="font-semibold text-[#2D7A5C]">{fmt(s.producer_amount)}</TD>
                                        <TD cls="text-[#D97757]">{parseFloat(s.affiliate_amount || 0) > 0 ? <span className="font-semibold">{fmt(s.affiliate_amount)}</span> : <span className="text-[#C4BDB5]">—</span>}</TD>
                                        <TD>{fmt(s.platform_amount)}</TD>
                                        <TD>{s.installments || 1}x</TD>
                                        <TD cls="text-xs text-[#8A857D] whitespace-nowrap">{fmtDate(s.created_at)}</TD>
                                    </tr>
                                ))}
                                {!sales.length && <tr><td colSpan={8} className="px-4 py-10 text-center text-[#8A857D]">Nenhuma venda ainda</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── SAQUES ─────────────────────────────────────────────────── */}
                {tab === "withdrawals" && (
                    <div className="space-y-4">
                        <div className="bg-[#FDF4F1] border border-[#FBE6DF] rounded-2xl p-4 text-sm text-[#A5472A]">
                            Solicitações de saque dos produtores e afiliados. Clique em "Marcar como pago" após realizar o PIX.
                        </div>
                        <div className="bg-white rounded-2xl border border-[#E6E1D6] overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-[#F5F0E8]"><tr><TH>Usuário</TH><TH>Valor</TH><TH>Chave PIX</TH><TH>Status</TH><TH>Solicitado em</TH><TH>Ação</TH></tr></thead>
                                <tbody className="divide-y divide-[#E6E1D6]">
                                    {filter(withdrawals, ["pix_key"]).map(w => (
                                        <tr key={w.id} className="hover:bg-[#FAF9F5]">
                                            <TD>
                                                <p className="font-medium text-[#1A1918]">{w.profiles?.name || "—"}</p>
                                                <p className="text-xs text-[#8A857D]">{w.profiles?.email}</p>
                                            </TD>
                                            <TD cls="font-semibold text-[#2D7A5C] text-base">{fmt(w.amount)}</TD>
                                            <TD cls="font-mono text-xs">{w.pix_key}</TD>
                                            <TD>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${w.status === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                                                    {w.status === "paid" ? "✓ Pago" : "Pendente"}
                                                </span>
                                            </TD>
                                            <TD cls="text-xs text-[#8A857D] whitespace-nowrap">{fmtDate(w.created_at)}</TD>
                                            <TD>
                                                {w.status === "pending" && (
                                                    <button onClick={() => markWithdrawalPaid(w.id)} className="bg-[#2D7A5C] hover:bg-[#236249] text-white text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors">
                                                        Marcar como pago
                                                    </button>
                                                )}
                                            </TD>
                                        </tr>
                                    ))}
                                    {!withdrawals.length && <tr><td colSpan={6} className="px-4 py-10 text-center text-[#8A857D]">Nenhuma solicitação ainda</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── CARRINHOS ABANDONADOS ──────────────────────────────────── */}
                {tab === "abandoned" && (
                    <div className="space-y-4">
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
                            Checkouts iniciados e não finalizados (mais de 2h sem pagamento confirmado).
                        </div>
                        <div className="bg-white rounded-2xl border border-[#E6E1D6] overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-[#F5F0E8]"><tr><TH>Comprador</TH><TH>App</TH><TH>Valor</TH><TH>Cód. Afiliado</TH><TH>Status</TH><TH>Data</TH></tr></thead>
                                <tbody className="divide-y divide-[#E6E1D6]">
                                    {filter(abandoned, ["buyer_name", "buyer_email", "app_name"]).map(a => (
                                        <tr key={a.id} className="hover:bg-[#FAF9F5]">
                                            <TD><p className="font-medium text-[#1A1918]">{a.buyer_name || "—"}</p><p className="text-xs text-[#8A857D]">{a.buyer_email}</p></TD>
                                            <TD>{a.app_name}</TD>
                                            <TD cls="font-semibold text-amber-600">{fmt(a.amount)}</TD>
                                            <TD>{a.affiliation_code || <span className="text-[#C4BDB5]">—</span>}</TD>
                                            <TD>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${a.status === "abandoned" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"}`}>
                                                    {a.status === "abandoned" ? "Abandonado" : "Não finalizado"}
                                                </span>
                                            </TD>
                                            <TD cls="text-xs text-[#8A857D] whitespace-nowrap">{fmtDate(a.created_at)}</TD>
                                        </tr>
                                    ))}
                                    {!abandoned.length && <tr><td colSpan={6} className="px-4 py-10 text-center text-[#8A857D]">Nenhum carrinho abandonado</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
