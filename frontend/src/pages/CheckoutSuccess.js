import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { appsAPI } from "../lib/api";
import { Layout } from "../components/Layout";
import { Check, ArrowRight } from "lucide-react";

export default function CheckoutSuccess() {
    const { slug } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [app, setApp] = useState(null);
    const sessionId = searchParams.get("session_id");

    useEffect(() => { appsAPI.getBySlug(slug).then(setApp).catch(() => {}); }, [slug]);

    return (
        <Layout>
            <section className="max-w-2xl mx-auto px-6 py-24 text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-[#2D7A5C]/10 flex items-center justify-center mb-6">
                    <Check className="w-10 h-10 text-[#2D7A5C]" strokeWidth={2} />
                </div>
                <h1 className="font-serif-display text-4xl font-semibold mb-4">Pagamento confirmado!</h1>
                <p className="text-[#524F4A] mb-2">
                    Seja bem-vindo ao <strong>{app?.name || slug}</strong>.
                </p>
                <p className="text-[#524F4A] mb-8">
                    Você receberá os acessos por e-mail em instantes.
                </p>
                {sessionId && (
                    <div className="bg-white border border-[#E6E1D6] rounded-2xl p-4 text-left text-xs text-[#8A857D] mb-8 break-all">
                        <span className="font-semibold">ID da sessão Stripe:</span> {sessionId}
                    </div>
                )}
                <button
                    onClick={() => navigate("/marketplace")}
                    className="inline-flex items-center gap-2 bg-[#D97757] text-white rounded-full px-8 py-3 font-semibold hover:bg-[#C55D3D]"
                    data-testid="checkout-back"
                >
                    Explorar marketplace <ArrowRight className="w-4 h-4" />
                </button>
            </section>
        </Layout>
    );
}
