import { useState, useEffect, useId } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  X,
  Send,
  Loader2,
  ChevronDown,
  Hash,
  Calendar,
  MapPin,
  Users,
  UserCheck,
  UserX,
  Star,
  Heart,
  Phone,
  Building2,
  User,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

/* ─── Tipos ─────────────────────────────────────────── */

type GMData = {
  id: string;
  nome: string;
  lider: string;
  whatsapp_lider: string;
  congregacao_nome: string;
  area_nome: string;
};

type FormState = {
  data_gm: string;
  area_nome: string;
  gm_id: string;
  nome_gm: string;
  congregacao: string;
  nome_lider: string;
  whatsapp: string;
  qtd_membros: string;
  visitantes_cristaos: string;
  visitantes_nao_cristaos: string;
  decisao: string;
  reconciliacao: string;
};

const INITIAL_FORM: FormState = {
  data_gm: "",
  area_nome: "",
  gm_id: "",
  nome_gm: "",
  congregacao: "",
  nome_lider: "",
  whatsapp: "",
  qtd_membros: "",
  visitantes_cristaos: "",
  visitantes_nao_cristaos: "",
  decisao: "",
  reconciliacao: "",
};

const AREAS = [
  "Templo Central",
  ...Array.from({ length: 33 }, (_, i) => `Área ${String(i + 1).padStart(2, "0")}`),
];

