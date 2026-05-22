import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, X, ChevronDown, LogOut, LayoutDashboard, Wallet as WalletIcon } from "lucide-react";
import { useState } from "react";

const LOGO = "https://customer-assets.emergentagent.com/job_ffca4835-3ac6-4a72-8a6d-7c6ccc5f62ae/artifacts/fsn7ciz3_LOGO.jpeg";

export const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [menu, setMenu] = useState(false);

    return (
        <header className="fixed top-0 inset-x-0 z-50 bg-[#FAF9F5]/85 backdrop-blur-xl border-b border-[#E6E1D6]">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3 group shrink-0" data-testid="header-logo-link">
                    <img src={LOGO} alt="SINKRONIZE" className="w-10 h-10 rounded-xl object-cover ring-1 ring-[#E6E1D6]" />
                    <span className="hidden lg:inline font-serif-display text-xl font-semibold tracking-tight text-[#1A1918]">SINKRONIZE</span>
                </Link>

                <nav className="hidden md:flex items-center gap-5 lg:gap-7 mx-4">
                    <Link to="/marketplace" className="text-sm font-medium text-[#524F4A] hover:text-[#D97757] transition-colors whitespace-nowrap" data-testid="nav-marketplace">Marketplace</Link>
                    <Link to="/produtores" className="text-sm font-medium text-[#524F4A] hover:text-[#D97757] transition-colors whitespace-nowrap" data-testid="nav-producers">Produtores</Link>
                    <Link to="/afiliados" className="text-sm font-medium text-[#524F4A] hover:text-[#D97757] transition-colors whitespace-nowrap" data-testid="nav-affiliates">Afiliados</Link>
                    <a href="/#como-funciona" className="hidden lg:inline text-sm font-medium text-[#524F4A] hover:text-[#D97757] transition-colors whitespace-nowrap" data-testid="nav-how">Como funciona</a>
                </nav>

                <div className="hidden md:flex items-center gap-3 shrink-0">
                    {user ? (
                        <div className="relative">
                            <button onClick={() => setMenu(!menu)} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#E6E1D6] hover:border-[#D97757] transition-colors" data-testid="header-user-menu">
                                {user.picture ? (
                                    <img src={user.picture} alt="" className="w-7 h-7 rounded-full" />
                                ) : (
                                    <div className="w-7 h-7 rounded-full bg-[#D97757] text-white flex items-center justify-center text-xs font-semibold">{user.name?.[0]?.toUpperCase()}</div>
                                )}
                                <span className="text-sm font-medium text-[#1A1918]">{user.name?.split(" ")[0]}</span>
                                <ChevronDown className="w-4 h-4 text-[#8A857D]" />
                            </button>
                            {menu && (
                                <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E6E1D6] rounded-2xl shadow-lg overflow-hidden" data-testid="user-menu-dropdown">
                                    <button onClick={() => { setMenu(false); navigate("/dashboard"); }} className="w-full text-left px-4 py-3 text-sm hover:bg-[#F5F0E8] flex items-center gap-2" data-testid="menu-dashboard">
                                        <LayoutDashboard className="w-4 h-4" /> Painel do Produtor
                                    </button>
                                    <button onClick={() => { setMenu(false); navigate("/afiliado"); }} className="w-full text-left px-4 py-3 text-sm hover:bg-[#F5F0E8] flex items-center gap-2" data-testid="menu-affiliate">
                                        <LayoutDashboard className="w-4 h-4" /> Painel do Afiliado
                                    </button>
                                    <button onClick={() => { setMenu(false); navigate("/carteira"); }} className="w-full text-left px-4 py-3 text-sm hover:bg-[#F5F0E8] flex items-center gap-2" data-testid="menu-wallet">
                                        <WalletIcon className="w-4 h-4" /> Carteira
                                    </button>
                                    <div className="border-t border-[#E6E1D6]" />
                                    <button onClick={() => { setMenu(false); logout(); navigate("/"); }} className="w-full text-left px-4 py-3 text-sm hover:bg-[#F5F0E8] flex items-center gap-2 text-[#B04646]" data-testid="menu-logout">
                                        <LogOut className="w-4 h-4" /> Sair
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="text-sm font-medium text-[#524F4A] hover:text-[#1A1918] transition-colors px-3 py-2" data-testid="header-login-link">Entrar</Link>
                            <Link to="/register" className="text-sm font-medium bg-[#D97757] text-white hover:bg-[#C55D3D] rounded-full px-5 py-2.5 transition-colors shadow-sm" data-testid="header-signup-link">Começar grátis</Link>
                        </>
                    )}
                </div>

                <button className="md:hidden p-2" onClick={() => setOpen(!open)} data-testid="header-mobile-toggle">
                    {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {open && (
                <div className="md:hidden border-t border-[#E6E1D6] bg-[#FAF9F5] px-6 py-4 space-y-3" data-testid="mobile-menu">
                    <Link to="/marketplace" className="block text-sm font-medium" onClick={() => setOpen(false)}>Marketplace</Link>
                    <Link to="/produtores" className="block text-sm font-medium" onClick={() => setOpen(false)}>Para Produtores</Link>
                    <Link to="/afiliados" className="block text-sm font-medium" onClick={() => setOpen(false)}>Para Afiliados</Link>
                    {user ? (
                        <>
                            <Link to="/dashboard" className="block text-sm font-medium" onClick={() => setOpen(false)}>Painel</Link>
                            <button onClick={() => { logout(); navigate("/"); }} className="block text-sm font-medium text-[#B04646]">Sair</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="block text-sm font-medium" onClick={() => setOpen(false)}>Entrar</Link>
                            <Link to="/register" className="inline-block text-sm font-medium bg-[#D97757] text-white rounded-full px-5 py-2" onClick={() => setOpen(false)}>Começar grátis</Link>
                        </>
                    )}
                </div>
            )}
        </header>
    );
};
