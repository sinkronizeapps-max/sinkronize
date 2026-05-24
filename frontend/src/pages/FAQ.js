import { useState } from "react";
import { Layout } from "../components/Layout";
import { ChevronDown, Link as LinkIcon } from "lucide-react";
import { Link } from "react-router-dom";

const FAQS = {
    "Geral": [
        {
            q: "O que é a SINKRONIZE?",
            a: "A SINKRONIZE é um marketplace de aplicativos SaaS com programa de afiliados integrado. Produtores publicam seus apps, afiliados divulgam e ganham comissão por cada assinatura vendida, e compradores adquirem acesso a ferramentas digitais."
        },
        {
            q: "Como funciona a taxa da plataforma?",
            a: "A SINKRONIZE cobra 9,9% sobre cada transação confirmada. Esse valor é descontado automaticamente do total antes da divisão entre produtor e afiliado. Não há mensalidade nem taxa de adesão."
        },
        {
            q: "A plataforma é gratuita para se cadastrar?",
            a: "Sim, o cadastro é 100% gratuito para produtores, afiliados e compradores. Só cobramos a taxa de 9,9% quando uma venda é efetivada."
        },
        {
            q: "Quais formas de pagamento são aceitas?",
            a: "Aceitamos cartão de crédito (em até 12x sem juros) e PIX, processados com segurança pela plataforma Stripe."
        },
    ],
    "Produtores": [
        {
            q: "Como publico meu aplicativo na SINKRONIZE?",
            a: "Crie sua conta como Produtor, acesse o Painel do Produtor e clique em 'Novo App'. Preencha as 6 abas (Dados, Mídia, Plano, Afiliação, Links e Integração) e publique. Seu app ficará disponível no marketplace em instantes."
        },
        {
            q: "Posso definir livremente a comissão dos afiliados?",
            a: "Sim! Você escolhe o percentual de comissão (de 0% a 100%), o modo de afiliação (aberto para todos, aprovação manual ou fechado) e pode alterar isso a qualquer momento pelo painel."
        },
        {
            q: "Quando recebo meu dinheiro?",
            a: "O saldo é creditado na sua Carteira imediatamente após a confirmação do pagamento. Você pode solicitar saque via PIX a qualquer momento — os saques são processados em até 5 dias úteis."
        },
        {
            q: "Preciso de CNPJ para receber?",
            a: "O CNPJ não é obrigatório para se cadastrar, mas pode ser exigido dependendo do volume de faturamento para fins fiscais. Recomendamos consultar um contador para regularizar sua situação."
        },
        {
            q: "Posso usar webhook para receber notificações de venda?",
            a: "Sim! Na aba Integração do seu app, você pode configurar uma URL de webhook. A SINKRONIZE enviará um POST com os dados da venda em tempo real sempre que uma assinatura for confirmada."
        },
        {
            q: "Como funciona a aprovação de afiliados?",
            a: "Se você configurar o modo 'Aprovação manual', cada solicitação de afiliação aparecerá no seu painel para você aprovar ou rejeitar. No modo 'Aberto', qualquer afiliado pode se vincular automaticamente."
        },
    ],
    "Afiliados": [
        {
            q: "Como me torno afiliado de um app?",
            a: "Crie uma conta como Afiliado, acesse o Painel do Afiliado e veja a seção 'Apps disponíveis'. Clique em 'Afiliar-se' no app desejado. Se o modo for aberto, você receberá seu link na hora. Se for manual, aguarde a aprovação do produtor."
        },
        {
            q: "Como funciona meu link de afiliado?",
            a: "Cada afiliação gera um código único. Seu link de divulgação é: sinkronize.com.br/app/[slug-do-app]?ref=[seu-codigo]. Toda compra feita por esse link é rastreada e a comissão é creditada automaticamente."
        },
        {
            q: "Quando recebo minhas comissões?",
            a: "As comissões são creditadas na sua Carteira imediatamente após a confirmação do pagamento pelo comprador. Você pode sacar via PIX a qualquer momento."
        },
        {
            q: "O que são os níveis Bronze, Prata e Ouro?",
            a: "São níveis de reconhecimento baseados no total acumulado em vendas: Bronze (início), Prata (R$ 1.000+ em vendas) e Ouro (R$ 5.000+ em vendas). Cada nível oferece benefícios extras como bônus percentuais sobre comissões."
        },
        {
            q: "Posso me afiliar a vários apps ao mesmo tempo?",
            a: "Sim! Não há limite de afiliações. Você pode divulgar quantos apps quiser simultaneamente, cada um com seu próprio link e rastreamento."
        },
    ],
    "Compradores": [
        {
            q: "Como faço para assinar um aplicativo?",
            a: "Acesse o Marketplace, encontre o app desejado, clique em 'Assinar agora' e preencha seus dados na página de checkout. O pagamento é processado com segurança pelo Stripe."
        },
        {
            q: "Como acesso o app após a compra?",
            a: "Após a confirmação do pagamento, você receberá um e-mail com as instruções de acesso. O produtor é responsável por fornecer o acesso ao aplicativo adquirido."
        },
        {
            q: "Posso cancelar minha assinatura?",
            a: "Sim. Entre em contato diretamente com o produtor do aplicativo para solicitar o cancelamento. As condições de cancelamento e reembolso são definidas por cada produtor."
        },
        {
            q: "Minhas informações de pagamento estão seguras?",
            a: "Absolutamente. Os dados do seu cartão são inseridos diretamente no ambiente seguro do Stripe (certificação PCI-DSS) e nunca passam pelos nossos servidores. A SINKRONIZE não armazena nenhum dado financeiro."
        },
        {
            q: "Não recebi o acesso ao app que comprei. O que faço?",
            a: "Primeiro, verifique sua caixa de spam. Se ainda assim não receber, entre em contato com o produtor pelo e-mail de contato dele. Se não obtiver resposta, fale conosco pelo WhatsApp (11) 96207-2438 ou pelo formulário de contato."
        },
    ],
};

