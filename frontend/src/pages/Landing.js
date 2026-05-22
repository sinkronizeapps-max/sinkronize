import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../lib/api";
import { Layout } from "../components/Layout";
import { AppCard } from "../components/AppCard";
import { ArrowRight, Sparkles, Users, TrendingUp, ShieldCheck, Zap, Award, ChartBar, Wallet, Megaphone, Calculator } from "lucide-react";

const HERO_IMG = "https://images.unsplash.com/photo-1572021335469-31706a17aaef?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNDR8MHwxfHNlYXJjaHwyfHx5b3VuZyUyMGRpdmVyc2UlMjBwcm9mZXNzaW9uYWxzJTIwd29ya2luZyUyMG9uJTIwbGFwdG9wJTIwbW9kZXJuJTIwYnJpZ2h0JTIwb2ZmaWNlfGVufDB8fHx8MTc3OTQ3NjQwOHww&ixlib=rb-4.1.0&q=85";
const ABSTRACT = "https://static.prod-images.emergentagent.com/jobs/ffca4835-3ac6-4a72-8a6d-7c6ccc5f62ae/images/50362c9c9408dc81e507709977da56108e776ae1265c9428e377da3e7031b342.png";

const CATEGORIES = ["Bem-estar", "Produtividade", "Fitness", "Finanças", "Culinária", "Educação", "Pets", "Negócios"];

