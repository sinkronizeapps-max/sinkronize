import { Link } from "react-router-dom";
import { Instagram, Twitter, Youtube, Linkedin } from "lucide-react";

const LOGO = "https://customer-assets.emergentagent.com/job_affiliate-hub-v1/artifacts/gx74436b_L1.png";

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
                    <h4 className="text-xs uppercase tracking-widest text-[#8A857D] mb-4">Recursos</h4>
                    <ul className="space-y-2.5 text-sm">
                        <li><a href="#" className="hover:text-[#D97757]">Blog</a></li>
                        <li><a href="#" className="hover:text-[#D97757]">Central de ajuda</a></li>
                        <li><a href="#" className="hover:text-[#D97757]">Comunidade</a></li>
                        <li><a href="#" className="hover:text-[#D97757]">Documentação API</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-xs uppercase tracking-widest text-[#8A857D] mb-4">Empresa</h4>
                    <ul className="space-y-2.5 text-sm">
                        <li><a href="#" className="hover:text-[#D97757]">Sobre</a></li>
                        <li><a href="#" className="hover:text-[#D97757]">Carreiras</a></li>
                        <li><a href="#" className="hover:text-[#D97757]">Imprensa</a></li>
                        <li><a href="#" className="hover:text-[#D97757]">Contato</a></li>
                    </ul>
                </div>
            </div>

            <div className="mt-16 pt-8 border-t border-[#3A3935] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <p className="text-xs text-[#8A857D]">© {new Date().getFullYear()} SINKRONIZE. Todos os direitos reservados.</p>
                <div className="flex gap-6 text-xs text-[#8A857D]">
                    <a href="#" className="hover:text-[#D97757]">Termos de uso</a>
                    <a href="#" className="hover:text-[#D97757]">Privacidade</a>
                    <a href="#" className="hover:text-[#D97757]">Cookies</a>
                </div>
            </div>
        </div>
    </footer>
);
