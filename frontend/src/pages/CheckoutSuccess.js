import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { appsAPI } from "../lib/api";
import { Layout } from "../components/Layout";
import { Check, ArrowRight } from "lucide-react";

function firePixel(app, amount) {
    // Facebook Pixel
    if (app.facebook_pixel_id) {
        const script = document.createElement("script");
        script.innerHTML = `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${app.facebook_pixel_id}');
fbq('track', 'Purchase', {value: ${amount}, currency: 'BRL', content_name: '${app.name.replace(/'/g, "\\'")}'});
        `;
        document.head.appendChild(script);
    }

    // Google Tag / Google Ads
    if (app.google_tag_id) {
        const gscript = document.createElement("script");
        gscript.async = true;
        gscript.src = `https://www.googletagmanager.com/gtag/js?id=${app.google_tag_id}`;
        document.head.appendChild(gscript);

        const gscript2 = document.createElement("script");
        gscript2.innerHTML = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${app.google_tag_id}');
gtag('event', 'purchase', {
  transaction_id: '${Date.now()}',
  value: ${amount},
  currency: 'BRL',
  items: [{item_name: '${app.name.replace(/'/g, "\\'")}', price: ${amount}, quantity: 1}]
});
        `;
        document.head.appendChild(gscript2);
    }
}

export default function CheckoutSuccess() {
    const { slug } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [app, setApp] = useState(null);
    const sessionId = searchParams.get("session_id");
    const [pixelFired, setPixelFired] = useState(false);

    useEffect(() => {
        appsAPI.getBySlug(slug).then(appData => {
            setApp(appData);
            if (!pixelFired && appData) {
                firePixel(appData, appData.price_monthly);
                setPixelFired(true);
            }
        }).catch(() => {});
    }, [slug]); // eslint-disable-line

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
                {app?.thank_you_url && (
                    <a
                        href={`${app.thank_you_url}?email=${encodeURIComponent("")}&app=${slug}`}
                        className="inline-flex items-center gap-2 bg-[#1A1918] text-white rounded-full px-8 py-3 font-semibold hover:bg-[#2A2825] mb-4 mr-3"
                    >
                        Acessar o app <ArrowRight className="w-4 h-4" />
                    </a>
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