function formatWhatsApp(raw: string): string {
  // Remove tudo que não é dígito
  const digits = raw.replace(/\D/g, "").slice(0, 9);
  if (digits.length === 0) return "";
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

/* ─── Props ──────────────────────────────────────────── */

type EnviarRelatorioDialogProps = {
  open: boolean;
  onClose: () => void;
};

/* ─── Componente principal ───────────────────────────── */

export function EnviarRelatorioDialog({
  open,
  onClose,
}: EnviarRelatorioDialogProps) {
  const uid = useId();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [reportId, setReportId] = useState<number | null>(null);
  const [allGMs, setAllGMs] = useState<GMData[]>([]);
  const [filteredGMs, setFilteredGMs] = useState<GMData[]>([]);
  const [loadingGMs, setLoadingGMs] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Carrega todos os GMs uma única vez quando o diálogo abre
  useEffect(() => {
    if (!open) return;
    setLoadingGMs(true);
    supabase
      .from("grupos_missionarios")
      .select("id, nome, lider, whatsapp_lider, congregacao_nome, area_nome")
      .then(({ data, error }) => {
        if (!error && data) setAllGMs(data as GMData[]);
        setLoadingGMs(false);
      });
  }, [open]);

  if (!open) return null;

  /* ── Handlers ── */

  function handleAreaChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const area = e.target.value;
    const gmsForArea = allGMs.filter((gm) => gm.area_nome === area);

    setForm((prev) => ({
      ...prev,
      area_nome: area,
      gm_id: "",
      nome_gm: "",
      congregacao: "",
      nome_lider: "",
      whatsapp: "",
    }));
    setFilteredGMs(gmsForArea);
  }

  function handleGMChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selected = filteredGMs.find((gm) => gm.id === e.target.value);
    if (!selected) return;

    const rawWA = selected.whatsapp_lider ?? "";
    // Formata: 91 9 XXXXX-XXXX  (prefixo fixo 91 + dígito 9 + 8 dígitos)
    const digits = rawWA.replace(/\D/g, "");
    const localDigits = digits.slice(-9); // pega só os 9 últimos dígitos (sem DDD)
    const formatted =
      localDigits.length >= 5
        ? `${localDigits.slice(0, 5)}-${localDigits.slice(5)}`
        : localDigits;

    setForm((prev) => ({
      ...prev,
      gm_id: selected.id,
      nome_gm: selected.nome,
      congregacao: selected.congregacao_nome ?? "",
      nome_lider: selected.lider ?? "",
      whatsapp: formatted,
    }));
  }

  function handleNumericChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    const clean = value.replace(/\D/g, "");
    setForm((prev) => ({ ...prev, [name]: clean }));
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleClear() {
    setForm(INITIAL_FORM);
    setFilteredGMs([]);
    setSuccessMessage("");
    setErrorMessage("");
    setReportId(null);
  }

  function handleClose() {
    handleClear();
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      // Validacao: 1 relatorio por GM por semana (domingo a sabado)
      const chosen = new Date(form.data_gm + "T12:00:00");
      const dow = chosen.getDay(); // 0 = domingo
      const weekStart = new Date(chosen);
      weekStart.setDate(chosen.getDate() - dow);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const fmtDate = (d: Date) => {
        const pad = (n: number) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      };

      const weekStartStr = fmtDate(weekStart);
      const weekEndStr   = fmtDate(weekEnd);

      const { data: existing } = await supabase
        .from("relatorios_semanais")
        .select("id, data_gm")
        .eq("gm_id", form.gm_id)
        .gte("data_gm", weekStartStr)
        .lte("data_gm", weekEndStr)
        .limit(1)
        .maybeSingle();

      if (existing) {
        const fmt = (s: string) => s.split("-").reverse().join("/");
        const dataFmt = new Date(existing.data_gm + "T12:00:00").toLocaleDateString("pt-BR");
        setErrorMessage(
          `Ja existe um relatorio enviado para este GM nesta semana ` +
          `(${fmt(weekStartStr)} a ${fmt(weekEndStr)}). ` +
          `Relatorio #${existing.id} foi registrado em ${dataFmt}. ` +
          `Cada GM pode enviar apenas um relatorio por semana.`
        );
        setIsSubmitting(false);
        return;
      }

      let wClean = form.whatsapp.replace(/\D/g, "");
      if (wClean.length <= 9 && wClean.length > 0) wClean = `91${wClean.length === 8 ? '9' : ''}${wClean}`;
      else if (wClean.length === 10 && wClean.startsWith("91")) wClean = `919${wClean.slice(2)}`;
      const whatsappFull = wClean;

      const { data, error } = await supabase
        .from("relatorios_semanais")
        .insert({
          data_gm: form.data_gm,
          area_nome: form.area_nome,
          gm_id: form.gm_id || null,
          nome_gm: form.nome_gm,
          congregacao: form.congregacao,
          nome_lider: form.nome_lider,
          whatsapp: whatsappFull,
          qtd_membros: parseInt(form.qtd_membros) || 0,
          visitantes_cristaos: parseInt(form.visitantes_cristaos) || 0,
          visitantes_nao_cristaos: parseInt(form.visitantes_nao_cristaos) || 0,
          decisao: parseInt(form.decisao) || 0,
          reconciliacao: parseInt(form.reconciliacao) || 0,
        })
        .select("id")
        .single();

      if (error) throw error;

      setReportId(data.id);
      setSuccessMessage(
        `✅ Relatório #${data.id} enviado com sucesso! Fechando formulário...`
      );
      
      // Invalidar as caches do dashboard para atualização imediata
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["top10"] });

      // Aguarda 1.5s para o usuário ler a mensagem de sucesso e fecha automático
      setTimeout(() => {
        handleClose();
      }, 1500);

    } catch (err: any) {
      setErrorMessage(
        "Erro ao enviar relatório: " + (err?.message ?? "Erro desconhecido")
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  /* ── UI ── */

  const autoFilled = !!form.gm_id;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-3 sm:items-center sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80"
        onClick={handleClose}
      />

      {/* Card */}
      <div className="relative z-10 my-4 flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-card shadow-2xl ring-1 ring-black/5">
        
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-5 py-4 sm:px-8 sm:py-5"
          style={{ background: "var(--gradient-banner)" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-gold-deep/30 bg-white shadow sm:h-11 sm:w-11">
              <Send className="h-5 w-5 text-gold-deep" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-gold-deep sm:text-xl">
                Relatório Semanal do GM
              </h2>
              <p className="text-[10px] font-semibold tracking-widest text-gold-deep/60 uppercase">
                Todos os campos são obrigatórios
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-deep/10 text-gold-deep transition hover:bg-gold-deep/25"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Mensagens ── */}
        {successMessage && (
          <div className="mx-5 mt-4 rounded-xl border border-action-green/30 bg-action-green/10 px-4 py-3 text-center text-sm font-semibold text-action-green sm:mx-8">
            {successMessage}
            {reportId && (
              <div className="mt-1 text-xs font-medium opacity-70">
                ID do Relatório: <strong>#{reportId}</strong>
              </div>
            )}
          </div>
        )}
        {errorMessage && (
          <div className="mx-5 mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-center text-sm font-semibold text-destructive sm:mx-8">
            {errorMessage}
          </div>
        )}

        {/* ── Formulário ── */}
        <form
          id={`${uid}-form`}
          onSubmit={handleSubmit}
          className="flex flex-col gap-0 overflow-y-auto"
        >
          {/* Bloco 1 — Identificação do Relatório */}
          <Section title="Identificação do Relatório" icon={Hash}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* ID — read-only gerado pelo sistema */}
              <Field label="ID do Relatório" icon={Hash}>
                <div className="flex h-10 items-center gap-2 rounded-lg border border-border/60 bg-surface/50 px-3 text-sm text-muted-foreground">
                  <span className="font-mono text-xs">
                    Gerado automaticamente pelo sistema
                  </span>
                </div>
              </Field>

              {/* Data */}
              <Field label="Data do GM" icon={Calendar} required>
                <input
                  required
                  type="date"
                  name="data_gm"
                  value={form.data_gm}
                  onChange={handleChange}
                  className={inputClass}
                />
              </Field>
            </div>
          </Section>

          <Divider />

          {/* Bloco 2 — Dados do Grupo */}
          <Section title="Dados do Grupo Missionário" icon={MapPin}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Área */}
              <Field label="Área" icon={MapPin} required>
                <div className="relative">
                  <select
                    required
                    name="area_nome"
                    value={form.area_nome}
                    onChange={handleAreaChange}
                    className={selectClass}
                  >
                    <option value="" disabled>
                      Selecione a área…
                    </option>
                    {AREAS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </Field>

              {/* Nome do GM — dropdown filtrado */}
              <Field label="Nome do GM" icon={Building2} required>
                <div className="relative">
                  <select
                    required
                    name="gm_id"
                    value={form.gm_id}
                    onChange={handleGMChange}
                    disabled={!form.area_nome || loadingGMs}
                    className={selectClass + (!form.area_nome ? " opacity-50" : "")}
                  >
                    <option value="" disabled>
                      {loadingGMs
                        ? "Carregando GMs…"
                        : form.area_nome
                        ? filteredGMs.length === 0
                          ? "Nenhum GM nesta área"
                          : "Selecione o GM…"
                        : "Selecione a área primeiro"}
                    </option>
                    {filteredGMs.map((gm) => (
                      <option key={gm.id} value={gm.id}>
                        {gm.nome}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </Field>
            </div>

            {/* Auto-preenchidos */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <AutoField
                label="Congregação"
                icon={Building2}
                value={form.congregacao}
                placeholder="— preenchido automaticamente —"
              />
              <AutoField
                label="Nome do Líder"
                icon={User}
                value={form.nome_lider}
                placeholder="— preenchido automaticamente —"
              />
              <AutoField
                label='WhatsApp (91 · 9 · nº)'
                icon={Phone}
                value={form.whatsapp ? `91 · 9 · ${form.whatsapp}` : ""}
                placeholder="— preenchido automaticamente —"
              />
            </div>

            {autoFilled && (
              <p className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-action-green">
                <span className="inline-block h-2 w-2 rounded-full bg-action-green" />
                Dados do GM carregados automaticamente
              </p>
            )}
          </Section>

          <Divider />

          {/* Bloco 3 — Números do Relatório */}
          <Section title="Números do Relatório" icon={Users}>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <NumericField
                label="Membros no GM"
                icon={Users}
                name="qtd_membros"
                value={form.qtd_membros}
                onChange={handleNumericChange}
                color="blue"
              />
              <NumericField
                label="Visitantes Cristãos"
                icon={UserCheck}
                name="visitantes_cristaos"
                value={form.visitantes_cristaos}
                onChange={handleNumericChange}
                color="teal"
              />
              <NumericField
                label="Visitantes Não Cristãos"
                icon={UserX}
                name="visitantes_nao_cristaos"
                value={form.visitantes_nao_cristaos}
                onChange={handleNumericChange}
                color="purple"
              />
              <NumericField
                label="Decisões"
                icon={Star}
                name="decisao"
                value={form.decisao}
                onChange={handleNumericChange}
                color="gold"
              />
              <NumericField
                label="Reconciliações"
                icon={Heart}
                name="reconciliacao"
                value={form.reconciliacao}
                onChange={handleNumericChange}
                color="rose"
              />
            </div>
          </Section>

          {/* ── Footer / Actions ── */}
          <div className="flex flex-col-reverse gap-3 border-t border-border/50 bg-surface/30 px-5 py-4 sm:flex-row sm:justify-end sm:px-8 sm:py-5">
            <button
              type="button"
              onClick={handleClear}
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 text-sm font-semibold text-muted-foreground transition hover:bg-surface-muted"
            >
              Limpar Formulário
            </button>
            <button
              type="submit"
              form={`${uid}-form`}
              disabled={isSubmitting}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-action-green px-8 text-sm font-bold text-action-foreground shadow-md transition hover:brightness-110 disabled:opacity-60"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {isSubmitting ? "Enviando…" : "Enviar Relatório"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Sub-componentes internos ───────────────────────── */

const inputClass =
  "h-10 w-full rounded-lg border border-border/80 bg-surface px-3 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition focus:border-action-blue-strong focus:ring-2 focus:ring-action-blue-strong/20";

const selectClass =
  "h-10 w-full appearance-none rounded-lg border border-border/80 bg-surface px-3 pr-8 text-sm text-foreground outline-none transition focus:border-action-blue-strong focus:ring-2 focus:ring-action-blue-strong/20";

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 px-5 py-5 sm:px-8 sm:py-6">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-action-blue-strong" />
        <span className="text-xs font-bold uppercase tracking-widest text-action-blue-strong">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

function Divider() {
  return <div className="mx-5 h-px bg-border/60 sm:mx-8" />;
}

function Field({
  label,
  icon: Icon,
  required,
  children,
}: {
  label: string;
  icon: React.ElementType;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
        {required && <span className="text-red-400">*</span>}
      </span>
      {children}
    </label>
  );
}

function AutoField({
  label,
  icon: Icon,
  value,
  placeholder,
}: {
  label: string;
  icon: React.ElementType;
  value: string;
  placeholder: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </span>
      <div
        className={`flex h-10 items-center rounded-lg border px-3 text-sm transition-all ${
          value
            ? "border-action-green/40 bg-action-green/5 font-medium text-foreground"
            : "border-border/50 bg-surface/50 italic text-muted-foreground/50"
        }`}
      >
        <span className="truncate">{value || placeholder}</span>
      </div>
    </div>
  );
}

const numericColorMap: Record<string, string> = {
  blue: "border-blue-400/30 bg-blue-50/50 focus:border-blue-500 focus:ring-blue-200",
  teal: "border-teal-400/30 bg-teal-50/50 focus:border-teal-500 focus:ring-teal-200",
  purple: "border-purple-400/30 bg-purple-50/50 focus:border-purple-500 focus:ring-purple-200",
  gold: "border-yellow-400/30 bg-yellow-50/50 focus:border-yellow-500 focus:ring-yellow-200",
  rose: "border-rose-400/30 bg-rose-50/50 focus:border-rose-500 focus:ring-rose-200",
};

const numericIconColorMap: Record<string, string> = {
  blue: "text-blue-500",
  teal: "text-teal-500",
  purple: "text-purple-500",
  gold: "text-yellow-500",
  rose: "text-rose-500",
};

function NumericField({
  label,
  icon: Icon,
  name,
  value,
  onChange,
  color,
}: {
  label: string;
  icon: React.ElementType;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  color: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span
        className={`flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider ${numericIconColorMap[color]}`}
      >
        <Icon className="h-3.5 w-3.5" />
        {label}
        <span className="text-red-400">*</span>
      </span>
      <div className="relative">
        <input
          required
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          name={name}
          value={value}
          onChange={onChange}
          placeholder="0"
          className={`h-14 w-full rounded-xl border-2 bg-white/80 px-4 text-center text-2xl font-black text-foreground outline-none transition focus:ring-2 ${numericColorMap[color]}`}
        />
      </div>
    </label>
  );
}