function Item({ q, a }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-[#E6E1D6] last:border-0">
            <button
                onClick={() => setOpen(v => !v)}
                className="w-full flex items-start justify-between gap-4 py-5 text-left"
            >
                <span className="font-semibold text-[#1A1918] text-sm leading-relaxed">{q}</span>
                <ChevronDown className={`w-5 h-5 text-[#8A857D] shrink-0 mt-0.5 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            {open && (
                <div className="pb-5 text-sm text-[#524F4A] leading-relaxed">{a}</div>
            )}
        </div>
    );
}

export default function FAQ() {
    const [activeTab, setActiveTab] = useState("Geral");
    return (
        <Layout>
            <section className="bg-gradient-to-br from-[#F5F0E8] to-[#FAF9F5] py-16">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D97757]">Suporte</span>
                    <h1 className="font-serif-display text-4xl lg:text-5xl font-semibold tracking-tight text-[#1A1918] mt-3 mb-4">
                        Perguntas Frequentes
                    </h1>
                    <p className="text-lg text-[#524F4A] max-w-xl mx-auto">
                        Encontre respostas rápidas sobre a plataforma. Não achou? Fale com a gente.
                    </p>
                </div>
            </section>

            <section className="max-w-3xl mx-auto px-6 sm:px-8 py-14">
                {/* Tabs */}
                <div className="flex gap-2 flex-wrap mb-8 justify-center">
                    {Object.keys(FAQS).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                                activeTab === tab
                                    ? "bg-[#1A1918] text-white"
                                    : "bg-white border border-[#E6E1D6] text-[#524F4A] hover:border-[#D97757]"
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="bg-white border border-[#E6E1D6] rounded-2xl px-6">
                    {FAQS[activeTab].map((item, i) => (
                        <Item key={i} {...item} />
                    ))}
                </div>

                {/* CTA contato */}
                <div className="mt-10 bg-[#F5F0E8] rounded-2xl p-6 text-center">
                    <p className="font-semibold text-[#1A1918] mb-1">Ainda tem dúvidas?</p>
                    <p className="text-sm text-[#524F4A] mb-4">Nossa equipe responde em até 24h úteis.</p>
                    <Link to="/contato" className="inline-block bg-[#D97757] hover:bg-[#C55D3D] text-white rounded-full px-6 py-2.5 text-sm font-semibold transition-colors">
                        Falar com a equipe
                    </Link>
                </div>
            </section>
        </Layout>
    );
}
