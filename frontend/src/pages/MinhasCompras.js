import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Layout } from "../components/Layout";
import { supabase } from "../lib/supabase";
import { ShoppingBag, ArrowRight, Calendar, CreditCard } from "lucide-react";

export default function MinhasCompras() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) { navigate("/login"); return; }
        supabase
            .from("sales")
            .select("*")
            .eq("buyer_email", user.email.toLowerCase())
            .order("created_at", { ascending: false })
            .then(({ data }) => {
                setPurchases(data || []);
                setLoading(false);
            });
    }, [user, navigate]);

    return (
        <Layout>
            <section className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-20">
                <div className="mb-10">
                    <button onClick={() => navigate("/bem-vindo")} className="text-sm text-[#8A857D] hover:text-[#524F4A] mb-4 flex items-center gap-1 transition-colors">
                        ← Voltar
                    </button>
                    <h1 className="font-serif-display text-4xl font-semibold text-[#1A1918] mb-2">Minhas compras</h1>
                    <p className="text-[#524F4A]">Apps que você assinou na Sinkronize.</p>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-[#8A857D]">Carregando...</div>
                ) : purchases.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-[#F5F0E8] rounded-full flex items-center justify-center mx-auto mb-5">
                            <ShoppingBag className="w-9 h-9 text-[#8A857D]" />
                        </div>
                        <h2 className="font-serif-display text-2xl font-semibold text-[#1A1918] mb-3">Nenhuma compra ainda</h2>
                        <p className="text-[#524F4A] mb-6">Explore o marketplace e encontre apps incríveis para assinar.</p>
                        <button onClick={() => navigate("/marketplace")} className="inline-flex items-center gap-2 bg-[#D97757] text-white rounded-full px-7 py-3 font-semibold hover:bg-[#C55D3D] transition-colors">
                            Explorar marketplace <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {purchases.map((sale) => (
                            <div key={sale.id} className="bg-white border border-[#E6E1D6] rounded-2xl p-6 flex items-center gap-5">
                                <div className="w-14 h-14 bg-[#F5F0E8] rounded-xl flex items-center justify-center shrink-0">
                                    <ShoppingBag className="w-6 h-6 text-[#D97757]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-[#1A1918] text-lg mb-1">{sale.app_name}</div>
                                    <div className="flex flex-wrap gap-4 text-sm text-[#8A857D]">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {new Date(sale.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <CreditCard className="w-3.5 h-3.5" />
                                            {sale.installments > 1 ? `${sale.installments}x de R$ ${sale.installment_amount?.toFixed(2)}` : `R$ ${sale.amount?.toFixed(2)} à vista`}
                                        </span>
                                    </div>
                                </div>
                                <div className="shrink-0 text-right">
                                    <div className="inline-flex items-center gap-1.5 bg-[#F0FAF5] text-[#2D7A5C] text-xs font-semibold px-3 py-1.5 rounded-full border border-[#C3E8D5]">
                                        ✓ Pago
                                    </div>
                                    <div className="text-lg font-semibold text-[#1A1918] mt-1">R$ {sale.amount?.toFixed(2)}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </Layout>
    );
}
