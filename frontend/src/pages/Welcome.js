import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShoppingBag, BarChart2, ArrowRight } from "lucide-react";
import { useEffect } from "react";

export default function Welcome() {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) navigate("/login");
    }, [user, navigate]);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#FAF9F5] flex flex-col items-center justify-center px-6 py-16">
            <div className="w-full max-w-2xl">
                <div className="text-center mb-12">
                    <img src="/sinkronize-logo.png" alt="SINKRONIZE" className="w-44 mx-auto mb-8 object-contain" />
                    <h1 className="font-serif-display text-4xl font-semibold text-[#1A1918] mb-3">
                        Olá, {user.name?.split(" ")[0] || "bem-vindo"}!
                    </h1>
                    <p className="text-[#524F4A] text-lg">O que você quer fazer hoje?</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                    <button
                        onClick={() => navigate("/minhas-compras")}
                        className="group bg-white border border-[#E6E1D6] hover:border-[#D97757] rounded-3xl p-8 text-left transition-all hover:shadow-[0_8px_32px_rgba(217,119,87,0.12)] hover:-translate-y-0.5"
                    >
                        <div className="w-14 h-14 bg-[#FDF4F1] rounded-2xl flex items-center justify-center mb-5 group-hover:bg-[#D97757]/10 transition-colors">
                            <ShoppingBag className="w-7 h-7 text-[#D97757]" />
                        </div>
                        <h2 className="font-serif-display text-2xl font-semibold text-[#1A1918] mb-2">Minhas compras</h2>
                        <p className="text-[#524F4A] text-sm leading-relaxed mb-4">Acesse os apps que você assinou e gerencie suas assinaturas.</p>
                        <div className="flex items-center gap-1.5 text-[#D97757] text-sm font-semibold">
                            Ver compras <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </button>

                    <button
                        onClick={() => navigate("/dashboard")}
                        className="group bg-white border border-[#E6E1D6] hover:border-[#1A1918] rounded-3xl p-8 text-left transition-all hover:shadow-[0_8px_32px_rgba(26,25,24,0.08)] hover:-translate-y-0.5"
                    >
                        <div className="w-14 h-14 bg-[#F5F0E8] rounded-2xl flex items-center justify-center mb-5 group-hover:bg-[#1A1918]/10 transition-colors">
                            <BarChart2 className="w-7 h-7 text-[#1A1918]" />
                        </div>
                        <h2 className="font-serif-display text-2xl font-semibold text-[#1A1918] mb-2">Meus negócios</h2>
                        <p className="text-[#524F4A] text-sm leading-relaxed mb-4">Gerencie seus apps, afiliações, comissões e carteira.</p>
                        <div className="flex items-center gap-1.5 text-[#1A1918] text-sm font-semibold">
                            Acessar painel <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </button>
                </div>

                <div className="text-center mt-8">
                    <button onClick={() => navigate("/marketplace")} className="text-sm text-[#8A857D] hover:text-[#524F4A] transition-colors">
                        Ir para o Marketplace
                    </button>
                </div>
            </div>
        </div>
    );
}
