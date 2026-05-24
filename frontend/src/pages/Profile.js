import { useEffect, useState, useRef } from "react";
import { Layout } from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import { storageAPI } from "../lib/api";
import { User, Lock, Building2, CreditCard, Upload, Check, Eye, EyeOff } from "lucide-react";

const inp = "w-full bg-[#FAF9F5] border border-[#E6E1D6] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D97757] focus:ring-2 focus:ring-[#D97757]/10 transition-colors placeholder:text-[#C4BDB5]";

const TABS = [
    { id: "pessoal",  label: "Dados pessoais", icon: User },
    { id: "bancario", label: "Dados bancários", icon: CreditCard },
    { id: "senha",    label: "Senha",           icon: Lock },
];

const BANKS = [
    "Nubank","Itaú","Bradesco","Santander","Caixa Econômica Federal",
    "Banco do Brasil","Inter","C6 Bank","BTG Pactual","Sicoob",
    "XP Investimentos","Safra","Modal","Mercado Pago","PicPay","Outro"
];

function Field({ label, hint, children }) {
    return (
        <div>
            <label className="block text-sm font-semibold text-[#1A1918] mb-1">{label}</label>
            {hint && <p className="text-xs text-[#8A857D] mb-2">{hint}</p>}
            {children}
        </div>
    );
}

