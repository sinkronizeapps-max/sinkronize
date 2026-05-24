import { useState } from "react";
import { X, Database, Image, DollarSign, Users, Link2, Zap, ChevronRight, ChevronLeft, Check, AlertCircle } from "lucide-react";
import { appsAPI } from "../lib/api";
import { toast } from "sonner";

const CATS = ["Bem-estar", "Produtividade", "Fitness", "Finanças", "Culinária", "Educação", "Pets", "Negócios"];

const TABS = [
    { id: "dados",      label: "Dados",       icon: Database },
    { id: "midia",      label: "Mídia",        icon: Image },
    { id: "plano",      label: "Plano",        icon: DollarSign },
    { id: "afiliacao",  label: "Afiliação",    icon: Users },
    { id: "links",      label: "Links",        icon: Link2 },
    { id: "integracao", label: "Integração",   icon: Zap },
];

const EMPTY = {
    name: "", tagline: "", description: "", category: "Produtividade", document: "",
    icon_url: "", cover_url: "",
    price_monthly: 29.90,
    commission_pct: 40, affiliate_mode: "open",
    sales_page_url: "", thank_you_url: "",
    webhook_url: "",
};

function Field({ label, hint, children }) {
    return (
        <div>
            <label className="block text-sm font-semibold text-[#1A1918] mb-1">{label}</label>
            {hint && <p className="text-xs text-[#8A857D] mb-2">{hint}</p>}
            {children}
        </div>
    );
}

const inp = "w-full bg-[#FAF9F5] border border-[#E6E1D6] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D97757] focus:ring-2 focus:ring-[#D97757]/10 transition-colors placeholder:text-[#C4BDB5]";

