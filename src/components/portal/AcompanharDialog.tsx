import { useState, useEffect, useCallback } from "react";
import {
  X,
  Eye,
  Loader2,
  LogIn,
  ShieldCheck,
  User,
  ChevronRight,
  Pencil,
  Trash2,
  FileText,
  Users,
  LayoutList,
  Info,
  MapPin,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";

/* ══════════════════════════════════════════════════════
   TIPOS
══════════════════════════════════════════════════════ */

const AREAS = [
  "Templo Central",
  ...Array.from({ length: 33 }, (_, i) => `Área ${String(i + 1).padStart(2, "0")}`),
];

type SessionType = "supervisor" | "lider" | null;

type GMRow = {
  id: string;
  nome: string;
  lider: string;
  cpf_lider: string | null;
  whatsapp_lider: string | null;
  email_lider: string | null;
  congregacao_nome: string | null;
  area_nome: string | null;
  faixa_etaria: string | null;
  endereco: string | null;
  data_fundacao: string | null;
};

type RelatorioRow = {
  id: number;
  data_gm: string;
  nome_gm: string;
  congregacao: string;
  nome_lider: string;
  qtd_membros: number;
  visitantes_cristaos: number;
  visitantes_nao_cristaos: number;
  decisao: number;
  reconciliacao: number;
  created_at: string;
};

type SupervisorInfo = { nome_supervisor: string; area_nome: string };
type LiderInfo = GMRow;

/* ══════════════════════════════════════════════════════
   CONFIRM DELETE MODAL (reutilizavel)
══════════════════════════════════════════════════════ */

function ConfirmDeleteModal({
  title,
  description,
  loading,
  onConfirm,
  onCancel,
}: {
  title: string;
  description: React.ReactNode;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/55" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-card p-6 shadow-2xl border border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h3 className="font-black text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground">Esta ação não pode ser desfeita</p>
          </div>
        </div>
        <div className="text-sm text-muted-foreground mb-5">{description}</div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-10 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-surface-muted transition"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 h-10 rounded-xl bg-destructive text-sm font-bold text-white hover:brightness-110 transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   PROPS
══════════════════════════════════════════════════════ */

type AcompanharDialogProps = {
  open: boolean;
  onClose: () => void;
};

/* ══════════════════════════════════════════════════════
   COMPONENTE RAIZ
══════════════════════════════════════════════════════ */

export function AcompanharDialog({ open, onClose }: AcompanharDialogProps) {
  const [session, setSession] = useState<SessionType>(null);
  const [supervisorInfo, setSupervisorInfo] = useState<SupervisorInfo | null>(null);
  const [liderInfo, setLiderInfo] = useState<LiderInfo | null>(null);

  function handleLogout() {
    setSession(null);
    setSupervisorInfo(null);
    setLiderInfo(null);
  }

  function handleClose() {
    handleLogout();
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-3 sm:items-center sm:p-4">
      <div className="fixed inset-0 bg-black/80" onClick={handleClose} />

      <div className="relative z-10 my-4 flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-card shadow-2xl ring-1 ring-black/5">
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-5 py-4 sm:px-8 sm:py-5"
          style={{ background: "var(--gradient-banner)" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-gold-deep/30 bg-white/70 shadow backdrop-blur-sm sm:h-11 sm:w-11">
              <Eye className="h-5 w-5 text-gold-deep" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-gold-deep sm:text-xl">
                Acompanhar Grupos Missionários
              </h2>
              <p className="text-[10px] font-semibold tracking-widest text-gold-deep/60 uppercase">
                {session === null
                  ? "Identificação necessária"
                  : session === "supervisor"
                  ? `Supervisor · ${supervisorInfo?.area_nome}`
                  : `Líder · ${liderInfo?.nome}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {session !== null && (
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-lg border border-gold-deep/30 bg-white/20 px-3 py-1.5 text-[11px] font-bold text-gold-deep transition hover:bg-white/30"
              >
                <LogIn className="h-3 w-3" />
                Sair
              </button>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-deep/10 text-gold-deep transition hover:bg-gold-deep/25"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ── Conteúdo dinâmico ── */}
        <div className="flex-1 overflow-y-auto">
          {session === null && (
            <LoginScreen
              onLoginSupervisor={(info) => {
                setSupervisorInfo(info);
                setSession("supervisor");
              }}
              onLoginLider={(gm) => {
                setLiderInfo(gm);
                setSession("lider");
              }}
            />
          )}
          {session === "supervisor" && supervisorInfo && (
            <SupervisorPanel area={supervisorInfo.area_nome} />
          )}
          {session === "lider" && liderInfo && (
            <LiderPanel gm={liderInfo} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   TELA 1 — LOGIN
══════════════════════════════════════════════════════ */

function LoginScreen({
  onLoginSupervisor,
  onLoginLider,
}: {
  onLoginSupervisor: (info: SupervisorInfo) => void;
  onLoginLider: (gm: LiderInfo) => void;
}) {
  const [area, setArea] = useState("");
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!area || !codigo.trim()) return;
    setLoading(true);
    setError("");

    try {
      const { data: sup } = await supabase
        .from("supervisores")
        .select("nome_supervisor, area_nome")
        .eq("area_nome", area)
        .eq("codigo_acesso", codigo.trim())
        .maybeSingle();

      if (sup) { onLoginSupervisor(sup); return; }

      const cpfLimpo = codigo.replace(/\D/g, "");
      const { data: gm } = await supabase
        .from("grupos_missionarios")
        .select("*")
        .eq("area_nome", area)
        .eq("cpf_lider", cpfLimpo)
        .maybeSingle();

      if (gm) { onLoginLider(gm as LiderInfo); return; }

      setError("Código inválido para a área selecionada. Verifique e tente novamente.");
    } catch {
      setError("Erro ao verificar o código. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 px-5 py-8 sm:px-12 sm:py-10">
      <div className="flex items-start gap-3 rounded-xl border border-action-blue-strong/20 bg-action-blue-strong/5 px-4 py-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-action-blue-strong" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Supervisores:</strong> use o código de acesso da sua área.
          <br />
          <strong className="text-foreground">Líderes:</strong> use o seu CPF (apenas números) como código.
        </p>
      </div>

      <label className="flex flex-col gap-2">
        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 text-action-blue-strong" />
          Selecione a Área <span className="text-red-400">*</span>
        </span>
        <div className="relative">
          <select
            required
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="h-12 w-full appearance-none rounded-xl border border-border/80 bg-surface px-4 pr-10 text-sm text-foreground outline-none transition focus:border-action-blue-strong focus:ring-2 focus:ring-action-blue-strong/20"
          >
            <option value="" disabled>Selecione a área…</option>
            {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <ChevronRight className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-muted-foreground" />
        </div>
      </label>

      <label className="flex flex-col gap-2">
        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-action-blue-strong" />
          Código de Acesso <span className="text-red-400">*</span>
        </span>
        <input
          required
          type="text"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          placeholder="Código do supervisor ou CPF do líder"
          autoComplete="off"
          className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-base text-slate-900 outline-none focus:border-blue-500"
        />
      </label>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex h-14 items-center justify-center gap-2 rounded-xl bg-blue-600 text-lg font-bold text-white shadow-md transition hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Acessar Painel"}
        </button>
      </div>
    </form>
  );
}

/* ══════════════════════════════════════════════════════
   TELA 2A — PAINEL DO SUPERVISOR
══════════════════════════════════════════════════════ */

function SupervisorPanel({ area }: { area: string }) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"gms" | "relatorios">("gms");
  const [gms, setGms] = useState<GMRow[]>([]);
  const [relatorios, setRelatorios] = useState<RelatorioRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGM, setEditingGM] = useState<GMRow | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  // ── confirm states ──
  const [confirmDeleteGM, setConfirmDeleteGM] = useState<GMRow | null>(null);
  const [deletingGMId, setDeletingGMId] = useState<string | null>(null);
  const [confirmDeleteRel, setConfirmDeleteRel] = useState<RelatorioRow | null>(null);
  const [deletingRelId, setDeletingRelId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [gmsRes, relRes] = await Promise.all([
      supabase.from("grupos_missionarios").select("*").eq("area_nome", area).order("nome"),
      supabase.from("relatorios_semanais").select("*").eq("area_nome", area).order("data_gm", { ascending: false }).limit(300),
    ]);
    if (gmsRes.data) setGms(gmsRes.data as GMRow[]);
    if (relRes.data) setRelatorios(relRes.data as RelatorioRow[]);
    setLoading(false);
  }, [area]);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleDeleteGM(gm: GMRow) {
    setDeletingGMId(gm.id);
    const { error } = await supabase.from("grupos_missionarios").delete().eq("id", gm.id);
    if (!error) {
      setGms((p) => p.filter((g) => g.id !== gm.id));
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["top-areas"] });
      queryClient.invalidateQueries({ queryKey: ["top10"] });
      flash(`"${gm.nome}" excluído com sucesso.`);
    }
    setDeletingGMId(null);
    setConfirmDeleteGM(null);
  }

  async function handleDeleteRelatorio(r: RelatorioRow) {
    setDeletingRelId(r.id);
    const { error } = await supabase.from("relatorios_semanais").delete().eq("id", r.id);
    if (!error) {
      setRelatorios((p) => p.filter((x) => x.id !== r.id));
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      flash(`Relatório #${r.id} excluído com sucesso.`);
    }
    setDeletingRelId(null);
    setConfirmDeleteRel(null);
  }

  function flash(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  }

  if (editingGM) {
    return (
      <EditGMPanel
        gm={editingGM}
        onSave={() => { setEditingGM(null); loadData(); }}
        onCancel={() => setEditingGM(null)}
      />
    );
  }

  return (
    <div className="flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-border/60 bg-surface/40 px-5 sm:px-8">
        {(["gms", "relatorios"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex items-center gap-2 border-b-2 px-4 py-3.5 text-xs font-bold uppercase tracking-wider transition ${
              tab === t
                ? "border-action-blue-strong text-action-blue-strong"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "gms" ? <Users className="h-3.5 w-3.5" /> : <LayoutList className="h-3.5 w-3.5" />}
            {t === "gms" ? `Grupos (${gms.length})` : `Relatórios (${relatorios.length})`}
          </button>
        ))}
      </div>

      {successMsg && (
        <div className="mx-5 mt-4 rounded-xl border border-action-green/30 bg-action-green/10 px-4 py-2.5 text-center text-sm font-semibold text-action-green sm:mx-8">
          {successMsg}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-3 py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Carregando dados da {area}…
        </div>
      ) : tab === "gms" ? (
        <GMsTab gms={gms} onEdit={setEditingGM} onDelete={setConfirmDeleteGM} />
      ) : (
        <RelatoriosTab
          relatorios={relatorios}
          showGMName
          onDelete={setConfirmDeleteRel}
        />
      )}

      {/* Confirm excluir GM */}
      {confirmDeleteGM && (
        <ConfirmDeleteModal
          title="Excluir Grupo Missionário"
          description={
            <>
              Deseja realmente excluir o GM{" "}
              <strong className="text-foreground">"{confirmDeleteGM.nome}"</strong>?
              Todos os relatórios associados serão desvinculados.
            </>
          }
          loading={deletingGMId === confirmDeleteGM.id}
          onConfirm={() => handleDeleteGM(confirmDeleteGM)}
          onCancel={() => setConfirmDeleteGM(null)}
        />
      )}

      {/* Confirm excluir relatório */}
      {confirmDeleteRel && (
        <ConfirmDeleteModal
          title="Excluir Relatório"
          description={
            <>
              Deseja realmente excluir o{" "}
              <strong className="text-foreground">Relatório #{confirmDeleteRel.id}</strong>{" "}
              de <strong className="text-foreground">{confirmDeleteRel.nome_gm}</strong>{" "}
              referente ao dia{" "}
              <strong className="text-foreground">
                {new Date(confirmDeleteRel.data_gm + "T12:00:00").toLocaleDateString("pt-BR")}
              </strong>?
            </>
          }
          loading={deletingRelId === confirmDeleteRel.id}
          onConfirm={() => handleDeleteRelatorio(confirmDeleteRel)}
          onCancel={() => setConfirmDeleteRel(null)}
        />
      )}
    </div>
  );
}

function GMsTab({
  gms,
  onEdit,
  onDelete,
}: {
  gms: GMRow[];
  onEdit: (g: GMRow) => void;
  onDelete: (g: GMRow) => void;
}) {
  if (gms.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
        <Users className="h-10 w-10 opacity-20" />
        <p className="text-sm">Nenhum GM cadastrado nesta área.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto px-5 py-4 sm:px-8">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-border/60">
            {["Nome do GM", "Líder", "Congregação", "Faixa Etária", "Ações"].map((h) => (
              <th key={h} className="pb-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2 first:pl-0">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {gms.map((gm) => (
            <tr key={gm.id} className="border-b border-border/30 hover:bg-surface/50 transition-colors">
              <td className="py-3 px-2 first:pl-0 font-semibold text-foreground">{gm.nome}</td>
              <td className="py-3 px-2 text-muted-foreground">{gm.lider}</td>
              <td className="py-3 px-2 text-muted-foreground">{gm.congregacao_nome ?? "—"}</td>
              <td className="py-3 px-2">
                {gm.faixa_etaria ? (
                  <span className="rounded-full bg-action-blue-strong/10 px-2.5 py-0.5 text-xs font-bold text-action-blue-strong">
                    {gm.faixa_etaria}
                  </span>
                ) : "—"}
              </td>
              <td className="py-3 px-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(gm)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-action-blue-strong/10 text-action-blue-strong transition hover:bg-action-blue-strong/20"
                    title="Editar GM"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(gm)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive transition hover:bg-destructive/20"
                    title="Excluir GM"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RelatoriosTab({
  relatorios,
  showGMName = false,
  onDelete,
}: {
  relatorios: RelatorioRow[];
  showGMName?: boolean;
  onDelete?: (r: RelatorioRow) => void;
}) {
  if (relatorios.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
        <FileText className="h-10 w-10 opacity-20" />
        <p className="text-sm">Nenhum relatório enviado.</p>
      </div>
    );
  }

  const headers = ["#", "Data", ...(showGMName ? ["GM"] : []), "Membros", "Vis. Cristãos", "Vis. Não Cristãos", "Decisões", "Reconcil.", ""];

  return (
    <div className="overflow-x-auto px-5 py-4 sm:px-8">
      <table className="w-full min-w-[680px] text-sm">
        <thead>
          <tr className="border-b border-border/60">
            {headers.map((h) => (
              <th key={h} className="pb-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2 first:pl-0">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {relatorios.map((r) => (
            <tr key={r.id} className="border-b border-border/30 hover:bg-surface/50 transition-colors">
              <td className="py-3 px-2 first:pl-0 font-mono text-xs text-muted-foreground">#{r.id}</td>
              <td className="py-3 px-2 text-muted-foreground whitespace-nowrap">
                {new Date(r.data_gm + "T12:00:00").toLocaleDateString("pt-BR")}
              </td>
              {showGMName && (
                <td className="py-3 px-2 font-semibold text-foreground">{r.nome_gm}</td>
              )}
              <Num value={r.qtd_membros} color="blue" />
              <Num value={r.visitantes_cristaos} color="teal" />
              <Num value={r.visitantes_nao_cristaos} color="purple" />
              <Num value={r.decisao} color="gold" />
              <Num value={r.reconciliacao} color="rose" />
              <td className="py-3 px-2">
                {onDelete && (
                  <button
                    onClick={() => onDelete(r)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-destructive/10 text-destructive transition hover:bg-destructive/20"
                    title="Excluir relatório"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   TELA EDITAR GM (dentro do painel supervisor)
══════════════════════════════════════════════════════ */

const FAIXAS = ["Kids", "Teen", "Jovem", "Adulto", "Misto"];
const ALL_AREAS = ["Templo Central", ...Array.from({ length: 33 }, (_, i) => `Área ${String(i + 1).padStart(2, "0")}`)];

function formatCPF(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0,3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`;
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
}

function formatPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 7) return `(${d.slice(0,2)}) ${d.slice(2)}`;
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
}

function EditGMPanel({ gm, onSave, onCancel }: { gm: GMRow; onSave: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    nome: gm.nome, lider: gm.lider,
    cpf_lider: formatCPF(gm.cpf_lider ?? ""),
    email_lider: gm.email_lider ?? "",
    whatsapp_lider: formatPhone(gm.whatsapp_lider ?? ""),
    faixa_etaria: gm.faixa_etaria ?? "",
    area_nome: gm.area_nome ?? "",
    congregacao_nome: gm.congregacao_nome ?? "",
    endereco: gm.endereco ?? "",
    data_fundacao: gm.data_fundacao ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    if (name === "cpf_lider") { setForm(p => ({ ...p, cpf_lider: formatCPF(value) })); return; }
    if (name === "whatsapp_lider") { setForm(p => ({ ...p, whatsapp_lider: formatPhone(value) })); return; }
    setForm(p => ({ ...p, [name]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const { error: err } = await supabase
      .from("grupos_missionarios")
      .update({
        nome: form.nome, lider: form.lider,
        cpf_lider: form.cpf_lider.replace(/\D/g, ""),
        email_lider: form.email_lider,
        whatsapp_lider: form.whatsapp_lider.replace(/\D/g, ""),
        faixa_etaria: form.faixa_etaria,
        area_nome: form.area_nome,
        congregacao_nome: form.congregacao_nome,
        endereco: form.endereco,
        data_fundacao: form.data_fundacao || null,
      })
      .eq("id", gm.id);

    if (err) { setError("Erro ao salvar: " + err.message); setSaving(false); return; }
    onSave();
  }

  const inp = "h-10 w-full rounded-lg border border-border/80 bg-surface px-3 text-sm text-foreground outline-none transition focus:border-action-blue-strong focus:ring-2 focus:ring-action-blue-strong/20";
  const sel = inp + " appearance-none pr-8";
  const lbl = "text-[11px] font-bold uppercase tracking-wider text-muted-foreground";

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-5 px-5 py-6 sm:px-8">
      <div className="flex items-center gap-2">
        <button type="button" onClick={onCancel} className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition">
          ← Voltar
        </button>
        <span className="text-muted-foreground/40">|</span>
        <span className="text-sm font-bold text-foreground">Editando: {gm.nome}</span>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm font-semibold text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5"><span className={lbl}>Nome do GM *</span><input required name="nome" value={form.nome} onChange={handleChange} className={inp} /></label>
        <label className="flex flex-col gap-1.5"><span className={lbl}>Nome do Líder *</span><input required name="lider" value={form.lider} onChange={handleChange} className={inp} /></label>
        <label className="flex flex-col gap-1.5"><span className={lbl}>CPF do Líder</span><input name="cpf_lider" value={form.cpf_lider} onChange={handleChange} placeholder="000.000.000-00" className={inp} /></label>
        <label className="flex flex-col gap-1.5"><span className={lbl}>WhatsApp</span><input name="whatsapp_lider" value={form.whatsapp_lider} onChange={handleChange} placeholder="(00) 00000-0000" className={inp} /></label>
        <label className="flex flex-col gap-1.5"><span className={lbl}>E-mail</span><input type="email" name="email_lider" value={form.email_lider} onChange={handleChange} placeholder="email@exemplo.com" className={inp} /></label>
        <label className="flex flex-col gap-1.5">
          <span className={lbl}>Faixa Etária</span>
          <select name="faixa_etaria" value={form.faixa_etaria} onChange={handleChange} className={sel}>
            <option value="">Selecione…</option>
            {FAIXAS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={lbl}>Área</span>
          <select name="area_nome" value={form.area_nome} onChange={handleChange} className={sel}>
            <option value="">Selecione…</option>
            {ALL_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1.5"><span className={lbl}>Congregação</span><input name="congregacao_nome" value={form.congregacao_nome} onChange={handleChange} className={inp} /></label>
        <label className="flex flex-col gap-1.5 sm:col-span-2"><span className={lbl}>Endereço</span><input name="endereco" value={form.endereco} onChange={handleChange} className={inp} /></label>
        <label className="flex flex-col gap-1.5"><span className={lbl}>Data de Fundação</span><input type="date" name="data_fundacao" value={form.data_fundacao} onChange={handleChange} className={inp} /></label>
      </div>

      <div className="flex gap-3 border-t border-border/50 pt-4">
        <button type="button" onClick={onCancel} className="flex-1 h-11 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-surface-muted transition">
          Cancelar
        </button>
        <button type="submit" disabled={saving} className="flex-1 h-11 rounded-xl bg-action-blue-strong text-sm font-bold text-action-foreground shadow-md hover:brightness-110 transition disabled:opacity-60 flex items-center justify-center gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
          {saving ? "Salvando…" : "Salvar Alterações"}
        </button>
      </div>
    </form>
  );
}

/* ══════════════════════════════════════════════════════
   TELA 2B — PAINEL DO LÍDER
══════════════════════════════════════════════════════ */

function LiderPanel({ gm }: { gm: LiderInfo }) {
  const queryClient = useQueryClient();
  const [relatorios, setRelatorios] = useState<RelatorioRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteRel, setConfirmDeleteRel] = useState<RelatorioRow | null>(null);
  const [deletingRelId, setDeletingRelId] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  function loadRelatorios() {
    supabase
      .from("relatorios_semanais")
      .select("*")
      .eq("gm_id", gm.id)
      .order("data_gm", { ascending: false })
      .limit(100)
      .then(({ data }) => {
        if (data) setRelatorios(data as RelatorioRow[]);
        setLoading(false);
      });
  }

  useEffect(() => { loadRelatorios(); }, [gm.id]);

  async function handleDeleteRelatorio(r: RelatorioRow) {
    setDeletingRelId(r.id);
    const { error } = await supabase.from("relatorios_semanais").delete().eq("id", r.id);
    if (!error) {
      setRelatorios((p) => p.filter((x) => x.id !== r.id));
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      setSuccessMsg(`Relatório #${r.id} excluído com sucesso.`);
      setTimeout(() => setSuccessMsg(""), 4000);
    }
    setDeletingRelId(null);
    setConfirmDeleteRel(null);
  }

  return (
    <div className="flex flex-col gap-0">
      {/* Card do GM */}
      <div className="border-b border-border/50 px-5 py-5 sm:px-8">
        <div className="flex items-center gap-2 mb-4">
          <User className="h-4 w-4 text-action-blue-strong" />
          <span className="text-xs font-bold uppercase tracking-wider text-action-blue-strong">Dados do Grupo Missionário</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            { label: "Nome do GM", value: gm.nome },
            { label: "Líder", value: gm.lider },
            { label: "Congregação", value: gm.congregacao_nome ?? "—" },
            { label: "Área", value: gm.area_nome ?? "—" },
            { label: "Faixa Etária", value: gm.faixa_etaria ?? "—" },
            { label: "Endereço", value: gm.endereco ?? "—" },
            { label: "Data de Fundação", value: gm.data_fundacao ? new Date(gm.data_fundacao + "T12:00:00").toLocaleDateString("pt-BR") : "—" },
            { label: "E-mail", value: gm.email_lider ?? "—" },
          ].map((item) => (
            <div key={item.label} className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">{item.label}</span>
              <span className="text-sm font-semibold text-foreground break-all">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Relatórios */}
      <div className="px-5 py-5 sm:px-8">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-4 w-4 text-action-blue-strong" />
          <span className="text-xs font-bold uppercase tracking-wider text-action-blue-strong">
            Relatórios Enviados ({relatorios.length})
          </span>
        </div>

        {successMsg && (
          <div className="mb-3 rounded-xl border border-action-green/30 bg-action-green/10 px-4 py-2.5 text-center text-sm font-semibold text-action-green">
            {successMsg}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-10 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" /> Carregando relatórios…
          </div>
        ) : (
          <RelatoriosTab
            relatorios={relatorios}
            showGMName={false}
            onDelete={setConfirmDeleteRel}
          />
        )}
      </div>

      {/* Confirm excluir relatório */}
      {confirmDeleteRel && (
        <ConfirmDeleteModal
          title="Excluir Relatório"
          description={
            <>
              Deseja realmente excluir o{" "}
              <strong className="text-foreground">Relatório #{confirmDeleteRel.id}</strong>{" "}
              referente ao dia{" "}
              <strong className="text-foreground">
                {new Date(confirmDeleteRel.data_gm + "T12:00:00").toLocaleDateString("pt-BR")}
              </strong>?
            </>
          }
          loading={deletingRelId === confirmDeleteRel.id}
          onConfirm={() => handleDeleteRelatorio(confirmDeleteRel)}
          onCancel={() => setConfirmDeleteRel(null)}
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   HELPER: Célula numérica colorida
══════════════════════════════════════════════════════ */

const numColors: Record<string, string> = {
  blue:   "text-blue-600 bg-blue-50",
  teal:   "text-teal-600 bg-teal-50",
  purple: "text-purple-600 bg-purple-50",
  gold:   "text-yellow-600 bg-yellow-50",
  rose:   "text-rose-600 bg-rose-50",
};

function Num({ value, color }: { value: number; color: string }) {
  return (
    <td className="py-3 px-2">
      <span className={`inline-block min-w-[32px] rounded-md px-2 py-0.5 text-center text-xs font-black ${numColors[color]}`}>
        {value}
      </span>
    </td>
  );
}

