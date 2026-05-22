import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";
import { ArrowRight, Check, TrendingUp, Wallet, BarChart3, Megaphone, ShieldCheck, Users } from "lucide-react";

export function ForProducers() {
    return (
        <Layout>
            <section className="bg-gradient-to-br from-[#F5F0E8] to-[#FAF9F5] py-20 lg:py-28">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <span className="text-xs uppercase tracking-[0.2em] text-[#D97757] font-semibold">Para produtores</span>
                        <h1 className="font-serif-display text-5xl lg:text-6xl font-semibold mt-3 leading-tight mb-6">Seu app, milhares de vendedores.</h1>
                        <p className="text-lg text-[#524F4A] mb-8">Publique seu aplicativo, defina a comissão e deixe nossa rede de afiliados vender por você. Sem mensalidade, você só paga uma pequena taxa por venda.</p>
                        <Link to="/register" className="inline-flex items-center gap-2 bg-[#D97757] hover:bg-[#C55D3D] text-white rounded-full px-8 py-4 font-semibold transition-colors" data-testid="producer-cta">Publicar meu app <ArrowRight className="w-4 h-4" /></Link>
                    </div>
                    <div className="relative">
                        <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&q=85" alt="" className="rounded-3xl border border-[#E6E1D6] shadow-2xl" />
                    </div>
                </div>
            </section>
            <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { icon: Users, t: "Rede pronta", d: "Acesso a 8.4k afiliados ativos prontos para vender seu produto." },
                        { icon: BarChart3, t: "Analytics completo", d: "Veja em tempo real cliques, conversões, ticket médio e LTV." },
                        { icon: Wallet, t: "Pagamentos automáticos", d: "Receba via PIX direto na sua carteira após cada venda confirmada." },
                        { icon: Megaphone, t: "Materiais prontos", d: "Banners, copies e hashtags geradas automaticamente para seus afiliados." },
                        { icon: ShieldCheck, t: "Antifraude", d: "Detecção de cliques inválidos e proteção contra chargebacks." },
                        { icon: TrendingUp, t: "Sem limite de crescimento", d: "Sem mensalidade. Só taxa por venda. Quanto mais você cresce, mais lucra." },
                    ].map((f, i) => (
                        <div key={i} className="bg-white border border-[#E6E1D6] rounded-2xl p-7 hover:border-[#D97757]/40 transition-colors">
                            <f.icon className="w-6 h-6 text-[#D97757] mb-4" strokeWidth={1.5} />
                            <h3 className="font-serif-display text-xl mb-2">{f.t}</h3>
                            <p className="text-sm text-[#524F4A]">{f.d}</p>
                        </div>
                    ))}
                </div>
            </section>
            <section className="max-w-4xl mx-auto px-6 py-20">
                <div className="bg-[#1A1918] text-white rounded-3xl p-12 text-center">
                    <h2 className="font-serif-display text-4xl mb-4">Comece a vender em minutos.</h2>
                    <p className="text-white/70 mb-8">Sem burocracia. Sem mensalidade. Sem limites.</p>
                    <Link to="/register" className="inline-flex items-center gap-2 bg-[#D97757] hover:bg-[#C55D3D] text-white rounded-full px-8 py-4 font-semibold">Criar minha conta <ArrowRight className="w-4 h-4" /></Link>
                </div>
            </section>
        </Layout>
    );
}

export function ForAffiliates() {
    return (
        <Layout>
            <section className="bg-gradient-to-br from-[#1A1918] to-[#2A2825] text-white py-20 lg:py-28 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#D97757]/20 rounded-full blur-3xl" />
                <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                    <span className="text-xs uppercase tracking-[0.2em] text-[#D97757] font-semibold">Para afiliados</span>
                    <h1 className="font-serif-display text-5xl lg:text-7xl font-semibold mt-3 leading-tight mb-6 max-w-3xl">Transforme sua audiência em <span className="italic font-light text-[#D97757]">renda recorrente</span>.</h1>
                    <p className="text-xl text-white/80 max-w-2xl mb-10">Escolha apps que você ama, divulgue com links únicos e receba comissões a cada nova assinatura — mês após mês.</p>
                    <Link to="/register" className="inline-flex items-center gap-2 bg-[#D97757] hover:bg-[#C55D3D] text-white rounded-full px-8 py-4 font-semibold" data-testid="affiliate-cta">Quero ser afiliado <ArrowRight className="w-4 h-4" /></Link>
                </div>
            </section>
            <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20">
                <h2 className="font-serif-display text-4xl text-center mb-16">Programa de níveis</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        { tier: "Bronze", color: "#A5472A", req: "Inicial", b: ["Comissão padrão", "Link único", "Materiais básicos"] },
                        { tier: "Prata", color: "#524F4A", req: "R$ 1.000 em vendas", b: ["+5% sobre comissão", "Suporte prioritário", "Bônus mensais"] },
                        { tier: "Ouro", color: "#D97757", req: "R$ 5.000 em vendas", b: ["+10% sobre comissão", "Acesso antecipado a apps", "Mentorias exclusivas"] },
                    ].map((t, i) => (
                        <div key={i} className="bg-white border border-[#E6E1D6] rounded-3xl p-8 hover:border-[#D97757]/40 transition-colors">
                            <div className="w-12 h-12 rounded-full mb-5" style={{ background: `${t.color}20`, border: `2px solid ${t.color}` }} />
                            <h3 className="font-serif-display text-2xl mb-1">{t.tier}</h3>
                            <p className="text-sm text-[#8A857D] mb-6">{t.req}</p>
                            <ul className="space-y-2 text-sm">
                                {t.b.map((bb, j) => <li key={j} className="flex items-start gap-2"><Check className="w-4 h-4 text-[#2D7A5C] mt-0.5 shrink-0" /> {bb}</li>)}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>
        </Layout>
    );
}
