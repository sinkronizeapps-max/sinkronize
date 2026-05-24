import { Layout } from "../components/Layout";
import { Link } from "react-router-dom";

const Section = ({ id, title, children }) => (
    <section id={id} className="mb-10">
        <h2 className="font-serif-display text-2xl font-semibold text-[#1A1918] mb-4">{title}</h2>
        <div className="text-[#524F4A] space-y-3 leading-relaxed text-sm">{children}</div>
    </section>
);

export default function Privacy() {
    const sections = [
        "Quem Somos", "Dados que Coletamos", "Como Usamos os Dados",
        "Compartilhamento de Dados", "Cookies e Rastreamento",
        "Segurança", "Retenção de Dados", "Seus Direitos (LGPD)",
        "Dados de Menores", "Alterações nesta Política", "Contato e DPO"
    ];

    return (
        <Layout>
            <section className="bg-gradient-to-br from-[#F5F0E8] to-[#FAF9F5] py-12">
                <div className="max-w-4xl mx-auto px-6 sm:px-8">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D97757]">Legal</span>
                    <h1 className="font-serif-display text-4xl lg:text-5xl font-semibold tracking-tight text-[#1A1918] mt-2 mb-3">Política de Privacidade</h1>
                    <p className="text-[#524F4A]">Última atualização: maio de 2025 · Em conformidade com a LGPD (Lei 13.709/2018)</p>
                </div>
            </section>

            <div className="max-w-4xl mx-auto px-6 sm:px-8 py-12 grid lg:grid-cols-4 gap-10">
                {/* Índice */}
                <aside className="lg:col-span-1">
                    <div className="sticky top-24 bg-white border border-[#E6E1D6] rounded-2xl p-5">
                        <p className="text-xs font-semibold uppercase tracking-widest text-[#8A857D] mb-3">Índice</p>
                        <nav className="space-y-1">
                            {sections.map((s, i) => (
                                <a key={i} href={`#p${i+1}`} className="block text-xs text-[#524F4A] hover:text-[#D97757] py-0.5 transition-colors">
                                    {i + 1}. {s}
                                </a>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Conteúdo */}
                <div className="lg:col-span-3">
                    <div className="bg-[#FDF4F1] border border-[#FBE6DF] rounded-2xl p-5 mb-8 text-sm text-[#A5472A]">
                        <strong>Resumo:</strong> Coletamos apenas os dados necessários para operar a plataforma. Não vendemos seus dados. Você pode solicitar exclusão a qualquer momento. Usamos Supabase (banco de dados), Stripe (pagamentos) e Resend (e-mails).
                    </div>

                    <Section id="p1" title="1. Quem Somos">
                        <p>A SINKRONIZE é uma plataforma de marketplace digital de aplicativos SaaS, operada no Brasil. Somos o <strong>Controlador</strong> dos dados pessoais coletados nesta plataforma, conforme definição da Lei Geral de Proteção de Dados (LGPD).</p>
                        <p>Contato: <a href="mailto:contatosinkronize@gmail.com" className="text-[#D97757] hover:underline">contatosinkronize@gmail.com</a></p>
                    </Section>

                    <Section id="p2" title="2. Dados que Coletamos">
                        <p><strong>Dados fornecidos por você:</strong></p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Nome completo e endereço de e-mail (cadastro)</li>
                            <li>Senha (armazenada de forma criptografada — nunca em texto plano)</li>
                            <li>CNPJ (opcional, para produtores)</li>
                            <li>Chave PIX (para solicitações de saque)</li>
                            <li>Foto de perfil (opcional)</li>
                            <li>Dados de contato enviados pelo formulário de contato</li>
                        </ul>
                        <p><strong>Dados coletados automaticamente:</strong></p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Endereço IP e dados de navegação (logs de acesso)</li>
                            <li>Dados de uso da plataforma (páginas visitadas, cliques)</li>
                            <li>Cookies de sessão e preferências</li>
                            <li>Dados de transação (valor, data, app adquirido — não inclui dados de cartão)</li>
                        </ul>
                        <p><strong>Dados de pagamento:</strong> Processados diretamente pelo Stripe. A SINKRONIZE não armazena números de cartão de crédito, CVV ou dados bancários completos.</p>
                    </Section>

                    <Section id="p3" title="3. Como Usamos os Dados">
                        <p>Utilizamos seus dados para:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>Execução do contrato:</strong> criar e gerenciar sua conta, processar pagamentos, calcular comissões e realizar saques</li>
                            <li><strong>Comunicação:</strong> enviar confirmações de compra, notificações de venda e e-mails transacionais essenciais</li>
                            <li><strong>Segurança:</strong> detectar fraudes, acessos não autorizados e atividades suspeitas</li>
                            <li><strong>Melhoria do serviço:</strong> análise de uso agregado (anonimizado) para aprimorar a plataforma</li>
                            <li><strong>Obrigações legais:</strong> cumprimento de obrigações fiscais e regulatórias</li>
                        </ul>
                        <p>Não utilizamos seus dados para publicidade de terceiros nem para venda de informações pessoais.</p>
                    </Section>

                    <Section id="p4" title="4. Compartilhamento de Dados">
                        <p>Seus dados são compartilhados apenas com:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>Stripe:</strong> processamento seguro de pagamentos (sujeito à <a href="https://stripe.com/br/privacy" target="_blank" rel="noopener noreferrer" className="text-[#D97757] hover:underline">política do Stripe</a>)</li>
                            <li><strong>Supabase:</strong> infraestrutura de banco de dados e autenticação (dados armazenados em servidores seguros)</li>
                            <li><strong>Resend:</strong> envio de e-mails transacionais</li>
                            <li><strong>Produtores:</strong> nome e e-mail do comprador são compartilhados com o produtor do app adquirido, para fins de entrega do serviço</li>
                        </ul>
                        <p>Não compartilhamos dados com anunciantes, corretores de dados ou outras plataformas de marketing.</p>
                        <p>Em caso de obrigação legal (decisão judicial, ordem administrativa), podemos divulgar dados às autoridades competentes.</p>
                    </Section>

                    <Section id="p5" title="5. Cookies e Rastreamento">
                        <p>Utilizamos os seguintes tipos de cookies:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>Essenciais:</strong> necessários para o funcionamento da plataforma (autenticação, sessão)</li>
                            <li><strong>Analíticos:</strong> PostHog (anonimizado) para entender como os usuários utilizam a plataforma</li>
                        </ul>
                        <p>Você pode desativar cookies não essenciais nas configurações do seu navegador. Isso pode afetar algumas funcionalidades da plataforma.</p>
                    </Section>

                    <Section id="p6" title="6. Segurança">
                        <p>Adotamos medidas técnicas e organizacionais para proteger seus dados, incluindo:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Criptografia de dados em trânsito (HTTPS/TLS)</li>
                            <li>Senhas armazenadas com hash seguro (bcrypt)</li>
                            <li>Controle de acesso por políticas de segurança em nível de linha (RLS)</li>
                            <li>Autenticação de dois fatores disponível</li>
                            <li>Backups regulares dos dados</li>
                        </ul>
                        <p>Em caso de incidente de segurança que afete seus dados, notificaremos conforme exigido pela LGPD.</p>
                    </Section>

                    <Section id="p7" title="7. Retenção de Dados">
                        <p>Mantemos seus dados pelo período necessário para:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Contas ativas: enquanto a conta existir</li>
                            <li>Registros de transações: 5 anos (obrigação fiscal)</li>
                            <li>Logs de acesso: 6 meses (Marco Civil da Internet)</li>
                            <li>Após exclusão de conta: dados anonimizados ou excluídos em até 30 dias, exceto onde houver obrigação legal</li>
                        </ul>
                    </Section>

                    <Section id="p8" title="8. Seus Direitos (LGPD)">
                        <p>Conforme a Lei 13.709/2018, você tem direito a:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>Acesso:</strong> saber quais dados temos sobre você</li>
                            <li><strong>Correção:</strong> corrigir dados incompletos ou desatualizados</li>
                            <li><strong>Exclusão:</strong> solicitar a exclusão de dados desnecessários</li>
                            <li><strong>Portabilidade:</strong> receber seus dados em formato estruturado</li>
                            <li><strong>Oposição:</strong> opor-se ao tratamento de dados em determinadas situações</li>
                            <li><strong>Revogação do consentimento:</strong> a qualquer momento</li>
                            <li><strong>Informação:</strong> ser informado sobre com quem compartilhamos seus dados</li>
                        </ul>
                        <p>Para exercer qualquer desses direitos, entre em contato: <a href="mailto:contatosinkronize@gmail.com" className="text-[#D97757] hover:underline">contatosinkronize@gmail.com</a>. Responderemos em até 15 dias úteis.</p>
                    </Section>

                    <Section id="p9" title="9. Dados de Menores">
                        <p>A plataforma SINKRONIZE não é destinada a menores de 18 anos. Não coletamos intencionalmente dados de crianças ou adolescentes. Se tomarmos conhecimento de que coletamos dados de um menor, excluiremos essas informações imediatamente.</p>
                    </Section>

                    <Section id="p10" title="10. Alterações nesta Política">
                        <p>Podemos atualizar esta Política de Privacidade periodicamente. Quando fizermos alterações significativas, notificaremos por e-mail e atualizaremos a data no topo desta página. Recomendamos que você revise esta política regularmente.</p>
                    </Section>

                    <Section id="p11" title="11. Contato e DPO">
                        <p>Para dúvidas sobre privacidade, exercício de direitos LGPD ou incidentes de segurança:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>E-mail: <a href="mailto:contatosinkronize@gmail.com" className="text-[#D97757] hover:underline">contatosinkronize@gmail.com</a></li>
                            <li>WhatsApp: (11) 96207-2438</li>
                        </ul>
                        <p>Também é possível registrar reclamações junto à Autoridade Nacional de Proteção de Dados (ANPD): <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer" className="text-[#D97757] hover:underline">www.gov.br/anpd</a></p>
                    </Section>

                    <div className="border-t border-[#E6E1D6] pt-6 flex items-center justify-between text-sm text-[#8A857D]">
                        <span>Versão 1.0 — Maio/2025</span>
                        <Link to="/termos" className="text-[#D97757] hover:underline">Ver Termos de Uso →</Link>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
