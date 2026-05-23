import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { walletAPI } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Wallet as WalletIcon, ArrowDownToLine, Award } from "lucide-react";

export default function Wallet() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [amount, setAmount] = useState("");
    const [pix, setPix] = useState("");
    const [busy, setBusy] = useState(false);

    const load = () => walletAPI.get().then(setData).catch(() => {});

    useEffect(() => {
        if (loading) return;
        if (!user) { navigate("/login", { state: { from: "/carteira" } }); return; }
        load();
    }, [user, loading, navigate]);

    const withdraw = async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
            await walletAPI.withdraw({ amount: parseFloat(amount), pixKey: pix });
            toast.success("Saque solicitado!");
            setAmount(""); setPix("");
            load();
        } catch (err) { toast.error(err.message || "Erro"); } finally { setBusy(false); }
    };

    if (loading || !user || !data) return <Layout><div className="min-h-screen flex items-center justify-center">Carregando...</div></Layout>;

    return (
        <Layout>
            <section className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
                <h1 className="font-serif-display text-4xl font-semibold mb-2">Carteira</h1>
                <p className="text-[#524F4A] mb-10">Acompanhe seu saldo e solicite saques via PIX.</p>

                <div className="grid lg:grid-cols-3 gap-6 mb-10">
                    <div className="lg:col-span-2 bg-gradient-to-br from-[#1A1918] to-[#2A2825] text-white rounded-3xl p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D97757]/20 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
                        <WalletIcon className="w-7 h-7 text-[#D97757] mb-6" strokeWidth={1.5} />
                        <div className="text-xs uppercase tracking-widest text-white/60 mb-2">Saldo disponível</div>
                        <div className="font-serif-display text-6xl font-semibold" data-testid="wallet-balance">R$ {data.balance.toFixed(2)}</div>
                        <div className="text-sm text-white/70 mt-2">Disponível para saque imediato via PIX</div>
                    </div>
                    <div className="bg-white border border-[#E6E1D6] rounded-3xl p-8">
                        <Award className="w-7 h-7 text-[#D97757] mb-6" strokeWidth={1.5} />
                        <div className="text-xs uppercase tracking-widest text-[#8A857D] mb-2">Seu nível</div>
                        <div className="font-serif-display text-3xl font-semibold capitalize">{data.tier}</div>
                        <p className="text-sm text-[#524F4A] mt-3">Continue vendendo para evoluir.</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    <form onSubmit={withdraw} className="bg-white border border-[#E6E1D6] rounded-2xl p-6" data-testid="withdraw-form">
                        <h3 className="font-serif-display text-xl mb-4 flex items-center gap-2"><ArrowDownToLine className="w-5 h-5" /> Sacar via PIX</h3>
                        <div className="space-y-3">
                            <input required type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Valor (R$)" className="w-full bg-[#FAF9F5] border border-[#E6E1D6] rounded-xl px-4 py-3" data-testid="withdraw-amount" />
                            <input required value={pix} onChange={(e) => setPix(e.target.value)} placeholder="Chave PIX (CPF, e-mail, celular...)" className="w-full bg-[#FAF9F5] border border-[#E6E1D6] rounded-xl px-4 py-3" data-testid="withdraw-pix" />
                        </div>
                        <button type="submit" disabled={busy} className="w-full mt-4 bg-[#D97757] hover:bg-[#C55D3D] text-white rounded-full py-3 font-semibold disabled:opacity-60" data-testid="withdraw-submit">
                            {busy ? "Processando..." : "Solicitar saque"}
                        </button>
                    </form>

                    <div className="bg-white border border-[#E6E1D6] rounded-2xl p-6">
                        <h3 className="font-serif-display text-xl mb-4">Histórico de saques</h3>
                        {data.withdrawals.length === 0 ? (
                            <p className="text-sm text-[#8A857D] py-6 text-center">Nenhum saque solicitado.</p>
                        ) : (
                            <div className="space-y-3">
                                {data.withdrawals.map((w) => (
                                    <div key={w.withdrawal_id} className="flex justify-between items-center text-sm border-b border-[#EFEBE0] pb-2 last:border-0">
                                        <div>
                                            <div className="font-semibold">R$ {w.amount.toFixed(2)}</div>
                                            <div className="text-xs text-[#8A857D]">{w.pix_key}</div>
                                        </div>
                                        <span className="text-xs bg-[#F5F0E8] px-2 py-1 rounded-full capitalize">{w.status}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </Layout>
    );
}