export default function Profile() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [tab, setTab] = useState(0);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showPwd, setShowPwd] = useState(false);
    const [showNewPwd, setShowNewPwd] = useState(false);
    const fileRef = useRef(null);

    const [personal, setPersonal] = useState({
        name: "", email: "", phone: "", bio: "", cpf: "", cnpj: "", avatar_url: "",
    });
    const [bank, setBank] = useState({
        bank_name: "", bank_agency: "", bank_account: "", bank_account_type: "corrente", pix_key: "",
    });
    const [passwords, setPasswords] = useState({ current: "", newp: "", confirm: "" });

    useEffect(() => {
        if (loading) return;
        if (!user) { navigate("/login", { state: { from: "/perfil" } }); return; }
        // Load full profile from supabase
        supabase.from("profiles").select("*").eq("id", user.id).single()
            .then(({ data }) => {
                if (!data) return;
                setPersonal({
                    name:      data.name       || "",
                    email:     data.email      || user.email || "",
                    phone:     data.phone      || "",
                    bio:       data.bio        || "",
                    cpf:       data.cpf        || "",
                    cnpj:      data.cnpj       || "",
                    avatar_url: data.avatar_url || data.picture || "",
                });
                setBank({
                    bank_name:         data.bank_name         || "",
                    bank_agency:       data.bank_agency       || "",
                    bank_account:      data.bank_account      || "",
                    bank_account_type: data.bank_account_type || "corrente",
                    pix_key:           data.pix_key           || "",
                });
            });
    }, [user, loading, navigate]);

    const uploadAvatar = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const url = await storageAPI.upload(file, "avatars");
            setPersonal(p => ({ ...p, avatar_url: url }));
            toast.success("Foto atualizada!");
        } catch (err) {
            toast.error("Erro no upload: " + err.message);
        } finally {
            setUploading(false);
        }
    };

    const formatCPF = (v) => {
        const d = v.replace(/\D/g, "").slice(0, 11);
        return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
                .replace(/(\d{3})(\d{3})(\d{3})/, "$1.$2.$3")
                .replace(/(\d{3})(\d{3})/, "$1.$2");
    };

    const formatCNPJ = (v) => {
        const d = v.replace(/\D/g, "").slice(0, 14);
        return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
                .replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, "$1.$2.$3/$4")
                .replace(/(\d{2})(\d{3})(\d{3})/, "$1.$2.$3")
                .replace(/(\d{2})(\d{3})/, "$1.$2");
    };

    const savePersonal = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { error } = await supabase.from("profiles").update({
                name:       personal.name,
                phone:      personal.phone,
                bio:        personal.bio,
                cpf:        personal.cpf,
                cnpj:       personal.cnpj,
                avatar_url: personal.avatar_url,
                picture:    personal.avatar_url,
            }).eq("id", user.id);
            if (error) throw error;
            toast.success("Dados pessoais salvos!");
        } catch (err) {
            toast.error("Erro: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    const saveBank = async (e) => {
        e.preventDefault();
        if (!bank.pix_key) { toast.error("Chave PIX é obrigatória para saques"); return; }
        setSaving(true);
        try {
            const { error } = await supabase.from("profiles").update({
                bank_name:         bank.bank_name,
                bank_agency:       bank.bank_agency,
                bank_account:      bank.bank_account,
                bank_account_type: bank.bank_account_type,
                pix_key:           bank.pix_key,
            }).eq("id", user.id);
            if (error) throw error;
            toast.success("Dados bancários salvos!");
        } catch (err) {
            toast.error("Erro: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    const savePassword = async (e) => {
        e.preventDefault();
        if (passwords.newp !== passwords.confirm) { toast.error("As senhas não coincidem"); return; }
        if (passwords.newp.length < 6) { toast.error("A nova senha deve ter pelo menos 6 caracteres"); return; }
        setSaving(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: passwords.newp });
            if (error) throw error;
            toast.success("Senha atualizada com sucesso!");
            setPasswords({ current: "", newp: "", confirm: "" });
        } catch (err) {
            toast.error("Erro: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading || !user) return <Layout><div className="min-h-screen flex items-center justify-center">Carregando...</div></Layout>;

    return (
        <Layout>
            <section className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
                {/* Header */}
                <div className="flex items-center gap-6 mb-10">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[#D97757] flex items-center justify-center">
                            {personal.avatar_url ? (
                                <img src={personal.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-white text-2xl font-semibold">{personal.name?.[0]?.toUpperCase() || "U"}</span>
                            )}
                        </div>
                        <button
                            onClick={() => fileRef.current?.click()}
                            className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white border border-[#E6E1D6] flex items-center justify-center hover:border-[#D97757] transition-colors shadow-sm"
                            title="Trocar foto"
                        >
                            {uploading ? (
                                <svg className="animate-spin w-3.5 h-3.5 text-[#D97757]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                            ) : (
                                <Upload className="w-3.5 h-3.5 text-[#524F4A]" />
                            )}
                        </button>
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={uploadAvatar} />
                    </div>
                    <div>
                        <h1 className="font-serif-display text-3xl font-semibold">{personal.name || "Meu perfil"}</h1>
                        <p className="text-[#8A857D] text-sm mt-1">{personal.email}</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <nav className="space-y-1">
                            {TABS.map((t, i) => {
                                const Icon = t.icon;
                                return (
                                    <button
                                        key={t.id}
                                        onClick={() => setTab(i)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left ${
                                            tab === i
                                                ? "bg-[#D97757] text-white"
                                                : "text-[#524F4A] hover:bg-[#F5F0E8]"
                                        }`}
                                    >
                                        <Icon className="w-4 h-4 shrink-0" />
                                        {t.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Content */}
                    <div className="lg:col-span-3">

                        {/* DADOS PESSOAIS */}
                        {tab === 0 && (
                            <form onSubmit={savePersonal} className="bg-white border border-[#E6E1D6] rounded-2xl p-8 space-y-5">
                                <h2 className="font-serif-display text-xl font-semibold mb-2">Dados pessoais</h2>

                                <Field label="Nome completo *">
                                    <input
                                        required value={personal.name}
                                        onChange={e => setPersonal(p => ({ ...p, name: e.target.value }))}
                                        placeholder="Seu nome completo"
                                        className={inp}
                                    />
                                </Field>

                                <Field label="E-mail" hint="Para alterar o e-mail entre em contato com o suporte">
                                    <input value={personal.email} disabled className={inp + " opacity-60 cursor-not-allowed"} />
                                </Field>

                                <Field label="Telefone / WhatsApp">
                                    <input
                                        value={personal.phone}
                                        onChange={e => setPersonal(p => ({ ...p, phone: e.target.value }))}
                                        placeholder="(11) 99999-9999"
                                        className={inp}
                                    />
                                </Field>

                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="CPF" hint="Obrigatório para saques (afiliados)">
                                        <input
                                            value={personal.cpf}
                                            onChange={e => setPersonal(p => ({ ...p, cpf: formatCPF(e.target.value) }))}
                                            placeholder="000.000.000-00"
                                            maxLength={14}
                                            className={inp}
                                        />
                                    </Field>
                                    <Field label="CNPJ" hint="Se você tem empresa (produtores)">
                                        <input
                                            value={personal.cnpj}
                                            onChange={e => setPersonal(p => ({ ...p, cnpj: formatCNPJ(e.target.value) }))}
                                            placeholder="00.000.000/0001-00"
                                            maxLength={18}
                                            className={inp}
                                        />
                                    </Field>
                                </div>

                                <Field label="Bio" hint="Apareça melhor para compradores e afiliados (máx. 300 caracteres)">
                                    <textarea
                                        value={personal.bio}
                                        onChange={e => setPersonal(p => ({ ...p, bio: e.target.value }))}
                                        maxLength={300}
                                        rows={3}
                                        placeholder="Fale um pouco sobre você ou sua empresa..."
                                        className={inp}
                                    />
                                    <p className="text-[10px] text-[#8A857D] mt-1 text-right">{personal.bio.length}/300</p>
                                </Field>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex items-center gap-2 bg-[#D97757] hover:bg-[#C55D3D] text-white rounded-full px-8 py-3 font-semibold disabled:opacity-60 transition-colors"
                                >
                                    {saving ? "Salvando..." : <><Check className="w-4 h-4" /> Salvar dados pessoais</>}
                                </button>
                            </form>
                        )}

                        {/* DADOS BANCÁRIOS */}
                        {tab === 1 && (
                            <form onSubmit={saveBank} className="bg-white border border-[#E6E1D6] rounded-2xl p-8 space-y-5">
                                <h2 className="font-serif-display text-xl font-semibold mb-2">Dados bancários</h2>
                                <div className="bg-[#F0F9F4] border border-[#C3E8D5] rounded-2xl p-4 text-sm text-[#1A4D35]">
                                    <p className="font-semibold mb-1">Por que preciso disso?</p>
                                    <p>Esses dados são usados para processar seus saques via PIX. Somente você e a equipe SINKRONIZE têm acesso.</p>
                                </div>

                                <Field label="Chave PIX *" hint="CPF, CNPJ, e-mail, telefone ou chave aleatória">
                                    <input
                                        value={bank.pix_key}
                                        onChange={e => setBank(b => ({ ...b, pix_key: e.target.value }))}
                                        placeholder="Sua chave PIX"
                                        className={inp}
                                    />
                                </Field>

                                <Field label="Banco">
                                    <select
                                        value={bank.bank_name}
                                        onChange={e => setBank(b => ({ ...b, bank_name: e.target.value }))}
                                        className={inp}
                                    >
                                        <option value="">Selecione o banco</option>
                                        {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                </Field>

                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Agência">
                                        <input
                                            value={bank.bank_agency}
                                            onChange={e => setBank(b => ({ ...b, bank_agency: e.target.value }))}
                                            placeholder="0000"
                                            className={inp}
                                        />
                                    </Field>
                                    <Field label="Conta">
                                        <input
                                            value={bank.bank_account}
                                            onChange={e => setBank(b => ({ ...b, bank_account: e.target.value }))}
                                            placeholder="00000-0"
                                            className={inp}
                                        />
                                    </Field>
                                </div>

                                <Field label="Tipo de conta">
                                    <div className="flex gap-3">
                                        {["corrente", "poupança"].map(t => (
                                            <label key={t} className={`flex items-center gap-2 flex-1 p-3 border-2 rounded-xl cursor-pointer transition-colors capitalize ${bank.bank_account_type === t ? "border-[#D97757] bg-[#FDF4F1]" : "border-[#E6E1D6]"}`}>
                                                <input type="radio" name="bank_type" value={t} checked={bank.bank_account_type === t} onChange={() => setBank(b => ({ ...b, bank_account_type: t }))} className="accent-[#D97757]" />
                                                <span className="text-sm font-medium capitalize">{t}</span>
                                            </label>
                                        ))}
                                    </div>
                                </Field>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex items-center gap-2 bg-[#D97757] hover:bg-[#C55D3D] text-white rounded-full px-8 py-3 font-semibold disabled:opacity-60 transition-colors"
                                >
                                    {saving ? "Salvando..." : <><Check className="w-4 h-4" /> Salvar dados bancários</>}
                                </button>
                            </form>
                        )}

                        {/* SENHA */}
                        {tab === 2 && (
                            <form onSubmit={savePassword} className="bg-white border border-[#E6E1D6] rounded-2xl p-8 space-y-5">
                                <h2 className="font-serif-display text-xl font-semibold mb-2">Alterar senha</h2>

                                <Field label="Nova senha *">
                                    <div className="relative">
                                        <input
                                            required
                                            type={showNewPwd ? "text" : "password"}
                                            value={passwords.newp}
                                            onChange={e => setPasswords(p => ({ ...p, newp: e.target.value }))}
                                            placeholder="Mínimo 6 caracteres"
                                            minLength={6}
                                            className={inp + " pr-10"}
                                        />
                                        <button type="button" onClick={() => setShowNewPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A857D]">
                                            {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </Field>

                                <Field label="Confirmar nova senha *">
                                    <div className="relative">
                                        <input
                                            required
                                            type={showPwd ? "text" : "password"}
                                            value={passwords.confirm}
                                            onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                                            placeholder="Repita a nova senha"
                                            className={inp + " pr-10"}
                                        />
                                        <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A857D]">
                                            {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {passwords.confirm && passwords.newp !== passwords.confirm && (
                                        <p className="text-xs text-[#B04646] mt-1">As senhas não coincidem</p>
                                    )}
                                </Field>

                                <div className="bg-[#F5F0E8] rounded-xl p-4 text-sm text-[#524F4A]">
                                    <p className="font-semibold mb-1">Requisitos de segurança:</p>
                                    <ul className="space-y-1 text-xs">
                                        <li className={`flex items-center gap-1.5 ${passwords.newp.length >= 6 ? "text-[#2D7A5C]" : "text-[#8A857D]"}`}>
                                            <Check className="w-3 h-3" /> Mínimo 6 caracteres
                                        </li>
                                        <li className={`flex items-center gap-1.5 ${/[A-Z]/.test(passwords.newp) ? "text-[#2D7A5C]" : "text-[#8A857D]"}`}>
                                            <Check className="w-3 h-3" /> Pelo menos 1 letra maiúscula (recomendado)
                                        </li>
                                        <li className={`flex items-center gap-1.5 ${/\d/.test(passwords.newp) ? "text-[#2D7A5C]" : "text-[#8A857D]"}`}>
                                            <Check className="w-3 h-3" /> Pelo menos 1 número (recomendado)
                                        </li>
                                    </ul>
                                </div>

                                <button
                                    type="submit"
                                    disabled={saving || passwords.newp !== passwords.confirm}
                                    className="inline-flex items-center gap-2 bg-[#D97757] hover:bg-[#C55D3D] text-white rounded-full px-8 py-3 font-semibold disabled:opacity-60 transition-colors"
                                >
                                    {saving ? "Salvando..." : <><Lock className="w-4 h-4" /> Alterar senha</>}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </section>
        </Layout>
    );
}
