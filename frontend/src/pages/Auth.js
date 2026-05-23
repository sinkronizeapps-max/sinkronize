import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

const LOGO = "https://customer-assets.emergentagent.com/job_affiliate-hub-v1/artifacts/gx74436b_L1.png";

import { supabase } from "../lib/supabase";

const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + '/dashboard' }
    });
};

export function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const redirectTo = location.state?.from || "/dashboard";

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            toast.success("Bem-vindo de volta!");
            navigate(redirectTo);
        } catch (err) {
            toast.error(err.message || "Erro ao entrar");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAF9F5] flex">
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#F5F0E8] via-[#EFE6D5] to-[#E6D5C0] p-16 items-center justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#D97757]/15 rounded-full blur-3xl" />
                <div className="relative max-w-md">
                    <Link to="/" className="flex items-center gap-3 mb-12" data-testid="auth-logo-link">
                        <img src={LOGO} alt="SINKRONIZE" className="w-12 h-12 rounded-xl" />
                        <span className="font-serif-display text-2xl font-semibold">SINKRONIZE</span>
                    </Link>
                    <h2 className="font-serif-display text-5xl font-semibold leading-tight text-[#1A1918] mb-6">
                        Bem-vindo de volta à sua jornada.
                    </h2>
                    <p className="text-lg text-[#524F4A] leading-relaxed">Continue de onde parou — suas vendas, comissões e apps esperam por você.</p>
                </div>
            </div>
            <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
                <form onSubmit={submit} className="w-full max-w-md" data-testid="login-form">
                    <Link to="/" className="lg:hidden flex items-center gap-3 mb-10">
                        <img src={LOGO} alt="SINKRONIZE" className="w-10 h-10 rounded-xl" />
                        <span className="font-serif-display text-xl font-semibold">SINKRONIZE</span>
                    </Link>
                    <h1 className="font-serif-display text-3xl font-semibold text-[#1A1918] mb-2">Entrar</h1>
                    <p className="text-[#524F4A] mb-8">Acesse sua conta SINKRONIZE.</p>

                    <button type="button" onClick={handleGoogle} className="w-full bg-white border border-[#E6E1D6] hover:border-[#D97757] rounded-xl px-4 py-3 flex items-center justify-center gap-3 font-medium text-[#1A1918] transition-colors mb-6" data-testid="login-google-button">
                        <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                        Continuar com Google
                    </button>

                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex-1 h-px bg-[#E6E1D6]" />
                        <span className="text-xs uppercase tracking-widest text-[#8A857D]">ou</span>
                        <div className="flex-1 h-px bg-[#E6E1D6]" />
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-[#1A1918] mb-1.5">E-mail</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-white border border-[#E6E1D6] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#D97757]/20 focus:border-[#D97757]" data-testid="login-email-input" placeholder="voce@exemplo.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#1A1918] mb-1.5">Senha</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-white border border-[#E6E1D6] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#D97757]/20 focus:border-[#D97757]" data-testid="login-password-input" placeholder="••••••••" />
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full mt-6 bg-[#D97757] hover:bg-[#C55D3D] text-white rounded-full py-3 font-semibold transition-colors disabled:opacity-60" data-testid="login-submit-button">
                        {loading ? "Entrando..." : "Entrar"}
                    </button>

                    <p className="text-sm text-[#524F4A] text-center mt-6">
                        Não tem conta? <Link to="/register" className="text-[#D97757] font-semibold hover:underline" data-testid="login-register-link">Crie agora</Link>
                    </p>
                    <p className="text-xs text-[#8A857D] text-center mt-3">Demo: producer@sinkronize.com / demo1234</p>
                </form>
            </div>
        </div>
    );
}

export function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: "", email: "", password: "", role: "both" });
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await register(form);
            toast.success("Conta criada com sucesso!");
            navigate("/dashboard");
        } catch (err) {
            toast.error(err.message || "Erro ao criar conta");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAF9F5] flex">
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1A1918] to-[#2A2825] p-16 items-center justify-center relative overflow-hidden text-white">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#D97757]/30 rounded-full blur-3xl" />
                <div className="relative max-w-md">
                    <Link to="/" className="flex items-center gap-3 mb-12">
                        <img src={LOGO} alt="SINKRONIZE" className="w-12 h-12 rounded-xl" />
                        <span className="font-serif-display text-2xl font-semibold text-white">SINKRONIZE</span>
                    </Link>
                    <h2 className="font-serif-display text-5xl font-semibold leading-tight mb-6">
                        Comece a sincronizar hoje.
                    </h2>
                    <p className="text-lg text-white/80 leading-relaxed mb-10">Sem mensalidade. Sem letras miúdas. Você só ganha com a gente.</p>
                    <ul className="space-y-3 text-white/90">
                        {["Acesso ao mercado de aplicativos", "Carteira com PIX", "Painel com métricas em tempo real", "Suporte humano"].map((b, i) => (
                            <li key={i} className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-[#D97757]" />{b}</li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
                <form onSubmit={submit} className="w-full max-w-md" data-testid="register-form">
                    <Link to="/" className="lg:hidden flex items-center gap-3 mb-10">
                        <img src={LOGO} alt="SINKRONIZE" className="w-10 h-10 rounded-xl" />
                        <span className="font-serif-display text-xl font-semibold">SINKRONIZE</span>
                    </Link>
                    <h1 className="font-serif-display text-3xl font-semibold text-[#1A1918] mb-2">Criar conta</h1>
                    <p className="text-[#524F4A] mb-8">Gratuito para sempre.</p>

                    <button type="button" onClick={handleGoogle} className="w-full bg-white border border-[#E6E1D6] hover:border-[#D97757] rounded-xl px-4 py-3 flex items-center justify-center gap-3 font-medium text-[#1A1918] transition-colors mb-6" data-testid="register-google-button">
                        <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                        Cadastrar com Google
                    </button>

                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex-1 h-px bg-[#E6E1D6]" />
                        <span className="text-xs uppercase tracking-widest text-[#8A857D]">ou</span>
                        <div className="flex-1 h-px bg-[#E6E1D6]" />
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Nome completo</label>
                            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full bg-white border border-[#E6E1D6] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#D97757]/20 focus:border-[#D97757]" data-testid="register-name-input" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">E-mail</label>
                            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="w-full bg-white border border-[#E6E1D6] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#D97757]/20 focus:border-[#D97757]" data-testid="register-email-input" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Senha</label>
                            <input type="password" minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required className="w-full bg-white border border-[#E6E1D6] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#D97757]/20 focus:border-[#D97757]" data-testid="register-password-input" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Você é</label>
                            <div className="grid grid-cols-3 gap-2">
                                {[["producer", "Produtor"], ["affiliate", "Afiliado"], ["both", "Ambos"]].map(([v, l]) => (
                                    <button key={v} type="button" onClick={() => setForm({ ...form, role: v })} className={`py-3 rounded-xl border text-sm font-medium transition-colors ${form.role === v ? "bg-[#D97757] text-white border-[#D97757]" : "bg-white border-[#E6E1D6] text-[#524F4A] hover:border-[#D97757]"}`} data-testid={`register-role-${v}`}>
                                        {l}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full mt-6 bg-[#D97757] hover:bg-[#C55D3D] text-white rounded-full py-3 font-semibold transition-colors disabled:opacity-60" data-testid="register-submit-button">
                        {loading ? "Criando..." : "Criar minha conta"}
                    </button>

                    <p className="text-sm text-[#524F4A] text-center mt-6">
                        Já tem conta? <Link to="/login" className="text-[#D97757] font-semibold hover:underline" data-testid="register-login-link">Entrar</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

export function AuthCallback() {
    const navigate = useNavigate();
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) navigate('/dashboard', { replace: true });
            else navigate('/login', { replace: true });
        });
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FAF9F5]">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-[#D97757] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-[#524F4A]">Sincronizando sua sessão...</p>
            </div>
        </div>
    );
}