export default function AppRegistrationModal({ onClose, onSuccess }) {
    const [tab, setTab]     = useState(0);
    const [form, setForm]   = useState(EMPTY);
    const [saving, setSaving] = useState(false);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const canNext = () => {
        if (tab === 0) return form.name.trim() && form.tagline.trim() && form.description.trim();
        if (tab === 2) return form.price_monthly > 0;
        return true;
    };

    const submit = async () => {
        setSaving(true);
        try {
            await appsAPI.create(form);
            toast.success("App publicado com sucesso!");
            onSuccess?.();
            onClose();
        } catch (e) {
            toast.error("Erro ao publicar: " + e.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                onClick={e => e.stopPropagation()}
                className="bg-white rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl"
                data-testid="app-registration-modal"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-8 pt-8 pb-4 border-b border-[#E6E1D6] shrink-0">
                    <div>
                        <h2 className="font-serif-display text-2xl font-semibold">Publicar novo app</h2>
                        <p className="text-sm text-[#8A857D] mt-0.5">Passo {tab + 1} de {TABS.length}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-[#F5F0E8] rounded-full transition-colors">
                        <X className="w-5 h-5 text-[#8A857D]" />
                    </button>
                </div>

                {/* Tab bar */}
                <div className="flex gap-1 px-8 pt-4 pb-0 overflow-x-auto shrink-0">
                    {TABS.map((t, i) => {
                        const Icon = t.icon;
                        const done = i < tab;
                        const active = i === tab;
                        return (
                            <button
                                key={t.id}
                                onClick={() => i <= tab && setTab(i)}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-t-xl text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
                                    active
                                        ? "border-[#D97757] text-[#D97757] bg-[#FDF4F1]"
                                        : done
                                        ? "border-[#2D7A5C] text-[#2D7A5C] cursor-pointer hover:bg-[#F5F0E8]"
                                        : "border-transparent text-[#8A857D] cursor-default"
                                }`}
                                data-testid={`tab-${t.id}`}
                            >
                                {done ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                                {t.label}
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-8 py-6">

                    {/* ABA 1 — DADOS */}
                    {tab === 0 && (
                        <div className="space-y-5">
                            <Field label="Nome do app *" hint="Nome que vai aparecer no marketplace">
                                <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Ex: MindFlow, ChefIA, FitTrack..." className={inp} data-testid="field-name" />
                            </Field>
                            <Field label="Tagline *" hint="Uma frase curta que resume o app (máx. 80 caracteres)">
                                <input value={form.tagline} onChange={e => set("tagline", e.target.value)} maxLength={80} placeholder="Ex: Personal trainer com IA no seu bolso" className={inp} data-testid="field-tagline" />
                                <p className="text-[10px] text-[#8A857D] mt-1 text-right">{form.tagline.length}/80</p>
                            </Field>
                            <Field label="Descrição completa *" hint="Descreva o que seu app faz, para quem é e por que vale a pena assinar">
                                <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={5} placeholder="Descreva seu app com detalhes..." className={inp} data-testid="field-description" />
                            </Field>
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Categoria *">
                                    <select value={form.category} onChange={e => set("category", e.target.value)} className={inp} data-testid="field-category">
                                        {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </Field>
                                <Field label="CNPJ ou CPF" hint="Opcional por enquanto">
                                    <input value={form.document} onChange={e => set("document", e.target.value)} placeholder="00.000.000/0001-00" className={inp} data-testid="field-document" />
                                </Field>
                            </div>
                        </div>
                    )}

                    {/* ABA 2 — MÍDIA */}
                    {tab === 1 && (
                        <div className="space-y-6">
                            <div className="bg-[#FDF4F1] border border-[#FBE6DF] rounded-2xl p-4 flex gap-3">
                                <AlertCircle className="w-4 h-4 text-[#D97757] shrink-0 mt-0.5" />
                                <p className="text-sm text-[#524F4A]">Por enquanto, cole a URL da imagem. Em breve teremos upload direto do computador.</p>
                            </div>
                            <Field label="URL do ícone / logo" hint="Imagem quadrada recomendada. Tamanho ideal: 400x400px">
                                <input value={form.icon_url} onChange={e => set("icon_url", e.target.value)} placeholder="https://..." className={inp} data-testid="field-icon-url" />
                                {form.icon_url && (
                                    <div className="mt-3 flex items-center gap-3">
                                        <img src={form.icon_url} alt="" className="w-16 h-16 rounded-2xl object-cover border border-[#E6E1D6]" onError={e => e.target.style.display="none"} />
                                        <span className="text-xs text-[#8A857D]">Pré-visualização do ícone</span>
                                    </div>
                                )}
                            </Field>
                            <Field label="URL da imagem de capa" hint="Imagem horizontal para o card no marketplace. Tamanho ideal: 800x450px">
                                <input value={form.cover_url} onChange={e => set("cover_url", e.target.value)} placeholder="https://..." className={inp} data-testid="field-cover-url" />
                                {form.cover_url && (
                                    <div className="mt-3">
                                        <img src={form.cover_url} alt="" className="w-full h-40 rounded-2xl object-cover border border-[#E6E1D6]" onError={e => e.target.style.display="none"} />
                                        <span className="text-xs text-[#8A857D] mt-1 block">Pré-visualização da capa</span>
                                    </div>
                                )}
                            </Field>
                        </div>
                    )}

                    {/* ABA 3 — PLANO */}
                    {tab === 2 && (
                        <div className="space-y-6">
                            <Field label="Preço da assinatura mensal (R$) *" hint="Valor que o comprador vai pagar por mês">
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#524F4A]">R$</span>
                                    <input
                                        type="number" step="0.01" min="4.99"
                                        value={form.price_monthly}
                                        onChange={e => set("price_monthly", parseFloat(e.target.value) || 0)}
                                        className={inp + " pl-10"}
                                        data-testid="field-price"
                                    />
                                </div>
                            </Field>

                            {form.price_monthly > 0 && (
                                <div className="bg-[#F5F0E8] rounded-2xl p-5 space-y-2 text-sm">
                                    <p className="font-semibold text-[#1A1918] mb-3">Simulação de split (por venda):</p>
                                    <div className="flex justify-between">
                                        <span className="text-[#524F4A]">Taxa SINKRONIZE (9,9%)</span>
                                        <span className="font-semibold text-[#D97757]">- R$ {(form.price_monthly * 0.099).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[#524F4A]">Comissão afiliado ({form.commission_pct}%)</span>
                                        <span className="font-semibold text-[#8A857D]">- R$ {(form.price_monthly * (1 - 0.099) * form.commission_pct / 100).toFixed(2)}</span>
                                    </div>
                                    <div className="border-t border-[#E6E1D6] pt-2 flex justify-between">
                                        <span className="font-semibold text-[#1A1918]">Você recebe</span>
                                        <span className="font-semibold text-[#2D7A5C] text-base">R$ {(form.price_monthly * (1 - 0.099) * (1 - form.commission_pct / 100)).toFixed(2)}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ABA 4 — AFILIAÇÃO */}
                    {tab === 3 && (
                        <div className="space-y-6">
                            <Field label="Comissão do afiliado (%)" hint="Percentual do valor líquido (após taxa da plataforma) que o afiliado recebe por cada venda">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Comissão</span>
                                        <span className="font-semibold text-[#D97757]">{form.commission_pct}%</span>
                                    </div>
                                    <input
                                        type="range" min="10" max="80" step="5"
                                        value={form.commission_pct}
                                        onChange={e => set("commission_pct", parseInt(e.target.value))}
                                        className="w-full accent-[#D97757]"
                                        data-testid="field-commission"
                                    />
                                    <div className="flex justify-between text-xs text-[#8A857D]">
                                        <span>10% (mínimo)</span>
                                        <span>80% (máximo)</span>
                                    </div>
                                </div>
                            </Field>

                            <Field label="Modo de afiliação" hint="Quem pode se tornar afiliado do seu app?">
                                <div className="space-y-3">
                                    {[
                                        { val: "open",   title: "Aberta",  desc: "Qualquer afiliado pode divulgar seu app automaticamente" },
                                        { val: "manual", title: "Manual",  desc: "Você aprova cada afiliado antes que ele possa divulgar" },
                                        { val: "closed", title: "Fechada", desc: "Nenhum afiliado — você vende diretamente" },
                                    ].map(o => (
                                        <label key={o.val} className={`flex items-start gap-3 p-4 border-2 rounded-2xl cursor-pointer transition-colors ${form.affiliate_mode === o.val ? "border-[#D97757] bg-[#FDF4F1]" : "border-[#E6E1D6] hover:border-[#D97757]/40"}`}>
                                            <input type="radio" name="affiliate_mode" value={o.val} checked={form.affiliate_mode === o.val} onChange={() => set("affiliate_mode", o.val)} className="mt-0.5 accent-[#D97757]" data-testid={`mode-${o.val}`} />
                                            <div>
                                                <p className="font-semibold text-sm text-[#1A1918]">{o.title}</p>
                                                <p className="text-xs text-[#524F4A]">{o.desc}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </Field>
                        </div>
                    )}

                    {/* ABA 5 — LINKS */}
                    {tab === 4 && (
                        <div className="space-y-6">
                            <Field label="Página de vendas (opcional)" hint="URL da sua própria página de apresentação do app, se tiver">
                                <input value={form.sales_page_url} onChange={e => set("sales_page_url", e.target.value)} placeholder="https://meuapp.com.br/vendas" className={inp} data-testid="field-sales-url" />
                            </Field>
                            <Field
                                label="URL de obrigado (pós-pagamento) *"
                                hint="Para onde o comprador vai depois que pagar. Normalmente é a tela de login ou acesso do seu app."
                            >
                                <input value={form.thank_you_url} onChange={e => set("thank_you_url", e.target.value)} placeholder="https://meuapp.com.br/acesso" className={inp} data-testid="field-thankyou-url" />
                            </Field>
                            <div className="bg-[#F5F0E8] rounded-2xl p-4 text-sm text-[#524F4A]">
                                <p className="font-semibold text-[#1A1918] mb-1">Como funciona?</p>
                                <p>Após o pagamento confirmado, o comprador é redirecionado para a <strong>URL de obrigado</strong> com os parâmetros <code className="bg-white px-1 rounded text-xs">?email=comprador@email.com&app=slug-do-app</code> para que você possa identificar e liberar o acesso automaticamente.</p>
                            </div>
                        </div>
                    )}

                    {/* ABA 6 — INTEGRAÇÃO */}
                    {tab === 5 && (
                        <div className="space-y-6">
                            <Field
                                label="URL do Webhook (opcional)"
                                hint="A SINKRONIZE vai fazer um POST para essa URL sempre que uma venda for confirmada"
                            >
                                <input value={form.webhook_url} onChange={e => set("webhook_url", e.target.value)} placeholder="https://meuapp.com.br/webhook/sinkronize" className={inp} data-testid="field-webhook-url" />
                            </Field>

                            <div className="bg-[#1A1918] rounded-2xl p-5 text-sm">
                                <p className="text-[#D97757] font-semibold text-xs uppercase tracking-widest mb-3">Payload enviado (JSON)</p>
                                <pre className="text-green-400 text-xs leading-relaxed overflow-x-auto">{`{
  "event": "sale.confirmed",
  "app_id": "uuid-do-app",
  "app_slug": "slug-do-app",
  "buyer_email": "comprador@email.com",
  "buyer_name": "Nome do Comprador",
  "amount": 29.90,
  "producer_amount": 24.28,
  "affiliate_amount": 5.62,
  "affiliation_code": "ABC123",
  "created_at": "2025-05-24T14:00:00Z"
}`}</pre>
                            </div>

                            <div className="bg-[#F0F9F4] border border-[#C3E8D5] rounded-2xl p-4 text-sm text-[#1A4D35]">
                                <p className="font-semibold mb-1">Dica</p>
                                <p>Use o webhook para liberar acesso automaticamente no seu app quando a venda chegar. Não é obrigatório — você também pode usar a URL de obrigado para isso.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-8 py-5 border-t border-[#E6E1D6] shrink-0">
                    <button
                        onClick={() => setTab(t => t - 1)}
                        disabled={tab === 0}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#E6E1D6] text-sm font-semibold text-[#524F4A] hover:border-[#D97757] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" /> Anterior
                    </button>

                    <div className="flex gap-1.5">
                        {TABS.map((_, i) => (
                            <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === tab ? "bg-[#D97757]" : i < tab ? "bg-[#2D7A5C]" : "bg-[#E6E1D6]"}`} />
                        ))}
                    </div>

                    {tab < TABS.length - 1 ? (
                        <button
                            onClick={() => setTab(t => t + 1)}
                            disabled={!canNext()}
                            className="inline-flex items-center gap-2 bg-[#D97757] hover:bg-[#C55D3D] text-white rounded-full px-6 py-2.5 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            data-testid="btn-next"
                        >
                            Próximo <ChevronRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={submit}
                            disabled={saving}
                            className="inline-flex items-center gap-2 bg-[#D97757] hover:bg-[#C55D3D] text-white rounded-full px-6 py-2.5 text-sm font-semibold disabled:opacity-60 transition-colors"
                            data-testid="btn-publish"
                        >
                            {saving ? "Publicando..." : <><Check className="w-4 h-4" /> Publicar app</>}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
