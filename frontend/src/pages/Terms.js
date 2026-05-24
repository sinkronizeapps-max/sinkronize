import { Layout } from "../components/Layout";
import { Link } from "react-router-dom";

const Section = ({ id, title, children }) => (
    <section id={id} className="mb-10">
        <h2 className="font-serif-display text-2xl font-semibold text-[#1A1918] mb-4">{title}</h2>
        <div className="text-[#524F4A] space-y-3 leading-relaxed text-sm">{children}</div>
    </section>
);

export default function Terms() {
    const sections = [
        "Aceitação dos Termos", "Descrição do Serviço", "Cadastro e Conta",
        "Responsabilidades do Produtor", "Responsabilidades do Afiliado",
        "Taxas e Comissões", "Pagamentos e Saques", "Política de Reembolso",
        "Propriedade Intelectual", "Limitação de Responsabilidade",
        "Rescisão", "Disposições Gerais"
    ];

    return (
        <Layout>
            <section className="bg-gradient-to-br from-[#F5F0E8] to-[#FAF9F5] py-12">
                <div className="max-w-4xl mx-auto px-6 sm:px-8">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D97757]">Legal</span>
                    <h1 className="font-serif-display text-4xl lg:text-5xl font-semibold tracking-tight text-[#1A1918] mt-2 mb-3">Termos de Uso</h1>
                    <p className="text-[#524F4A]">Última atualização: maio de 2025</p>
                </div>
            </section>

            <div className="max-w-4xl mx-auto px-6 sm:px-8 py-12 grid lg:grid-cols-4 gap-10">
                {/* Índice */}
                <aside className="lg:col-span-1">
                    <div className="sticky top-24 bg-white border border-[#E6E1D6] rounded-2xl p-5">
                        <p className="text-xs font-semibold uppercase tracking-widest text-[#8A857D] mb-3">Índice</p>
                        <nav className="space-y-1">
                            {sections.map((s, i) => (
                                <a key={i} href={`#s${i+1}`} className="block text-xs text-[#524F4A] hover:text-[#D97757] py-0.5 transition-colors">
                                    {i + 1}. {s}
                                </a>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Conteúdo */}
                <div className="lg:col-span-3">
                    <Section id="s1" title="1. Aceitação dos Termos">
                        <p>Ao acessar ou utilizar a plataforma SINKRONIZE ("Plataforma"), disponível em sinkronize.com.br, você ("Usuário") concorda em ficar vinculado a estes Termos de Uso ("Termos"). Caso não concorde com qualquer parte destes Termos, não utilize a Plataforma.</p>
                        <p>A SINKRONIZE é uma plataforma de marketplace digital que conecta produtores de aplicativos (SaaS) a afiliados e compradores finais, operada por pessoa jurídica sediada no Brasil.</p>
                        <p>Estes Termos constituem um contrato juridicamente vinculante entre você e a SINKRONIZE. Ao clicar em "Criar minha conta", você confirma que leu, entendeu e concorda com estes Termos e com nossa Política de Privacidade.</p>
                    </Section>

                    <Section id="s2" title="2. Descrição do Serviço">
                        <p>A SINKRONIZE oferece uma plataforma de marketplace digital onde:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>Produtores</strong> podem publicar e vender assinaturas de seus aplicativos;</li>
                            <li><strong>Afiliados</strong> podem divulgar aplicativos e receber comissões por vendas geradas;</li>
                            <li><strong>Compradores</strong> podem adquirir assinaturas de aplicativos disponíveis no marketplace.</li>
                        </ul>
                        <p>A SINKRONIZE atua exclusivamente como intermediadora tecnológica, não sendo responsável pela qualidade, funcionamento ou suporte dos aplicativos listados pelos produtores.</p>
                    </Section>

                    <Section id="s3" title="3. Cadastro e Conta">
                        <p>Para utilizar os recursos da Plataforma, é necessário criar uma conta fornecendo informações verdadeiras, precisas e atualizadas. O Usuário é responsável por manter a confidencialidade de sua senha e por todas as atividades realizadas em sua conta.</p>
                        <p>Ao se cadastrar, o Usuário declara que:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>É maior de 18 anos ou possui autorização de responsável legal;</li>
                            <li>As informações fornecidas são verdadeiras e completas;</li>
                            <li>Possui capacidade legal para celebrar contratos no Brasil.</li>
                        </ul>
                        <p>A SINKRONIZE reserva-se o direito de suspender ou encerrar contas que violem estes Termos.</p>
                    </Section>

                    <Section id="s4" title="4. Responsabilidades do Produtor">
                        <p>O Produtor que cadastra um aplicativo na plataforma declara e garante que:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Possui todos os direitos necessários para comercializar o aplicativo;</li>
                            <li>O aplicativo não viola direitos de terceiros, leis ou regulamentos;</li>
                            <li>As informações do produto (descrição, preço, funcionalidades) são verdadeiras;</li>
                            <li>Irá honrar as assinaturas vendidas e fornecer o serviço conforme descrito;</li>
                            <li>Possui CNPJ válido quando exigido para recebimento de valores;</li>
                            <li>É responsável pelo suporte ao cliente relativo ao seu aplicativo.</li>
                        </ul>
                        <p>O Produtor é o único responsável pelo conteúdo, funcionamento e suporte do aplicativo listado. A SINKRONIZE não garante a qualidade ou a disponibilidade de nenhum aplicativo cadastrado por terceiros.</p>
                    </Section>

                    <Section id="s5" title="5. Responsabilidades do Afiliado">
                        <p>O Afiliado que divulga aplicativos na Plataforma declara e garante que:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Divulgará os produtos de forma honesta e transparente;</li>
                            <li>Não utilizará práticas enganosas, spam ou técnicas de marketing abusivas;</li>
                            <li>Identificará claramente o conteúdo como publicidade/indicação remunerada;</li>
                            <li>Não utilizará links de afiliado em plataformas que proíbam tal prática;</li>
                            <li>É responsável por declarar suas comissões conforme a legislação tributária.</li>
                        </ul>
                        <p>Comissões serão pagas exclusivamente sobre vendas confirmadas e não estornadas. A SINKRONIZE pode cancelar afiliações em caso de práticas fraudulentas.</p>
                    </Section>

                    <Section id="s6" title="6. Taxas e Comissões">
                        <p>A SINKRONIZE cobra uma taxa de <strong>9,9%</strong> sobre o valor de cada transação confirmada. Esta taxa é descontada automaticamente antes da divisão entre produtor e afiliado.</p>
                        <p>As comissões dos afiliados são definidas livremente pelo produtor no momento do cadastro do aplicativo. O afiliado tem acesso às condições de comissão antes de se afiliar.</p>
                        <p>Exemplos de divisão (por venda de R$ 100,00):</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Taxa SINKRONIZE: R$ 9,90</li>
                            <li>Valor líquido: R$ 90,10</li>
                            <li>Com 30% de comissão: Afiliado R$ 27,03 / Produtor R$ 63,07</li>
                        </ul>
                        <p>A SINKRONIZE reserva-se o direito de alterar suas taxas mediante aviso prévio de 30 dias.</p>
                    </Section>

                    <Section id="s7" title="7. Pagamentos e Saques">
                        <p>Os pagamentos são processados pela plataforma Stripe, sujeita aos seus próprios termos e condições. A SINKRONIZE não armazena dados de cartão de crédito.</p>
                        <p>Os saldos acumulados ficam disponíveis na Carteira da Plataforma e podem ser sacados via PIX a qualquer momento, respeitando o saldo mínimo de R$ 20,00.</p>
                        <p>Saques são processados manualmente em até 5 dias úteis. A SINKRONIZE não se responsabiliza por atrasos causados por erros na chave PIX informada pelo usuário.</p>
                        <p>Valores decorrentes de chargebacks, disputas ou reembolsos poderão ser descontados do saldo disponível.</p>
                    </Section>

                    <Section id="s8" title="8. Política de Reembolso">
                        <p>Reembolsos são de responsabilidade do Produtor do aplicativo. O comprador deve contatar diretamente o produtor para solicitar reembolsos.</p>
                        <p>Em caso de fraude comprovada ou descumprimento das condições anunciadas pelo produtor, a SINKRONIZE poderá intermediar a resolução do conflito, mas não garante reembolso automático.</p>
                        <p>A SINKRONIZE recomenda que produtores adotem políticas claras de reembolso visíveis na página de venda de seus aplicativos.</p>
                    </Section>

                    <Section id="s9" title="9. Propriedade Intelectual">
                        <p>Toda a identidade visual, código, marca, logotipo e conteúdo da plataforma SINKRONIZE são de propriedade exclusiva da SINKRONIZE e protegidos pelas leis de propriedade intelectual brasileiras.</p>
                        <p>Os aplicativos listados pelos produtores permanecem de propriedade de seus respectivos titulares. Ao cadastrar um aplicativo, o produtor concede à SINKRONIZE uma licença não exclusiva para exibir, promover e comercializar o produto na plataforma.</p>
                    </Section>

                    <Section id="s10" title="10. Limitação de Responsabilidade">
                        <p>A SINKRONIZE não se responsabiliza por:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Qualidade, funcionamento ou disponibilidade dos aplicativos cadastrados por produtores;</li>
                            <li>Perdas financeiras decorrentes do uso da plataforma;</li>
                            <li>Interrupções temporárias do serviço por manutenção ou problemas técnicos;</li>
                            <li>Atos praticados por terceiros (produtores, afiliados ou compradores);</li>
                            <li>Danos indiretos, incidentais ou consequentes de qualquer natureza.</li>
                        </ul>
                        <p>A responsabilidade máxima da SINKRONIZE em qualquer circunstância se limita ao valor das taxas pagas pelo usuário nos últimos 3 meses.</p>
                    </Section>

                    <Section id="s11" title="11. Rescisão">
                        <p>O Usuário pode encerrar sua conta a qualquer momento entrando em contato com o suporte. O encerramento não cancela obrigações financeiras pendentes.</p>
                        <p>A SINKRONIZE pode suspender ou encerrar contas que:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Violem estes Termos ou qualquer lei aplicável;</li>
                            <li>Pratiquem fraude, abuso ou comportamento prejudicial à plataforma;</li>
                            <li>Estejam inativas por mais de 12 meses consecutivos.</li>
                        </ul>
                    </Section>

                    <Section id="s12" title="12. Disposições Gerais">
                        <p>Estes Termos são regidos pela legislação brasileira, especialmente o Código Civil, o Código de Defesa do Consumidor e a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018).</p>
                        <p>Eventuais disputas serão resolvidas no foro da Comarca de São Paulo/SP, com renúncia expressa a qualquer outro.</p>
                        <p>A SINKRONIZE reserva-se o direito de modificar estes Termos a qualquer momento, notificando os usuários por e-mail com 15 dias de antecedência. O uso continuado da plataforma após as alterações constitui aceitação dos novos termos.</p>
                        <p>Dúvidas: <a href="mailto:contatosinkronize@gmail.com" className="text-[#D97757] hover:underline">contatosinkronize@gmail.com</a></p>
                    </Section>

                    <div className="border-t border-[#E6E1D6] pt-6 flex items-center justify-between text-sm text-[#8A857D]">
                        <span>Versão 1.0 — Maio/2025</span>
                        <Link to="/privacidade" className="text-[#D97757] hover:underline">Ver Política de Privacidade →</Link>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
