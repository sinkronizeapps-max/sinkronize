import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, X, ChevronDown, LogOut, LayoutDashboard, Wallet as WalletIcon, ShoppingBag, MessageCircle, Bell, User } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

const LOGO = "/sinkronize-icon.png";

export const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [menu, setMenu] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifs, setNotifs] = useState([]);
    const notifRef = useRef(null);

    useEffect(() => {
        if (!user) return;
        supabase.from("notifications").select("*").eq("user_id", user.id).is("read_at", null).order("created_at", { ascending: false }).limit(20)
            .then(({ data }) => setNotifs(data || []));
    }, [user]);

    useEffect(() => {
        const handler = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const markAllRead = async () => {
        if (!notifs.length) return;
        await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", user.id).is("read_at", null);
        setNotifs([]);
    };

    return (
        <header className="fixed top-0 inset-x-0 z-50 bg-[#FAF9F5]/85 backdrop-blur-xl border-b border-[#E6E1D6]">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3 group shrink-0" data-testid="header-logo-link">
                    <img src={LOGO} alt="SINKRONIZE" className="w-10 h-10 rounded-xl object-cover ring-1 ring-[#E6E1D6]" />
                    <span className="hidden lg:inline font-serif-display text-xl font-semibold tracking-tight text-[#1A1918]">SINKRONIZE</span>
                </Link>

                <div className="hidden md:flex items-center gap-3 shrink-0">
                    {/* Link contato visível para todos */}
                    <Link to="/contato" className="text-sm font-medium text-[#524F4A] hover:text-[#D97757] transition-colors flex items-center gap-1.5" data-testid="header-contact-link">
                        <MessageCircle className="w-4 h-4" /> Contato
                    </Link>

                    {user ? (
                        <>
                        {/* Sino de notificações */}
                        <div className="relative" ref={notifRef}>
                            <button onClick={() => setNotifOpen(v => !v)} className="relative p-2 rounded-full hover:bg-[#F5F0E8] transition-colors" data-testid="notifications-bell">
                                <Bell className="w-5 h-5 text-[#524F4A]" />
                                {notifs.length > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-[#D97757] text-white text-[9px] font-bold rounded-full flex items-center justify-center">{notifs.length > 9 ? "9+" : notifs.length}</span>}
                            </button>
                            {notifOpen && (
                                <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E6E1D6] rounded-2xl shadow-lg overflow-hidden z-50" data-testid="notifications-dropdown">
                                    <div className="px-4 py-3 flex items-center justify-between border-b border-[#E6E1D6]">
                                        <span className="text-xs font-semibold uppercase tracking-widest text-[#8A857D]">Notificações</span>
                                        {notifs.length > 0 && <button onClick={markAllRead} className="text-xs text-[#D97757] hover:underline">Marcar todas como lidas</button>}
                                    </div>
                                    <div className="max-h-72 overflow-y-auto">
                                        {notifs.length === 0
                                            ? <p className="px-4 py-6 text-sm text-[#8A857D] text-center">Nenhuma notificação nova</p>
                                            : notifs.map(n => (
                                                <div key={n.id} className="px-4 py-3 border-b border-[#F5F0E8] last:border-0 hover:bg-[#FAF9F5]">
                                                    <p className="text-sm font-semibold text-[#1A1918]">{n.title}</p>
                                                    <p className="text-xs text-[#524F4A] mt-0.5">{n.message}</p>
                                                    <p className="text-[10px] text-[#C4BDB5] mt-1">{new Date(n.created_at).toLocaleDateString("pt-BR")}</p>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                            )}
                        </div>

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
                                    <button onClick={() => { setMenu(false); navigate("/perfil"); }} className="w-full text-left px-4 py-3 text-sm hover:bg-[#F5F0E8] flex items-center gap-2 border-b border-[#E6E1D6]" data-testid="menu-profile">
                                        <User className="w-4 h-4" /> Meu perfil
                                    </button>
                                    <div className="px-4 py-2 text-xs uppercase tracking-widest text-[#8A857D] font-semibold border-b border-[#E6E1D6]">Comprador</div>
                                    <button onClick={() => { setMenu(false); navigate("/minhas-compras"); }} className="w-full text-left px-4 py-3 text-sm hover:bg-[#F5F0E8] flex items-center gap-2" data-testid="menu-purchases">
                                        <ShoppingBag className="w-4 h-4" /> Minhas compras
                                    </button>
                                    <div className="px-4 py-2 text-xs uppercase tracking-widest text-[#8A857D] font-semibold border-t border-b border-[#E6E1D6]">Negócios</div>
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
                                    <button onClick={() => { setMenu(false); navigate("/contato"); }} className="w-full text-left px-4 py-3 text-sm hover:bg-[#F5F0E8] flex items-center gap-2" data-testid="menu-contact">
                                        <MessageCircle className="w-4 h-4" /> Contato
                                    </button>
                                    <button onClick={() => { setMenu(false); logout(); navigate("/"); }} className="w-full text-left px-4 py-3 text-sm hover:bg-[#F5F0E8] flex items-center gap-2 text-[#B04646]" data-testid="menu-logout">
                                        <LogOut className="w-4 h-4" /> Sair
                                    </button>
                                </div>
                            )}
                        </div>
                        </>
                    ) : (
                        <Link to="/login" className="text-sm font-medium bg-[#D97757] text-white hover:bg-[#C55D3D] rounded-full px-5 py-2.5 transition-colors shadow-sm" data-testid="header-login-link">Entrar</Link>
                    )}

                </div>

                <button className="md:hidden p-2" onClick={() => setOpen(!open)} data-testid="header-mobile-toggle">
                    {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {open && (
                <div className="md:hidden border-t border-[#E6E1D6] bg-[#FAF9F5] px-6 py-4 space-y-3" data-testid="mobile-menu">
                    <Link to="/contato" className="block text-sm font-medium" onClick={() => setOpen(false)}>Contato</Link>
                    {user ? (
                        <>
                            <Link to="/dashboard" className="block text-sm font-medium" onClick={() => setOpen(false)}>Painel</Link>
                            <button onClick={() => { logout(); navigate("/"); }} className="block text-sm font-medium text-[#B04646]">Sair</button>
                        </>
                    ) : (
                        <Link to="/login" className="inline-block text-sm font-medium bg-[#D97757] text-white rounded-full px-5 py-2" onClick={() => setOpen(false)}>Entrar</Link>
                    )}
                </div>
            )}
        </header>
    );
};
