import { Link } from "react-router-dom";
import { Instagram, Twitter, Youtube, Linkedin } from "lucide-react";

const LOGO = "/sinkronize-icon.png";

export const Footer = () => (
    <footer className="bg-[#1A1918] text-[#E6E1D6] mt-32">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20">
            <div className="grid md:grid-cols-5 gap-12">
                <div className="md:col-span-2">
                    <div className="flex items-center gap-3 mb-6">
                        <img src={LOGO} alt="SINKRONIZE" className="w-10 h-10 rounded-xl" />
                        <span className="font-serif-display text-xl font-semibold text-white">SINKRONIZE</span>
                    </div>
                    <p className="text-sm text-[#8A857D] leading-relaxed max-w-sm">
                        A plataforma onde desenvolvedores criam apps incríveis e afiliados transformam essas conexões em renda real.
                    </p>
                    <div className="flex gap-3 mt-6">
                        {[Instagram, Twitter, Youtube, Linkedin].map((Icon, i) => (
                            <a key={i} href="#" className="w-9 h-9 rounded-full border border-[#3A3935] hover:border-[#D97757] hover:text-[#D97757] flex items-center justify-center transition-colors" data-testid={`footer-social-${i}`}>
                                <Icon className="w-4 h-4" strokeWidth={1.5} />
                            </a>
                        ))}
                    </div>
                </div>
                <div>
                    <h4 className="text-xs uppercase tracking-widest text-[#8A857D] mb-4">Plataforma</h4>
                    <ul className="space-y-2.5 text-sm">
                        <li><Link to="/marketplace" className="hover:text-[#D97757]">Marketplace</Link></li>
                        <li><Link to="/produtores" className="hover:text-[#D97757]">Para Produtores</Link></li>
                        <li><Link to="/afiliados" className="hover:text-[#D97757]">Para Afiliados</Link></li>
                        <li><Link to="/register" className="hover:text-[#D97757]">Criar conta</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-xs uppercase tracking-widest text-[#8A857D] mb-4">Suporte</h4>
                    <ul className="space-y-2.5 text-sm">
                        <li><Link to="/faq" className="hover:text-[#D97757]">FAQ</Link></li>
                        <li><Link to="/contato" className="hover:text-[#D97757]">Fale conosco</Link></li>
                        <li><a href="https://wa.me/5511962072438" target="_blank" rel="noopener noreferrer" className="hover:text-[#D97757]">WhatsApp</a></li>
                        <li><a href="mailto:contatosinkronize@gmail.com" className="hover:text-[#D97757]">E-mail</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-xs uppercase tracking-widest text-[#8A857D] mb-4">Legal</h4>
                    <ul className="space-y-2.5 text-sm">
                        <li><Link to="/termos" className="hover:text-[#D97757]">Termos de Uso</Link></li>
                        <li><Link to="/privacidade" className="hover:text-[#D97757]">Privacidade (LGPD)</Link></li>
                        <li><Link to="/faq" className="hover:text-[#D97757]">Perguntas Frequentes</Link></li>
                    </ul>
                </div>
            </div>

            <div className="mt-16 pt-8 border-t border-[#3A3935] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <p className="text-xs text-[#8A857D]">© {new Date().getFullYear()} SINKRONIZE. Todos os direitos reservados.</p>
                <div className="flex gap-6 text-xs text-[#8A857D]">
                    <Link to="/termos" className="hover:text-[#D97757]">Termos de uso</Link>
                    <Link to="/privacidade" className="hover:text-[#D97757]">Privacidade</Link>
                    <Link to="/faq" className="hover:text-[#D97757]">FAQ</Link>
                </div>
            </div>
        </div>
    </footer>
);
