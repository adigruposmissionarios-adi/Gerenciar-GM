import { useState, useMemo, useEffect } from "react";
import { X, Printer, Search, ChevronLeft, ChevronRight, MessageCircle, Pencil, Trash2, Loader2, AlertTriangle, Layers } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { SETORES_MAP, SETORES_LIST } from "@/lib/setores";
import { QuickEditGMModal } from "./QuickEditGMModal";

/* ══════════════════════════════════════════════════════
   TIPOS
══════════════════════════════════════════════════════ */
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
  gm_id: string;
  nome_gm: string;
  congregacao: string;
  area_nome: string;
  nome_lider: string;
  whatsapp: string;
  visitantes_cristaos: number;
  visitantes_nao_cristaos: number;
  membros_presentes: number;
  decisao: number;
  reconciliacao: number;
};

type RelatorioSetorDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function RelatorioSetorDialog({ open, onClose }: RelatorioSetorDialogProps) {
  // Filters
  const [setor, setSetor] = useState<string>("Setor 1");
  const [area, setArea] = useState<string>("Todas");
  const [faixaEtaria, setFaixaEtaria] = useState<string>("Todas");
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");
  
  // Data State
  const [gms, setGms] = useState<GMRow[]>([]);
  const [relatorios, setRelatorios] = useState<RelatorioRow[]>([]);
  const [loading, setLoading] = useState(false);

  // Actions State
  const [editingGM, setEditingGM] = useState<GMRow | null>(null);
  const [deletingGM, setDeletingGM] = useState<GMRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Searches & Pagination
  const [searchGms, setSearchGms] = useState("");
  const [pageGms, setPageGms] = useState(1);
  const [limitGms, setLimitGms] = useState(10);

  const [searchRels, setSearchRels] = useState("");
  const [pageRels, setPageRels] = useState(1);
  const [limitRels, setLimitRels] = useState(10);

  const areasDoSetorSelecionado = useMemo(() => {
    if (!setor || setor === "Todos") return [];
    return SETORES_MAP[setor] || [];
  }, [setor]);

  // Se trocar o setor, resetar a área
  useEffect(() => {
    setArea("Todas");
  }, [setor]);

  // Buscar dados no banco
  async function loadData() {
    setLoading(true);
    try {
      let areasToFetch: string[] = [];
      if (setor && setor !== "Todos") {
        if (area && area !== "Todas") {
          areasToFetch = [area];
        } else {
          areasToFetch = SETORES_MAP[setor] || [];
        }
      }

      // 1) Fetch GMs
      let qGMs = supabase.from("grupos_missionarios").select("*").order("nome");
      if (areasToFetch.length > 0) {
        qGMs = qGMs.in("area_nome", areasToFetch);
      }
      if (faixaEtaria !== "Todas") {
        qGMs = qGMs.eq("faixa_etaria", faixaEtaria);
      }
      const { data: gData, error: e1 } = await qGMs;
      if (e1) throw e1;
      const fetchedGMs = (gData as GMRow[]) || [];
      setGms(fetchedGMs);

      // 2) Fetch Relatorios
      let qRels = supabase.from("relatorios_semanais").select("*").order("data_gm", { ascending: false });
      if (areasToFetch.length > 0) {
        qRels = qRels.in("area_nome", areasToFetch);
      }
      if (dataInicial) qRels = qRels.gte("data_gm", dataInicial);
      if (dataFinal) qRels = qRels.lte("data_gm", dataFinal);
      const { data: rData, error: e2 } = await qRels;
      if (e2) throw e2;
      
      let fetchedRels = (rData as RelatorioRow[]) || [];
      if (faixaEtaria !== "Todas") {
        const gmIds = fetchedGMs.map(g => g.id);
        fetchedRels = fetchedRels.filter(r => gmIds.includes(r.gm_id));
      }
      setRelatorios(fetchedRels);
      
      // Reseta a paginação ao fazer nova busca
      setPageGms(1);
      setPageRels(1);
    } catch (err) {
      console.error(err);
      alert("Erro ao buscar dados do setor.");
    } finally {
      setLoading(false);
    }
  }

  // Effect de load inicial
  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  // Handle Deletion
  async function handleDeleteConfirm() {
    if (!deletingGM) return;
    setIsDeleting(true);
    const { error } = await supabase.from("grupos_missionarios").delete().eq("id", deletingGM.id);
    setIsDeleting(false);
    if (error) {
      alert("Erro ao excluir GM.");
    } else {
      setDeletingGM(null);
      loadData();
    }
  }

  // ── Filtragem Local ──
  const filteredGms = useMemo(() => {
    if (!searchGms) return gms;
    const lower = searchGms.toLowerCase();
    return gms.filter((g) => 
      g.nome?.toLowerCase().includes(lower) || 
      g.lider?.toLowerCase().includes(lower) ||
      g.area_nome?.toLowerCase().includes(lower) ||
      g.congregacao_nome?.toLowerCase().includes(lower)
    );
  }, [gms, searchGms]);

  const filteredRels = useMemo(() => {
    if (!searchRels) return relatorios;
    const lower = searchRels.toLowerCase();
    return relatorios.filter((r) => 
      r.nome_gm?.toLowerCase().includes(lower) || 
      r.nome_lider?.toLowerCase().includes(lower) ||
      r.area_nome?.toLowerCase().includes(lower) ||
      r.congregacao?.toLowerCase().includes(lower) ||
      String(r.id).includes(lower)
    );
  }, [relatorios, searchRels]);

  // ── Paginação GMs ──
  const totalGmsPages = Math.ceil(filteredGms.length / limitGms) || 1;
  const currentGmsPageData = filteredGms.slice((pageGms - 1) * limitGms, pageGms * limitGms);

  // ── Paginação Relatórios ──
  const totalRelsPages = Math.ceil(filteredRels.length / limitRels) || 1;
  const currentRelsPageData = filteredRels.slice((pageRels - 1) * limitRels, pageRels * limitRels);

  // ── CSV Export ──
  function exportCSV(filename: string, headers: string[], rows: any[][]) {
    const csvContent = [
      headers.join(";"),
      ...rows.map(e => e.join(";"))
    ].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function exportGmsCSV(scope: "all" | "page") {
    const list = scope === "all" ? filteredGms : currentGmsPageData;
    const headers = ["FAIXA ETÁRIA", "NOME DO LIDER", "NOME DO GM", "ÁREA", "CONGREGAÇÃO", "WHATSAPP"];
    const rows = list.map(g => [
      g.faixa_etaria || "-",
      g.lider, 
      g.nome, 
      g.area_nome, 
      g.congregacao_nome,
      g.whatsapp_lider || "-"
    ]);
    exportCSV(`gms_${scope}.csv`, headers, rows);
  }

  function exportRelsCSV(scope: "all" | "page") {
    const list = scope === "all" ? filteredRels : currentRelsPageData;
    const headers = ["ID", "Data do GM", "Faixa Etária", "Área", "Congregação", "Nome do GM", "Nome do Líder", "WhatsApp", "Qtd Membros", "Vis. Cristão", "Vis. Não Cristão", "Decisões", "Reconciliações"];
    const rows = list.map(r => {
      const parentFA = gms.find(g => g.id === r.gm_id)?.faixa_etaria || "N/A";
      return [
        r.id,
        r.data_gm,
        parentFA,
        r.area_nome,
        r.congregacao,
        r.nome_gm,
        r.nome_lider,
        r.whatsapp || "-",
        r.membros_presentes,
      r.visitantes_cristaos,
      r.visitantes_nao_cristaos,
      r.decisao,
      r.reconciliacao
      ];
    });
    exportCSV(`relatorios_${scope}.csv`, headers, rows);
  }

  // Totalizadores
  const ttlGms = gms.length;
  const ttlReunioes = relatorios.length;
  const ttlDecisoes = relatorios.reduce((acc, curr) => acc + (curr.decisao || 0), 0);
  const ttlReconciliacoes = relatorios.reduce((acc, curr) => acc + (curr.reconciliacao || 0), 0);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[100] flex flex-col bg-slate-200 print:bg-white overflow-hidden animate-in fade-in duration-200">
        
        {/* Delete Confirmation Modal Overlay */}
        {deletingGM && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full animate-in zoom-in-95 duration-200">
              <div className="flex justify-center mb-4 text-red-500">
                <AlertTriangle className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-bold text-center text-slate-800 mb-2">Excluir Grupo?</h3>
              <p className="text-sm text-center text-slate-600 mb-6">
                Tem certeza que deseja excluir o GM <strong>{deletingGM.nome}</strong>? Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeletingGM(null)} className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-colors">Cancelar</button>
                <button disabled={isDeleting} onClick={handleDeleteConfirm} className="flex-1 flex justify-center items-center px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50">
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Excluir"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">
        <div className="mx-auto w-full max-w-[1400px] rounded-2xl bg-white shadow-2xl overflow-hidden print:shadow-none print:w-full print:max-w-none print:rounded-none">
          
          {/* ─ HEADER ─ */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 sm:p-8 border-b border-slate-100 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 uppercase">
                RELATÓRIO POR SETOR
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-slate-600">Setor: {setor}</span>
                {setor !== "Todos" && (
                  <div className="inline-flex max-w-[60vw] flex-wrap gap-1 px-3 py-1 rounded bg-blue-100 text-blue-800 text-xs font-semibold">
                    {areasDoSetorSelecionado.join(", ")}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-2 print:hidden">
              <button 
                onClick={() => window.print()}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-700"
              >
                <Printer className="h-4 w-4" />
                Imprimir PDF
              </button>
              <button 
                onClick={onClose}
                className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
                Fechar
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8 bg-slate-50/50 print:bg-white">
            
            {/* ─ FILTERS ROW ─ */}
            <div className="flex flex-wrap items-end gap-3 print:hidden">
              <div className="flex flex-col gap-1 w-full sm:w-auto">
                <label className="text-xs font-bold text-slate-500">Setor</label>
                <select
                  value={setor}
                  onChange={(e) => setSetor(e.target.value)}
                  className="h-10 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 min-w-[130px] outline-none focus:border-blue-500"
                >
                  <option value="Todos">Todos os Setores</option>
                  {SETORES_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1 w-full sm:w-auto">
                <label className="text-xs font-bold text-slate-500">Área</label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  disabled={setor === "Todos"}
                  className="h-10 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 min-w-[130px] outline-none focus:border-blue-500 disabled:opacity-50"
                >
                  <option value="Todas">Todas as áreas</option>
                  {areasDoSetorSelecionado.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              
              <div className="flex flex-col gap-1 w-full sm:w-auto">
                <label className="text-xs font-bold text-slate-500">Faixa Etária</label>
                <select
                  value={faixaEtaria}
                  onChange={(e) => setFaixaEtaria(e.target.value)}
                  className="h-10 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 min-w-[130px] outline-none focus:border-blue-500"
                >
                  <option value="Todas">Todas as faixas</option>
                  {["Kids", "Teen", "Jovem", "Adulto", "Misto"].map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1 w-full sm:w-auto">
                <label className="text-xs font-bold text-slate-500">Data inicial</label>
                <input
                  type="date"
                  value={dataInicial}
                  onChange={(e) => setDataInicial(e.target.value)}
                  className="h-10 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex flex-col gap-1 w-full sm:w-auto">
                <label className="text-xs font-bold text-slate-500">Data final</label>
                <input
                  type="date"
                  value={dataFinal}
                  onChange={(e) => setDataFinal(e.target.value)}
                  className="h-10 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0 lg:ml-auto">
                <button
                  onClick={loadData}
                  disabled={loading}
                  className="flex h-10 items-center justify-center rounded-lg bg-green-600 px-6 font-bold text-white transition-colors hover:bg-green-700 disabled:opacity-70"
                >
                  {loading ? "..." : "Aplicar"}
                </button>
                <button
                  onClick={() => {
                    setSetor("Setor 1");
                    setArea("Todas");
                    setFaixaEtaria("Todas");
                    setDataInicial("");
                    setDataFinal("");
                  }}
                  className="flex h-10 items-center justify-center rounded-lg bg-red-500 px-6 font-bold text-white transition-colors hover:bg-red-600"
                >
                  Limpar
                </button>
              </div>
            </div>

            {/* ─ CARDS ─ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl bg-white p-5 border border-slate-100 shadow-sm flex flex-col justify-center">
                <p className="text-sm font-bold text-slate-500">GM's cadastrados no {area !== "Todas" ? "selecionado" : "setor"}</p>
                <div className="mt-2 text-4xl font-black text-slate-900">{loading ? "..." : ttlGms}</div>
              </div>
              <div className="rounded-xl bg-white p-5 border border-slate-100 shadow-sm flex flex-col justify-center">
                <p className="text-sm font-bold text-slate-500">Reuniões {(dataInicial || dataFinal) ? "(no período)" : "(total)"}</p>
                <div className="mt-2 text-4xl font-black text-slate-900">{loading ? "..." : ttlReunioes}</div>
              </div>
              <div className="rounded-xl bg-white p-5 border border-slate-100 shadow-sm flex flex-col justify-center">
                <p className="text-sm font-bold text-slate-500">Decisões</p>
                <div className="mt-2 text-4xl font-black text-slate-900">{loading ? "..." : ttlDecisoes}</div>
              </div>
              <div className="rounded-xl bg-white p-5 border border-slate-100 shadow-sm flex flex-col justify-center">
                <p className="text-sm font-bold text-slate-500">Reconciliações</p>
                <div className="mt-2 text-4xl font-black text-slate-900">{loading ? "..." : ttlReconciliacoes}</div>
              </div>
            </div>

            <hr className="border-slate-200 print:hidden" />

            {/* ─ RESUMO QUANTITATIVO POR ÁREA (Apenas se Setor selecionado) ─ */}
            {setor !== "Todos" && (
              <section className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Layers className="w-3 h-3 text-indigo-500" />
                  Distribuição de GMs por Área ({setor})
                </h3>
                <div className="flex flex-wrap gap-3">
                    {areasDoSetorSelecionado.sort().map(areaNome => {
                      const count = gms.filter(g => g.area_nome === areaNome).length;
                      return (
                        <div key={areaNome} className="flex items-center gap-3 bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-xl hover:bg-slate-100 transition-colors group">
                          <span className="text-xs font-black text-slate-500 uppercase tracking-tight group-hover:text-slate-900 transition-colors">{areaNome}</span>
                          <div className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg shadow-sm text-sm font-black text-indigo-600">
                            {count}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </section>
            )}

            {/* ─ GM's PERTENCENTES AO SETOR ─ */}

            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-lg font-black text-slate-800 uppercase">GM's pertencentes ao setor</h3>
                <div className="flex flex-wrap items-center gap-3 print:hidden">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Buscar GM's do setor..." 
                      value={searchGms}
                      onChange={(e) => setSearchGms(e.target.value)}
                      className="h-9 w-full sm:w-64 rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                  <button onClick={() => exportGmsCSV("all")} className="text-xs font-bold text-blue-600 border border-blue-200 rounded px-3 py-1.5 hover:bg-blue-50 transition-colors">
                    CSV (filtrado)
                  </button>
                  <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                    Itens por página
                    <select value={limitGms} onChange={(e) => setLimitGms(Number(e.target.value))} className="h-8 rounded border border-slate-200 px-2 outline-none">
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-700">
                    <thead className="bg-[#fcfcfc] border-b border-slate-200 uppercase text-xs font-bold text-slate-900">
                      <tr>
                        <th className="px-4 py-3">Nome do Líder</th>
                        <th className="px-4 py-3">Nome do GM</th>
                        <th className="px-4 py-3 text-center">Faixa Etária</th>
                        <th className="px-4 py-3">Área</th>
                        <th className="px-4 py-3">Congregação</th>
                        <th className="px-4 py-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentGmsPageData.length > 0 ? (
                        currentGmsPageData.map((g) => {
                          const wpLink = g.whatsapp_lider ? `https://wa.me/55${g.whatsapp_lider.replace(/\D/g, "")}` : null;
                          return (
                            <tr key={g.id} className="hover:bg-slate-50/50">
                              <td className="px-4 py-3 font-medium">{g.lider}</td>
                              <td className="px-4 py-3">{g.nome}</td>
                              <td className="px-4 py-3 text-center">
                                {g.faixa_etaria ? (
                                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full">{g.faixa_etaria}</span>
                                ) : (
                                  <span className="text-slate-400 text-xs">-</span>
                                )}
                              </td>
                              <td className="px-4 py-3">{g.area_nome || "-"}</td>
                              <td className="px-4 py-3">{g.congregacao_nome || "-"}</td>
                              <td className="px-4 py-3">
                                <div className="flex justify-end gap-2 print:hidden">
                                  {wpLink ? (
                                    <a href={wpLink} target="_blank" rel="noreferrer" title="Abrir WhatsApp" className="w-8 h-8 flex items-center justify-center rounded bg-green-100 text-green-600 hover:bg-green-200 transition-colors">
                                      <MessageCircle className="w-4 h-4" />
                                    </a>
                                  ) : (
                                    <div className="w-8 h-8 flex items-center justify-center rounded bg-slate-100 text-slate-300 pointer-events-none">
                                      <MessageCircle className="w-4 h-4" />
                                    </div>
                                  )}
                                  <button onClick={() => setEditingGM(g)} title="Editar" className="w-8 h-8 flex items-center justify-center rounded bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors">
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => setDeletingGM(g)} title="Excluir" className="w-8 h-8 flex items-center justify-center rounded bg-red-100 text-red-600 hover:bg-red-200 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">Nenhum cadatrado localizado.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {/* Footer Paginacao GMs */}
                <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 bg-slate-50 print:hidden">
                  <div className="text-sm text-slate-500">
                    Mostrando {filteredGms.length === 0 ? 0 : (pageGms - 1) * limitGms + 1}–{Math.min(pageGms * limitGms, filteredGms.length)} de {filteredGms.length}
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setPageGms(p => Math.max(1, p - 1))} disabled={pageGms === 1} className="flex items-center gap-1 rounded bg-slate-200 px-3 py-1 text-sm font-bold text-slate-600 hover:bg-slate-300 disabled:opacity-50">
                      <ChevronLeft className="h-4 w-4" /> Anterior
                    </button>
                    <span className="text-sm text-slate-600 font-medium">Página {pageGms} / {totalGmsPages}</span>
                    <button onClick={() => setPageGms(p => Math.min(totalGmsPages, p + 1))} disabled={pageGms === totalGmsPages} className="flex items-center gap-1 rounded bg-slate-900 px-3 py-1 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50">
                      Próxima <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* ─ RELATÓRIOS ENVIADOS ─ */}
            <section className="space-y-4 pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-lg font-black text-slate-800 uppercase">Relatórios enviados (filtrados)</h3>
                <div className="flex flex-wrap items-center gap-3 print:hidden">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Buscar relatórios..." 
                      value={searchRels}
                      onChange={(e) => setSearchRels(e.target.value)}
                      className="h-9 w-full sm:w-64 rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                  <button onClick={() => exportRelsCSV("all")} className="text-xs font-bold text-blue-600 border border-blue-200 rounded px-3 py-1.5 hover:bg-blue-50 transition-colors">
                    CSV (filtrado)
                  </button>
                  <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                    Itens por página
                    <select value={limitRels} onChange={(e) => setLimitRels(Number(e.target.value))} className="h-8 rounded border border-slate-200 px-2 outline-none">
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-700 whitespace-nowrap">
                    <thead className="bg-[#fcfcfc] border-b border-slate-200 uppercase text-[10px] sm:text-xs font-bold text-slate-900">
                      <tr>
                        <th className="px-4 py-3">ID</th>
                        <th className="px-4 py-3">Data do GM</th>
                        <th className="px-4 py-3 text-center">F. Etária</th>
                        <th className="px-4 py-3">Área</th>
                        <th className="px-4 py-3">Congregação</th>
                        <th className="px-4 py-3">Nome do GM</th>
                        <th className="px-4 py-3 max-w-[120px] truncate hidden xl:table-cell">Nome do Líder</th>
                        <th className="px-4 py-3">WhatsApp</th>
                        <th className="px-4 py-3 text-center">Membros</th>
                        <th className="px-4 py-3 text-center">Vis. C.</th>
                        <th className="px-4 py-3 text-center">Vis. N.C.</th>
                        <th className="px-4 py-3 text-center">Decisão</th>
                        <th className="px-4 py-3 text-center">Reconc.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentRelsPageData.length > 0 ? (
                        currentRelsPageData.map((r) => {
                          const matchingGM = gms.find(g => g.id === r.gm_id);
                          return (
                            <tr key={r.id} className="hover:bg-slate-50/50">
                              <td className="px-4 py-3 font-mono text-xs">{r.id}</td>
                              <td className="px-4 py-3 font-medium">
                                {r.data_gm.split("-").reverse().join("/")}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {matchingGM?.faixa_etaria ? (
                                  <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">{matchingGM.faixa_etaria}</span>
                                ) : "-"}
                              </td>
                              <td className="px-4 py-3">{r.area_nome || "-"}</td>
                              <td className="px-4 py-3 truncate max-w-[150px]">{r.congregacao || "-"}</td>
                              <td className="px-4 py-3 font-semibold">{r.nome_gm || "-"}</td>
                              <td className="px-4 py-3 truncate max-w-[120px] hidden xl:table-cell">{r.nome_lider || "-"}</td>
                              <td className="px-4 py-3">{r.whatsapp || "-"}</td>
                              <td className="px-4 py-3 text-center font-semibold text-blue-600">{r.membros_presentes || 0}</td>
                              <td className="px-4 py-3 text-center">{r.visitantes_cristaos || 0}</td>
                              <td className="px-4 py-3 text-center">{r.visitantes_nao_cristaos || 0}</td>
                              <td className="px-4 py-3 text-center font-bold text-green-600">{r.decisao || 0}</td>
                              <td className="px-4 py-3 text-center font-bold text-purple-600">{r.reconciliacao || 0}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr><td colSpan={12} className="px-4 py-6 text-center text-slate-400">Nenhum relatório localizado.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {/* Footer Paginacao Relatórios */}
                <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 bg-slate-50 print:hidden">
                  <div className="text-sm text-slate-500">
                    Mostrando {filteredRels.length === 0 ? 0 : (pageRels - 1) * limitRels + 1}–{Math.min(pageRels * limitRels, filteredRels.length)} de {filteredRels.length}
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setPageRels(p => Math.max(1, p - 1))} disabled={pageRels === 1} className="flex items-center gap-1 rounded bg-slate-200 px-3 py-1 text-sm font-bold text-slate-600 hover:bg-slate-300 disabled:opacity-50">
                      <ChevronLeft className="h-4 w-4" /> Anterior
                    </button>
                    <span className="text-sm text-slate-600 font-medium">Página {pageRels} / {totalRelsPages}</span>
                    <button onClick={() => setPageRels(p => Math.min(totalRelsPages, p + 1))} disabled={pageRels === totalRelsPages} className="flex items-center gap-1 rounded bg-slate-900 px-3 py-1 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50">
                      Próxima <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
      </div>

      {editingGM && (
        <QuickEditGMModal 
          gm={editingGM} 
          onClose={() => setEditingGM(null)} 
          onSave={() => { setEditingGM(null); loadData(); }} 
        />
      )}
    </>
  );
}
