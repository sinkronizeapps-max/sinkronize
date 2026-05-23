import { useEffect, useState } from "react";
import { appsAPI } from "../lib/api";
import { Layout } from "../components/Layout";
import { AppCard } from "../components/AppCard";
import { Search } from "lucide-react";

const CATS = ["all", "Bem-estar", "Produtividade", "Fitness", "Finanças", "Culinária", "Educação", "Pets", "Negócios"];

export default function Marketplace() {
    const [apps, setApps] = useState([]);
    const [cat, setCat] = useState("all");
    const [q, setQ] = useState("");
    const [sort, setSort] = useState("featured");

    useEffect(() => {
        const t = setTimeout(() => {
            appsAPI.list({ category: cat, q, sort }).then(setApps).catch(() => {});
        }, 200);
        return () => clearTimeout(t);
    }, [cat, q, sort]);

    return (
        <Layout>
            <section className="bg-gradient-to-br from-[#F5F0E8] to-[#FAF9F5] py-16 lg:py-20">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D97757]">Marketplace</span>
                    <h1 className="font-serif-display text-4xl lg:text-5xl font-semibold tracking-tight text-[#1A1918] mt-3 mb-4">O melhor da tecnologia, reunido aqui.</h1>
                    <p className="text-lg text-[#524F4A] max-w-2xl">Explore apps cuidadosamente selecionados para turbinar sua produtividade, saúde e negócios.</p>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
                <div className="flex flex-col lg:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A857D]" />
                        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar apps..." className="w-full bg-white border border-[#E6E1D6] rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#D97757]/20 focus:border-[#D97757]" data-testid="marketplace-search-input" />
                    </div>
                    <select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-white border border-[#E6E1D6] rounded-xl px-4 py-3 focus:outline-none focus:border-[#D97757] text-sm font-medium" data-testid="marketplace-sort">
                        <option value="featured">Em destaque</option>
                        <option value="rating">Melhor avaliados</option>
                        <option value="new">Mais novos</option>
                        <option value="commission">Maior comissão</option>
                    </select>
                </div>

                <div className="flex gap-2 mb-10 overflow-x-auto pb-2">
                    {CATS.map((c) => (
                        <button key={c} onClick={() => setCat(c)} className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${cat === c ? "bg-[#1A1918] text-white" : "bg-white border border-[#E6E1D6] text-[#524F4A] hover:border-[#D97757]"}`} data-testid={`category-${c}`}>
                            {c === "all" ? "Todas categorias" : c}
                        </button>
                    ))}
                </div>

                {apps.length === 0 ? (
                    <div className="text-center py-16 text-[#8A857D]">Nenhum app encontrado.</div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {apps.map((a) => <AppCard key={a.app_id} app={a} />)}
                    </div>
                )}
            </section>
        </Layout>
    );
}
