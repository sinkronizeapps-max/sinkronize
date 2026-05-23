import { Link } from "react-router-dom";
import { Star, TrendingUp, Crown, Zap } from "lucide-react";

const TIER_BADGE = {
    premium: { label: "PREMIUM", bg: "#FBE9C4", text: "#8A5A0A", border: "#E8C97A", icon: Crown },
    plus: { label: "PLUS", bg: "#D9E8F6", text: "#1E4D7B", border: "#A8C7E0", icon: Zap },
};

export const AppCard = ({ app }) => {
    const tier = app.tier && app.tier !== "basico" ? TIER_BADGE[app.tier] : null;
    return (
    <Link to={`/app/${app.slug}`} className="group block" data-testid={`app-card-${app.slug}`}>
        <div className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 ${app.tier === "premium" ? "border-[#E8C97A] hover:border-[#D4A946] hover:shadow-[0_12px_36px_rgba(212,169,70,0.18)]" : "border-[#E6E1D6] hover:border-[#D97757]/40 hover:shadow-[0_12px_36px_rgba(217,119,87,0.12)]"}`}>
            <div className="relative aspect-[5/3] overflow-hidden bg-[#F5F0E8]">
                <img src={app.icon_url || app.cover_url} alt={app.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                {tier && (
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1 text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full font-bold" style={{ background: tier.bg, color: tier.text, border: `1px solid ${tier.border}` }} data-testid={`tier-badge-${app.tier}`}>
                        <tier.icon className="w-3 h-3" /> {tier.label}
                    </span>
                )}
                {app.is_demo && (
                    <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full font-bold bg-[#1A1918]/70 text-white backdrop-blur">
                        Em breve
                    </span>
                )}
                <span className="absolute top-3 right-3 bg-white/95 backdrop-blur text-[#A5472A] text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> {app.commission_pct}%
                </span>
            </div>
            <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-1.5">
                    <h3 className="font-serif-display text-lg font-semibold text-[#1A1918] leading-tight">{app.name}</h3>
                    <span className="text-xs text-[#8A857D] whitespace-nowrap">{app.category}</span>
                </div>
                <p className="text-sm text-[#524F4A] line-clamp-2 mb-4 leading-relaxed">{app.tagline}</p>
                <div className="flex items-center justify-between pt-3 border-t border-[#EFEBE0]">
                    <div className="flex items-center gap-1 text-xs text-[#524F4A]">
                        <Star className="w-3.5 h-3.5 fill-[#D99B29] text-[#D99B29]" />
                        <span className="font-semibold">{app.rating?.toFixed(1) || "—"}</span>
                        <span className="text-[#8A857D]">({app.reviews_count})</span>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] uppercase tracking-wider text-[#8A857D] block">Mensal</span>
                        <span className="font-semibold text-[#1A1918]">R$ {app.price_monthly.toFixed(2).replace(".", ",")}</span>
                    </div>
                </div>
            </div>
        </div>
    </Link>
);
};
