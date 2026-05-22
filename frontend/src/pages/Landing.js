import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../lib/api";
import { Layout } from "../components/Layout";
import { AppCard } from "../components/AppCard";
import { ArrowRight, Sparkles, Users, TrendingUp, ShieldCheck, Zap, Award, ChartBar, Wallet, Megaphone } from "lucide-react";

const HERO_IMG = "https://images.unsplash.com/photo-1572021335469-31706a17aaef?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNDR8MHwxfHNlYXJjaHwyfHx5b3VuZyUyMGRpdmVyc2UlMjBwcm9mZXNzaW9uYWxzJTIwd29ya2luZyUyMG9uJTIwbGFwdG9wJTIwbW9kZXJuJTIwYnJpZ2h0JTIwb2ZmaWNlfGVufDB8fHx8MTc3OTQ3NjQwOHww&ixlib=rb-4.1.0&q=85";
const ABSTRACT = "https://static.prod-images.emergentagent.com/jobs/ffca4835-3ac6-4a72-8a6d-7c6ccc5f62ae/images/50362c9c9408dc81e507709977da56108e776ae1265c9428e377da3e7031b342.png";

const TRUSTED = ["nubank", "loft", "ifood", "stone", "creditas", "quintoandar", "rappi", "olist"];

export default function Landing() {
    const [apps, setApps] = useState([]);
    useEffect(() => {
        api.get("/apps?sort=featured").then((r) => setApps(r.data.slice(0, 8))).catch(() => {});
    }, []);

    return (
        <Layout>
            {/* HERO */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FAF9F5] via-[#F5F0E8] to-[#EBE4D5]" />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#D97757]/8 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
                <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-20 pb-24 lg:pt-32 lg:pb-32">
                    <div className="grid lg:grid-cols-12 gap-12 items-center">
                        <div className="lg:col-span-7 fade-up">
                            <span className="inline-flex items-center gap-2 bg-[#FDF4F1] text-[#A5472A] border border-[#FBE6DF] px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide mb-7">
                                <Sparkles className="w-3.5 h-3.5" /> Nova era de distribuição de apps
                            </span>
                            <h1 className="font-serif-display text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.02] text-[#1A1918] text-balance mb-7">
                                Apps que vendem.<br/>
                                Afiliados que <span className="italic font-light text-[#D97757]">prosperam</span>.
                            </h1>
                            <p className="text-lg lg:text-xl text-[#524F4A] leading-relaxed max-w-2xl mb-10">
                                A SINKRONIZE conecta desenvolvedores de apps de assinatura com uma rede curada de afiliados — comissões automáticas, pagamentos sincronizados, comunidade que cresce junto.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link to="/register" className="inline-flex items-center gap-2 bg-[#D97757] text-white hover:bg-[#C55D3D] rounded-full px-8 py-4 text-base font-semibold transition-all shadow-[0_8px_24px_rgba(217,119,87,0.25)] hover:shadow-[0_12px_32px_rgba(217,119,87,0.35)] hover:-translate-y-0.5" data-testid="hero-cta-primary">
                                    Começar agora <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link to="/marketplace" className="inline-flex items-center gap-2 bg-white text-[#1A1918] hover:border-[#D97757] hover:text-[#D97757] border border-[#E6E1D6] rounded-full px-8 py-4 text-base font-semibold transition-colors" data-testid="hero-cta-secondary">
                                    Ver marketplace
                                </Link>
                            </div>
                            <div className="flex items-center gap-8 mt-12 text-sm text-[#524F4A]">
                                <div><span className="font-serif-display text-2xl text-[#1A1918] font-semibold">R$ 12M+</span><div className="text-xs text-[#8A857D] uppercase tracking-wider mt-1">transacionados</div></div>
                                <div className="w-px h-10 bg-[#E6E1D6]" />
                                <div><span className="font-serif-display text-2xl text-[#1A1918] font-semibold">8.4k</span><div className="text-xs text-[#8A857D] uppercase tracking-wider mt-1">afiliados ativos</div></div>
                                <div className="w-px h-10 bg-[#E6E1D6] hidden sm:block" />
                                <div className="hidden sm:block"><span className="font-serif-display text-2xl text-[#1A1918] font-semibold">320+</span><div className="text-xs text-[#8A857D] uppercase tracking-wider mt-1">apps publicados</div></div>
                            </div>
                        </div>
                        <div className="lg:col-span-5 relative fade-up delay-2">
                            <div className="relative">
                                <div className="absolute -inset-4 bg-gradient-to-br from-[#D97757]/15 to-transparent rounded-[2.5rem] blur-2xl" />
                                <div className="relative rounded-[2rem] overflow-hidden border border-[#E6E1D6] shadow-[0_24px_64px_rgba(26,25,24,0.12)]">
                                    <img src={HERO_IMG} alt="" className="w-full h-[480px] object-cover" />
                                </div>
                                <div className="absolute -bottom-6 -left-6 bg-white border border-[#E6E1D6] rounded-2xl p-5 shadow-xl max-w-[240px] float-soft">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-[#2D7A5C]" />
                                        <span className="text-xs uppercase tracking-widest text-[#8A857D] font-semibold">Venda ao vivo</span>
                                    </div>
                                    <p className="font-serif-display text-lg text-[#1A1918] leading-tight">+R$ 47,30</p>
                                    <p className="text-xs text-[#524F4A]">Marina recebeu comissão de Mente Calma</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SOCIAL PROOF MARQUEE */}
            <section className="py-12 border-y border-[#E6E1D6] bg-[#F5F0E8]/60 overflow-hidden">
                <p className="text-center text-xs uppercase tracking-[0.25em] text-[#8A857D] mb-8 font-semibold">Produtores e afiliados que confiam</p>
                <div className="flex gap-16 marquee whitespace-nowrap">
                    {[...TRUSTED, ...TRUSTED].map((b, i) => (
                        <span key={i} className="font-serif-display text-2xl text-[#8A857D] tracking-tight italic">{b}</span>
                    ))}
                </div>
            </section>

            {/* VALUE PROP BENTO */}
            <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-24 lg:py-32">
                <div className="max-w-3xl mb-16">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D97757]">A plataforma</span>
                    <h2 className="font-serif-display text-4xl sm:text-5xl font-semibold tracking-tight text-[#1A1918] mt-3 mb-5">
                        Um ecossistema desenhado<br/>para crescer junto.
                    </h2>
                    <p className="text-lg text-[#524F4A]">Tudo que produtores e afiliados precisam para prosperar — em um único lugar elegante.</p>
                </div>
                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-[#1A1918] text-white rounded-3xl p-10 lg:p-12 relative overflow-hidden">
                        <Megaphone className="w-7 h-7 text-[#D97757] mb-5" strokeWidth={1.5} />
                        <h3 className="font-serif-display text-3xl mb-4">Para produtores</h3>
                        <p className="text-[#C8C3B8] leading-relaxed mb-6 max-w-md">Publique seu app, defina a comissão e deixe milhares de afiliados venderem por você. Receba via PIX automático.</p>
                        <Link to="/produtores" className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-[#D97757]" data-testid="bento-producer-link">
                            Conheça as ferramentas <ArrowRight className="w-4 h-4" />
                        </Link>
                        <img src={ABSTRACT} alt="" className="absolute -right-12 -bottom-12 w-72 opacity-50" />
                    </div>
                    <div className="bg-[#D97757] text-white rounded-3xl p-10">
                        <Users className="w-7 h-7 mb-5" strokeWidth={1.5} />
                        <h3 className="font-serif-display text-2xl mb-3">Para afiliados</h3>
                        <p className="text-white/85 leading-relaxed text-sm mb-6">Escolha apps que você ama, divulgue com link único e receba comissões recorrentes a cada assinatura.</p>
                        <Link to="/afiliados" className="inline-flex items-center gap-2 text-sm font-semibold" data-testid="bento-affiliate-link">
                            Como funciona <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    {[
                        { icon: ChartBar, title: "Analytics em tempo real", body: "Acompanhe vendas, conversões e ticket médio em dashboards limpos e acionáveis." },
                        { icon: Wallet, title: "Carteira interna + PIX", body: "Saldo consolidado, saques instantâneos via PIX e relatórios fiscais prontos." },
                        { icon: Award, title: "Níveis de afiliado", body: "Bronze, Prata e Ouro — comissões aceleradas e bônus exclusivos conforme você cresce." },
                        { icon: ShieldCheck, title: "Antifraude embarcado", body: "Tracking de cliques, validação de pagamentos e chargebacks tratados pela plataforma." },
                    ].map((f, i) => (
                        <div key={i} className="bg-white border border-[#E6E1D6] rounded-3xl p-8 hover:border-[#D97757]/40 hover:shadow-[0_8px_24px_rgba(217,119,87,0.08)] transition-all" data-testid={`bento-feature-${i}`}>
                            <f.icon className="w-6 h-6 text-[#D97757] mb-5" strokeWidth={1.5} />
                            <h3 className="font-serif-display text-xl text-[#1A1918] mb-2">{f.title}</h3>
                            <p className="text-sm text-[#524F4A] leading-relaxed">{f.body}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section id="como-funciona" className="bg-[#F5F0E8] py-24 lg:py-32">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                    <div className="max-w-2xl mb-20">
                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D97757]">Como funciona</span>
                        <h2 className="font-serif-display text-4xl sm:text-5xl font-semibold tracking-tight text-[#1A1918] mt-3">
                            Em três passos<br/>tudo está em sincronia.
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { n: "01", t: "Publique ou afilie-se", d: "Produtores cadastram seu app em minutos. Afiliados navegam o marketplace e escolhem o que combina com sua audiência." },
                            { n: "02", t: "Divulgue com link único", d: "Cada afiliado recebe um link com tracking. Cliques, conversões e ticket médio aparecem no painel em tempo real." },
                            { n: "03", t: "Receba via PIX", d: "Vendas processadas? Saldo na carteira. Saque quando quiser. Splits automáticos entre produtor, afiliado e plataforma." },
                        ].map((s, i) => (
                            <div key={i} className="fade-up" style={{animationDelay: `${i * 0.1}s`}}>
                                <div className="font-serif-display text-5xl text-[#D97757] mb-6">{s.n}</div>
                                <h3 className="font-serif-display text-2xl text-[#1A1918] mb-3">{s.t}</h3>
                                <p className="text-[#524F4A] leading-relaxed">{s.d}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* TOP APPS */}
            <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-24 lg:py-32">
                <div className="flex items-end justify-between mb-12 flex-wrap gap-6">
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D97757]">Marketplace</span>
                        <h2 className="font-serif-display text-4xl sm:text-5xl font-semibold tracking-tight text-[#1A1918] mt-3">Apps em destaque</h2>
                    </div>
                    <Link to="/marketplace" className="inline-flex items-center gap-2 text-sm font-semibold text-[#1A1918] hover:text-[#D97757]" data-testid="see-all-apps">
                        Ver todos os apps <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {apps.map((a) => <AppCard key={a.app_id} app={a} />)}
                </div>
            </section>

            {/* NUMBERS */}
            <section className="bg-[#1A1918] text-white py-24 lg:py-32">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D97757]">Em números</span>
                            <h2 className="font-serif-display text-4xl sm:text-5xl font-semibold tracking-tight mt-3 mb-6">
                                O resultado fala<br/>por si.
                            </h2>
                            <p className="text-[#C8C3B8] text-lg leading-relaxed">Uma plataforma que cresce porque ajuda as pessoas certas a ganharem com o que amam.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-12">
                            {[
                                { v: "R$ 12.4M", l: "Volume transacionado" },
                                { v: "8.4k", l: "Afiliados ativos" },
                                { v: "320+", l: "Apps publicados" },
                                { v: "97%", l: "Saques aprovados em 24h" },
                            ].map((s, i) => (
                                <div key={i}>
                                    <div className="font-serif-display text-5xl lg:text-6xl text-[#D97757] mb-2">{s.v}</div>
                                    <div className="text-sm text-[#C8C3B8]">{s.l}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* FINAL CTA */}
            <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-24 lg:py-32">
                <div className="bg-gradient-to-br from-[#D97757] to-[#C55D3D] rounded-[2.5rem] p-12 lg:p-20 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <Zap className="w-10 h-10 mx-auto mb-6" strokeWidth={1.5} />
                    <h2 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl font-semibold mb-6 text-balance">
                        Pronto para sincronizar<br className="hidden sm:block"/> seu próximo capítulo?
                    </h2>
                    <p className="text-lg lg:text-xl text-white/90 max-w-2xl mx-auto mb-10">Cadastro grátis. Sem mensalidade. Você só paga quando ganha.</p>
                    <Link to="/register" className="inline-flex items-center gap-2 bg-white text-[#1A1918] hover:bg-[#FAF9F5] rounded-full px-8 py-4 text-base font-semibold transition-colors" data-testid="final-cta-button">
                        Criar minha conta <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>
        </Layout>
    );
}
