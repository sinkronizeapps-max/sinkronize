import { useState } from "react";
import { Layout } from "../components/Layout";
import { Mail, MessageCircle, Send, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";

const SUBJECTS = [
    "Elogio",
    "Dúvida",
    "Sugestão / Dica",
    "Reclamação",
    "Problema técnico",
    "Parceria",
    "Outro",
];

export default function Contact() {
    const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const submit = async (e) => {
        e.preventDefault();
        if (!form.subject) { toast.error("Selecione um assunto"); return; }
        setLoading(true);
        try {
            const { error } = await supabase.functions.invoke("send-contact", { body: form });
            if (error) throw error;
            setSent(true);
        } catch {
            // fallback: open mailto
            window.location.href = `mailto:contatosinkronize@gmail.com?subject=${encodeURIComponent(`[${form.subject}] ${form.name}`)}&body=${encodeURIComponent(form.message)}`;
            setSent(true);
        } finally {
            setLoading(false);
        }
    };

    const inp = "w-full bg-white border border-[#E6E1D6] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D97757] focus:ring-2 focus:ring-[#D97757]/10 transition-colors placeholder:text-[#C4BDB5]";

    return (
        <Layout>
            {/* Hero */}
            <section className="bg-gradient-to-br from-[#F5F0E8] to-[#FAF9F5] py-16 lg:py-20">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D97757]">Fale com a gente</span>
                    <h1 className="font-serif-display text-4xl lg:text-5xl font-semibold tracking-tight text-[#1A1918] mt-3 mb-4">
                        Contato
                    </h1>
                    <p className="text-lg text-[#524F4A] max-w-xl mx-auto">
                        Elogio, sugestão, dúvida ou reclamação — estamos aqui para ouvir você.
                    </p>
                </div>
            </section>

            <section className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
                <div className="grid lg:grid-cols-5 gap-10">

                    {/* Canais diretos */}
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="font-serif-display text-2xl font-semibold text-[#1A1918] mb-6">Canais diretos</h2>

                        {/* WhatsApp */}
                        <a
                            href="https://wa.me/5511962072438"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 bg-[#25D366] hover:bg-[#1DAA52] text-white rounded-2xl p-5 transition-colors group"
                            data-testid="whatsapp-link"
                        >
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                </svg>
                            </div>
                            <div>
                                <p className="font-semibold text-base">WhatsApp</p>
                                <p className="text-white/80 text-sm">(11) 96207-2438</p>
                            </div>
                        </a>

                        {/* E-mail */}
                        <a
                            href="mailto:contatosinkronize@gmail.com"
                            className="flex items-center gap-4 bg-white border border-[#E6E1D6] hover:border-[#D97757] rounded-2xl p-5 transition-colors group"
                            data-testid="email-link"
                        >
                            <div className="w-12 h-12 bg-[#FDF4F1] rounded-xl flex items-center justify-center shrink-0">
                                <Mail className="w-6 h-6 text-[#D97757]" />
                            </div>
                            <div>
                                <p className="font-semibold text-[#1A1918] text-base">E-mail</p>
                                <p className="text-[#524F4A] text-sm">contatosinkronize@gmail.com</p>
                            </div>
                        </a>

                        {/* Info */}
                        <div className="bg-[#F5F0E8] rounded-2xl p-5 mt-4">
                            <p className="text-sm font-semibold text-[#1A1918] mb-1">Horário de atendimento</p>
                            <p className="text-sm text-[#524F4A]">Segunda a sexta, das 9h às 18h.</p>
                            <p className="text-sm text-[#524F4A] mt-2">Respondemos em até 24h úteis.</p>
                        </div>
                    </div>

                    {/* Formulário */}
                    <div className="lg:col-span-3">
                        <div className="bg-white border border-[#E6E1D6] rounded-3xl p-8">
                            {sent ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-[#F0F9F4] rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Check className="w-8 h-8 text-[#2D7A5C]" />
                                    </div>
                                    <h3 className="font-serif-display text-2xl font-semibold mb-2">Mensagem enviada!</h3>
                                    <p className="text-[#524F4A]">Retornaremos em breve. Obrigada pelo contato 💛</p>
                                    <button
                                        onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                                        className="mt-6 text-sm text-[#D97757] font-semibold hover:underline"
                                    >
                                        Enviar outra mensagem
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={submit} className="space-y-5" data-testid="contact-form">
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-[#1A1918] mb-1.5">Seu nome</label>
                                            <input
                                                value={form.name}
                                                onChange={e => set("name", e.target.value)}
                                                required
                                                placeholder="Como posso te chamar?"
                                                className={inp}
                                                data-testid="contact-name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-[#1A1918] mb-1.5">Seu e-mail</label>
                                            <input
                                                type="email"
                                                value={form.email}
                                                onChange={e => set("email", e.target.value)}
                                                required
                                                placeholder="para@responder.com"
                                                className={inp}
                                                data-testid="contact-email"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-[#1A1918] mb-1.5">Assunto</label>
                                        <div className="flex flex-wrap gap-2">
                                            {SUBJECTS.map(s => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => set("subject", s)}
                                                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${form.subject === s ? "bg-[#D97757] text-white border-[#D97757]" : "bg-white border-[#E6E1D6] text-[#524F4A] hover:border-[#D97757]"}`}
                                                    data-testid={`subject-${s}`}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-[#1A1918] mb-1.5">
                                            Mensagem
                                            <span className="text-[#8A857D] font-normal ml-2">{form.message.length}/1500</span>
                                        </label>
                                        <textarea
                                            value={form.message}
                                            onChange={e => set("message", e.target.value)}
                                            required
                                            rows={10}
                                            maxLength={1500}
                                            placeholder="Conte o que você pensa, precisar ou quer nos dizer..."
                                            className={inp + " resize-none"}
                                            data-testid="contact-message"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-[#D97757] hover:bg-[#C55D3D] text-white rounded-full py-3.5 font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                                        data-testid="contact-submit"
                                    >
                                        {loading ? "Enviando..." : <><Send className="w-4 h-4" /> Enviar mensagem</>}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
}
