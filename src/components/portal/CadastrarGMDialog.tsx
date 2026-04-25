import { useState } from "react";
import { X, UserPlus, Loader2, Eraser } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { isValidCPF } from "@/lib/validations";
import { useDomain } from "@/hooks/useDomain";
type FormData = {
  nome_lider: string;
  cpf_lider: string;
  email_lider: string;
  whatsapp_lider: string;
  nome_gm: string;
  faixa_etaria: string;
  area_nome: string;
  congregacao_nome: string;
  endereco: string;
  data_fundacao: string;
};

const INITIAL_FORM: FormData = {
  nome_lider: "",
  cpf_lider: "",
  email_lider: "",
  whatsapp_lider: "",
  nome_gm: "",
  faixa_etaria: "",
  area_nome: "",
  congregacao_nome: "",
  endereco: "",
  data_fundacao: "",
};

const FAIXAS_ETARIAS = ["Kids", "Teen", "Jovem", "Adulto", "Misto"];

function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9)
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 7)
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

import { useQueryClient } from "@tanstack/react-query";

type CadastrarGMDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function CadastrarGMDialog({ open, onClose }: CadastrarGMDialogProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { areas, congregacoes } = useDomain();
  
  const areaOptions = areas.map(a => a.nome);
  
  const selectedAreaObj = areas.find(a => a.nome === form.area_nome);
  const congregacaoOptions = selectedAreaObj 
    ? congregacoes.filter(c => c.area_id === selectedAreaObj.id).map(c => c.nome)
    : [];

  if (!open) return null;

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;

    if (name === "cpf_lider") {
      setForm((prev) => ({ ...prev, [name]: formatCPF(value) }));
      return;
    }
    if (name === "whatsapp_lider") {
      setForm((prev) => ({ ...prev, [name]: formatPhone(value) }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleClear() {
    setForm(INITIAL_FORM);
    setSuccessMessage("");
    setErrorMessage("");
  }

  function handleClose() {
    setForm(INITIAL_FORM);
    setSuccessMessage("");
    setErrorMessage("");
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    const cpfNumeros = form.cpf_lider.replace(/\D/g, "");

    if (!isValidCPF(cpfNumeros)) {
      setErrorMessage("Erro: O CPF informado é inválido. Por favor, confira os números.");
      setIsSubmitting(false);
      return;
    }

    let wClean = form.whatsapp_lider.replace(/\D/g, "");
    if (wClean.length <= 9 && wClean.length > 0) wClean = `91${wClean.length === 8 ? '9' : ''}${wClean}`;
    else if (wClean.length === 10 && wClean.startsWith("91")) wClean = `919${wClean.slice(2)}`;

    try {
      const { error } = await supabase.from("grupos_missionarios").insert({
        nome: form.nome_gm,
        lider: form.nome_lider,
        cpf_lider: cpfNumeros,
        email_lider: form.email_lider,
        whatsapp_lider: wClean,
        faixa_etaria: form.faixa_etaria,
        area_nome: form.area_nome,
        congregacao_nome: form.congregacao_nome,
        endereco: form.endereco,
        data_fundacao: form.data_fundacao || null,
      });

      if (error) {
        if (error.code === '23505') {
          throw new Error("Este líder (CPF) já está associado a outro Grupo Missionário.");
        }
        throw error;
      }

      setSuccessMessage("✅ Grupo Missionário cadastrado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["top-areas"] });
      queryClient.invalidateQueries({ queryKey: ["top10"] });
      setForm(INITIAL_FORM);
    } catch (err: any) {
      setErrorMessage("Erro ao cadastrar: " + (err?.message ?? "Erro desconhecido"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="relative z-10 flex max-h-[95vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div
          className="relative flex items-center justify-between px-5 py-4 sm:px-8 sm:py-6"
          style={{ background: "var(--gradient-banner)" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border-2 border-gold-deep/30 bg-white/70 shadow-md backdrop-blur-sm">
              <UserPlus className="h-5 w-5 sm:h-6 sm:w-6 text-gold-deep" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-black tracking-tight text-gold-deep">
                Cadastro de Grupo Missionário
              </h2>
              <p className="text-[10px] sm:text-xs font-medium tracking-wider text-gold-deep/60 uppercase">
                Preencha todos os campos
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-gold-deep/10 text-gold-deep transition-colors hover:bg-gold-deep/20"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Success / Error messages */}
        {successMessage && (
          <div className="mx-5 sm:mx-8 mt-4 rounded-xl bg-action-green/10 border border-action-green/30 px-4 py-3 text-sm font-semibold text-action-green text-center">
            {successMessage}
          </div>
        )}
        
        {errorMessage && (
           <div className="mx-5 sm:mx-8 mt-4 rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm font-semibold text-destructive text-center">
             {errorMessage}
           </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-4 sm:px-8 sm:py-6"
        >
          {/* Dados do líder */}
          <fieldset className="space-y-3">
            <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-action-blue-strong">
              Dados do Líder
            </legend>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InputField
                label="Nome do Líder"
                name="nome_lider"
                value={form.nome_lider}
                onChange={handleChange}
                placeholder="Nome completo"
              />
              <InputField
                label="CPF do Líder"
                name="cpf_lider"
                value={form.cpf_lider}
                onChange={handleChange}
                placeholder="000.000.000-00"
                inputMode="numeric"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InputField
                label="E-mail do Líder"
                name="email_lider"
                type="email"
                value={form.email_lider}
                onChange={handleChange}
                placeholder="email@exemplo.com"
              />
              <InputField
                label="WhatsApp do Líder"
                name="whatsapp_lider"
                value={form.whatsapp_lider}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
                inputMode="tel"
              />
            </div>
          </fieldset>

          <div className="h-px bg-border/60" />

          {/* Dados do GM */}
          <fieldset className="space-y-3">
            <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-action-blue-strong">
              Dados do Grupo Missionário
            </legend>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InputField
                label="Nome do GM"
                name="nome_gm"
                value={form.nome_gm}
                onChange={handleChange}
                placeholder="Ex: Herdeiros de Cristo"
              />
              <SelectField
                label="Faixa Etária do GM"
                name="faixa_etaria"
                value={form.faixa_etaria}
                onChange={handleChange}
                options={FAIXAS_ETARIAS}
                placeholder="Selecione a faixa etária"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <SelectField
                label="Área"
                name="area_nome"
                value={form.area_nome}
                onChange={handleChange}
                options={areaOptions}
                placeholder="Selecione a área"
              />
              {/* Se a área selecionada não possuir congregações no DB, ou usaremos a lista filtrada */}
              <SelectField
                label="Congregação"
                name="congregacao_nome"
                value={form.congregacao_nome}
                onChange={handleChange}
                options={congregacaoOptions.length > 0 ? congregacaoOptions : (form.area_nome ? ["Nenhuma congregação cadastrada"] : [])}
                placeholder="Selecione a congregação"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InputField
                label="Endereço do GM"
                name="endereco"
                value={form.endereco}
                onChange={handleChange}
                placeholder="Rua, número, bairro"
              />
              <InputField
                label="Data de Fundação do GM"
                name="data_fundacao"
                type="date"
                value={form.data_fundacao}
                onChange={handleChange}
              />
            </div>
          </fieldset>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-border/60 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClear}
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-border/80 bg-card px-6 text-sm font-semibold text-muted-foreground transition-colors hover:bg-surface-muted"
            >
              <Eraser className="h-4 w-4" />
              Limpar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-action-green px-8 text-sm font-bold text-action-foreground shadow-md transition-all hover:brightness-110 disabled:opacity-60"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              {isSubmitting ? "Cadastrando..." : "Cadastrar GM"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Shared sub-components ────────────────────────────────── */

type InputFieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
};

function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
}: InputFieldProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-muted-foreground">
        {label} <span className="text-red-400">*</span>
      </span>
      <input
        required
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        inputMode={inputMode}
        className="h-10 rounded-lg border border-border/80 bg-surface px-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-all focus:border-action-blue-strong focus:ring-2 focus:ring-action-blue-strong/20"
      />
    </label>
  );
}

type SelectFieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  placeholder: string;
};

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
}: SelectFieldProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-muted-foreground">
        {label} <span className="text-red-400">*</span>
      </span>
      <select
        required
        name={name}
        value={value}
        onChange={onChange}
        className="h-10 appearance-none rounded-lg border border-border/80 bg-surface px-3 pr-8 text-sm text-foreground outline-none transition-all focus:border-action-blue-strong focus:ring-2 focus:ring-action-blue-strong/20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' viewBox='0 0 24 24' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 8px center",
        }}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}