function EarningsCalculator() {
    const [price, setPrice] = useState(29.9);
    const [commission, setCommission] = useState(50);
    const [sales, setSales] = useState(30);
    const platformFee = 9.9;
    const afterPlatform = price * (1 - platformFee / 100);
    const affiliatePer = afterPlatform * (commission / 100);
    const producerPer = afterPlatform - affiliatePer;
    const monthlyAffiliate = affiliatePer * sales;
    const monthlyProducer = producerPer * sales;

    return (
        <div className="bg-white border border-[#E6E1D6] rounded-3xl p-8 lg:p-12" data-testid="earnings-calculator">
            <div className="flex items-center gap-3 mb-2">
                <Calculator className="w-6 h-6 text-[#D97757]" strokeWidth={1.5} />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D97757]">Calculadora honesta</span>
            </div>
            <h3 className="font-serif-display text-3xl lg:text-4xl font-semibold tracking-tight text-[#1A1918] mb-2">Quanto você pode ganhar?</h3>
            <p className="text-[#524F4A] mb-8">Ajuste os valores e veja o split em tempo real.</p>

            <div className="grid lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-medium text-[#1A1918]">Preço da assinatura</label>
                            <span className="font-serif-display text-lg font-semibold">R$ {price.toFixed(2)}</span>
                        </div>
                        <input type="range" min="9.9" max="199" step="1" value={price} onChange={(e) => setPrice(parseFloat(e.target.value))} className="w-full accent-[#D97757]" data-testid="calc-price" />
                    </div>
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-medium text-[#1A1918]">Comissão do afiliado</label>
                            <span className="font-serif-display text-lg font-semibold">{commission}%</span>
                        </div>
                        <input type="range" min="10" max="80" step="5" value={commission} onChange={(e) => setCommission(parseInt(e.target.value))} className="w-full accent-[#D97757]" data-testid="calc-commission" />
                    </div>
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-medium text-[#1A1918]">Vendas por mês</label>
                            <span className="font-serif-display text-lg font-semibold">{sales}</span>
                        </div>
                        <input type="range" min="1" max="500" step="1" value={sales} onChange={(e) => setSales(parseInt(e.target.value))} className="w-full accent-[#D97757]" data-testid="calc-sales" />
                    </div>
                </div>

                <div className="bg-[#F5F0E8] rounded-2xl p-6 lg:p-8 space-y-5">
                    <div>
                        <div className="text-xs uppercase tracking-widest text-[#8A857D] font-semibold mb-1">Afiliado recebe / mês</div>
                        <div className="font-serif-display text-4xl text-[#D97757] font-semibold">R$ {monthlyAffiliate.toFixed(2)}</div>
                    </div>
                    <div className="border-t border-[#E6E1D6] pt-5">
                        <div className="text-xs uppercase tracking-widest text-[#8A857D] font-semibold mb-1">Produtor recebe / mês</div>
                        <div className="font-serif-display text-4xl text-[#1A1918] font-semibold">R$ {monthlyProducer.toFixed(2)}</div>
                    </div>
                    <div className="border-t border-[#E6E1D6] pt-5 text-sm text-[#524F4A] space-y-1">
                        <div className="flex justify-between"><span>Taxa SINKRONIZE (9,9%)</span><span>R$ {(price * platformFee / 100 * sales).toFixed(2)}</span></div>
                        <div className="flex justify-between font-semibold text-[#1A1918]"><span>Volume total</span><span>R$ {(price * sales).toFixed(2)}</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

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
                            <span className="inline-flex items-center gap-2 bg-[#1A1918] text-white px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide mb-7">
                                <Sparkles className="w-3.5 h-3.5 text-[#D97757]" /> Acesso antecipado · Vagas limitadas
                            </span>
                            <h1 className="font-serif-display text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.02] text-[#1A1918] text-balance mb-7">
                                Apps que vendem.<br/>
                                Afiliados que <span className="italic font-light text-[#D97757]">prosperam</span>.
                            </h1>
                            <p className="text-lg lg:text-xl text-[#524F4A] leading-relaxed max-w-2xl mb-10">
                                A SINKRONIZE está chegando para conectar desenvolvedores de apps de assinatura com uma nova geração de afiliados — divisão automática de comissões, recebimentos rápidos via PIX, comunidade que cresce junto.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link to="/register" className="inline-flex items-center gap-2 bg-[#D97757] text-white hover:bg-[#C55D3D] rounded-full px-8 py-4 text-base font-semibold transition-all shadow-[0_8px_24px_rgba(217,119,87,0.25)] hover:shadow-[0_12px_32px_rgba(217,119,87,0.35)] hover:-translate-y-0.5" data-testid="hero-cta-primary">
                                    Garantir vaga de fundador <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link to="/marketplace" className="inline-flex items-center gap-2 bg-white text-[#1A1918] hover:border-[#D97757] hover:text-[#D97757] border border-[#E6E1D6] rounded-full px-8 py-4 text-base font-semibold transition-colors" data-testid="hero-cta-secondary">
                                    Ver marketplace
                                </Link>
                            </div>
                            <div className="mt-12 flex items-start gap-3 max-w-lg">
                                <div className="w-10 h-10 rounded-full bg-[#FDF4F1] border border-[#FBE6DF] flex items-center justify-center shrink-0">
                                    <Award className="w-5 h-5 text-[#A5472A]" strokeWidth={1.5} />
                                </div>
                                <div>
                                    <p className="font-semibold text-[#1A1918] text-sm">Programa Fundadores</p>
                                    <p className="text-sm text-[#524F4A] leading-relaxed">Os 100 primeiros produtores ficam com o <strong>primeiro mês sem taxa de plataforma</strong> e ganham selo permanente "Membro Fundador".</p>
                                </div>
                            </div>
                        </div>
                        <div className="lg:col-span-5 relative fade-up delay-2">
                            <div className="relative">
                                <div className="absolute -inset-4 bg-gradient-to-br from-[#D97757]/15 to-transparent rounded-[2.5rem] blur-2xl" />
                                <div className="relative rounded-[2rem] overflow-hidden border border-[#E6E1D6] shadow-[0_24px_64px_rgba(26,25,24,0.12)]">
                                    <img src={HERO_IMG} alt="" className="w-full h-[480px] object-cover" />
                                </div>
                                <div className="absolute -bottom-6 -left-6 bg-white border border-[#E6E1D6] rounded-2xl p-5 shadow-xl max-w-[260px] float-soft">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] uppercase tracking-widest text-[#D97757] font-bold">EXEMPLO</span>
                                        <div className="w-2 h-2 rounded-full bg-[#2D7A5C]" />
                                    </div>
                                    <p className="font-serif-display text-lg text-[#1A1918] leading-tight">+R$ 47,30</p>
                                    <p className="text-xs text-[#524F4A]">Como aparecem as comissões no seu painel</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CATEGORIES MARQUEE */}
            <section className="py-12 border-y border-[#E6E1D6] bg-[#F5F0E8]/60 overflow-hidden">
                <p className="text-center text-xs uppercase tracking-[0.25em] text-[#8A857D] mb-8 font-semibold">Categorias para todo tipo de criador</p>
                <div className="flex gap-12 marquee whitespace-nowrap">
                    {[...CATEGORIES, ...CATEGORIES, ...CATEGORIES].map((c, i) => (
                        <span key={i} className="font-serif-display text-2xl text-[#8A857D] tracking-tight italic">{c}</span>
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
                        <p className="text-[#C8C3B8] leading-relaxed mb-6 max-w-md">Publique seu app, defina a comissão e deixe uma rede de afiliados divulgar por você. Receba via PIX automático.</p>
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
                        { icon: ChartBar, title: "Métricas em tempo real", body: "Acompanhe vendas, conversões e ticket médio em painéis limpos e acionáveis." },
                        { icon: Wallet, title: "Carteira interna + PIX", body: "Saldo consolidado, saques via PIX e relatórios fiscais prontos quando precisar." },
                        { icon: Award, title: "Níveis de afiliado", body: "Bronze, Prata e Ouro — benefícios e bônus aceleram conforme você cresce." },
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

            {/* CALCULATOR */}
            <section className="bg-[#F5F0E8] py-24 lg:py-32">
                <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
                    <EarningsCalculator />
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section id="como-funciona" className="py-24 lg:py-32">
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
                            { n: "03", t: "Receba via PIX", d: "Vendas processadas? Saldo na carteira. Saque quando quiser. Divisão automática entre produtor, afiliado e plataforma." },
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
                        <h2 className="font-serif-display text-4xl sm:text-5xl font-semibold tracking-tight text-[#1A1918] mt-3">Primeiros apps publicados</h2>
                    </div>
                    <Link to="/marketplace" className="inline-flex items-center gap-2 text-sm font-semibold text-[#1A1918] hover:text-[#D97757]" data-testid="see-all-apps">
                        Ver todos <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {apps.map((a) => <AppCard key={a.app_id} app={a} />)}
                </div>
            </section>

            {/* HONEST SPECS */}
            <section className="bg-[#1A1918] text-white py-24 lg:py-32">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                    <div className="grid md:grid-cols-2 gap-16 items-start">
                        <div>
                            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D97757]">A engenharia</span>
                            <h2 className="font-serif-display text-4xl sm:text-5xl font-semibold tracking-tight mt-3 mb-6">
                                Sem promessas vazias.<br/>Só estrutura sólida.
                            </h2>
                            <p className="text-[#C8C3B8] text-lg leading-relaxed mb-8">Estamos começando — mas a infraestrutura é de plataforma madura. Veja exatamente o que está pronto:</p>
                            <Link to="/register" className="inline-flex items-center gap-2 bg-[#D97757] hover:bg-[#C55D3D] text-white rounded-full px-7 py-3 font-semibold">
                                Quero fazer parte <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="space-y-5">
                            {[
                                { t: "Divisão automática", d: "Cada venda é dividida na hora entre produtor, afiliado e plataforma, sem intervenção manual." },
                                { t: "Taxa fixa 9,9%", d: "Sem mensalidade. Sem letras miúdas. Você só paga quando vende." },
                                { t: "PIX integrado", d: "Saques caem direto na sua chave PIX cadastrada." },
                                { t: "Tracking de afiliados", d: "Cada afiliado tem código único com rastreamento de cliques, conversões e ticket médio." },
                                { t: "Materiais prontos", d: "Banners, copy e hashtags geradas automaticamente para cada app." },
                            ].map((s, i) => (
                                <div key={i} className="flex gap-4 pb-5 border-b border-[#3A3935] last:border-0">
                                    <div className="w-7 h-7 rounded-full bg-[#D97757]/15 border border-[#D97757]/30 flex items-center justify-center shrink-0 mt-0.5">
                                        <span className="text-[10px] font-bold text-[#D97757]">{String(i + 1).padStart(2, "0")}</span>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-1">{s.t}</h4>
                                        <p className="text-sm text-[#C8C3B8] leading-relaxed">{s.d}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* COMING SOON / TESTIMONIALS PLACEHOLDER */}
            <section className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 py-24 text-center">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D97757]">Em breve</span>
                <h2 className="font-serif-display text-4xl sm:text-5xl font-semibold tracking-tight text-[#1A1918] mt-3 mb-5">Histórias dos nossos fundadores.</h2>
                <p className="text-lg text-[#524F4A] max-w-2xl mx-auto">Os primeiros produtores e afiliados que entrarem agora terão seus depoimentos publicados aqui. Quem sabe o próximo seja o seu?</p>
            </section>

            {/* FINAL BRAND CLOSER */}
            <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 lg:py-24">
                <div className="bg-[#F5F0E8] rounded-[2.5rem] p-12 lg:p-20 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D97757]/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#A5472A]/8 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />
                    <div className="relative flex flex-col items-center">
                        <img src="https://customer-assets.emergentagent.com/job_affiliate-hub-v1/artifacts/76xgxdey_L.png" alt="SINKRONIZE" className="w-full max-w-lg lg:max-w-2xl object-contain mb-10 drop-shadow-[0_12px_32px_rgba(217,119,87,0.2)]" />
                        <p className="text-lg text-[#524F4A] max-w-xl mb-10">Apps que vendem. Afiliados que prosperam. Comece sua jornada com a gente.</p>
                        <Link to="/register" className="inline-flex items-center gap-2 bg-[#D97757] hover:bg-[#C55D3D] text-white rounded-full px-8 py-4 text-base font-semibold transition-all shadow-[0_8px_24px_rgba(217,119,87,0.25)] hover:shadow-[0_12px_32px_rgba(217,119,87,0.35)] hover:-translate-y-0.5" data-testid="final-cta-button">
                            Criar minha conta <ArrowRight className="w-4 h-4" />
                        </Link>
                        <p className="text-xs text-[#8A857D] mt-6">Cadastro grátis · Primeiro mês sem taxa para os 100 primeiros produtores</p>
                    </div>
                </div>
            </section>
        </Layout>
    );
}
