import { useState, useMemo, useEffect } from "react";
import { 
  X, Search, Filter, MessageCircle, Pencil, Trash2, Eye, 
  Loader2, AlertTriangle, MapPin, Landmark, User, Calendar, 
  Layers, ChevronLeft, ChevronRight, FileDown, Download
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useDomain } from "@/hooks/useDomain";
import { SETORES_LIST } from "@/lib/setores";
import { format } from "date-fns";
import { QuickEditGMModal } from "./QuickEditGMModal";

type GMData = {
  id: string;
  nome: string;
  lider: string;
  lider_cpf: string | null;
  whatsapp_lider: string | null;
  email_lider: string | null;
  area_nome: string | null;
  congregacao_nome: string | null;
  faixa_etaria: string | null;
  created_at: string;
  endereco: string | null;
  data_fundacao: string | null;
  observacoes: string | null;
};

type GerenciarGMsDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function GerenciarGMsDialog({ open, onClose }: GerenciarGMsDialogProps) {
  const { areas, congregacoes, refetch } = useDomain();
  
  // States de Dados
  const [gms, setGms] = useState<GMData[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filtros
  const [filters, setFilters] = useState({
    search: "",
    setor: "Todos",
    area: "Todas",
    congregacao: "Todas",
    faixaEtaria: "Todas",
    dataInicio: "",
    dataFim: ""
  });

  // Modais de Ação
  const [selectedGM, setSelectedGM] = useState<GMData | null>(null);
  const [viewGM, setViewGM] = useState<GMData | null>(null);
  const [editGM, setEditGM] = useState<GMData | null>(null);
  const [deleteGM, setDeleteGM] = useState<GMData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  async function loadGMs() {
    setLoading(true);
    try {
      let allGms: GMData[] = [];
      let from = 0;
      const pageSize = 1000;

      while (true) {
        // SEGURANÇA: Não buscamos CPF, Endereço ou Observações na lista principal (apenas metadados e visualização)
        const { data, error } = await supabase
          .from("grupos_missionarios")
          .select("id, nome, lider, whatsapp_lider, email_lider, area_nome, congregacao_nome, faixa_etaria, created_at")
          .order("nome")
          .range(from, from + pageSize - 1);

        if (error) throw error;
        if (!data || data.length === 0) break;

        allGms.push(...(data as any));
        if (data.length < pageSize) break;
        from += pageSize;
      }
      
      setGms(allGms);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Função para buscar dados completos (CPF/Endereço) apenas sob demanda
  async function loadFullGM(id: string) {
    const { data, error } = await supabase
      .from("grupos_missionarios")
      .select("*")
      .eq("id", id)
      .single();
    if (error) return null;
    return data;
  }

  useEffect(() => {
    if (open) loadGMs();
  }, [open]);

  // Lógica de Filtragem Local para resposta instantânea
  const filteredGms = useMemo(() => {
    return gms.filter(gm => {
      const matchesSearch = !filters.search || 
        gm.nome.toLowerCase().includes(filters.search.toLowerCase()) ||
        gm.lider.toLowerCase().includes(filters.search.toLowerCase());
      
      const areasDoSetor = filters.setor !== "Todos" ? areas.filter(a => a.setor_nome === filters.setor).map(a => a.nome) : null;
      const matchesSetor = filters.setor === "Todos" || (areasDoSetor?.includes(gm.area_nome || ""));
      
      const matchesArea = filters.area === "Todas" || gm.area_nome === filters.area;
      const matchesCong = filters.congregacao === "Todas" || gm.congregacao_nome === filters.congregacao;
      const matchesFaixa = filters.faixaEtaria === "Todas" || gm.faixa_etaria === filters.faixaEtaria;
      
      const matchesData = (!filters.dataInicio || gm.created_at >= filters.dataInicio) &&
                          (!filters.dataFim || gm.created_at <= filters.dataFim);

      return matchesSearch && matchesSetor && matchesArea && matchesCong && matchesFaixa && matchesData;
    });
  }, [gms, filters, areas]);

  const totalPages = Math.ceil(filteredGms.length / itemsPerPage);
  const currentItems = filteredGms.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  async function handleDeleteConfirm() {
    if (!deleteGM) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from("grupos_missionarios").delete().eq("id", deleteGM.id);
      if (error) throw error;
      setDeleteGM(null);
      loadGMs();
      refetch(); // Atualiza contador no painel
    } catch (err: any) {
      alert("Erro ao excluir: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  }

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
        
        <div className="relative w-full max-w-7xl h-[92vh] bg-white rounded-[40px] shadow-2xl border border-slate-200 overflow-hidden flex flex-col scale-in-center">
          
          {/* Header */}
          <div className="px-10 py-8 border-b border-slate-100 flex items-start justify-between bg-white shrink-0">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 bg-indigo-600 rounded-xl">
                  <Layers className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Dados dos GM's</h1>
              </div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                Central de Gerenciamento Cadastral
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-3 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 hover:text-slate-900 transition-all shadow-sm"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-10 py-8 bg-[#fcfcfc] space-y-8">
            
            {/* Filters Dashboard */}
            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm transition-all hover:shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6 items-end">
                <div className="lg:col-span-2">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Buscar por Nome ou Líder</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text"
                      placeholder="Ex: Ágape..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-50 transition-all focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Setor</label>
                  <select 
                    value={filters.setor}
                    onChange={(e) => setFilters({ ...filters, setor: e.target.value, area: "Todas" })}
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 transition-all"
                  >
                    <option value="Todos">Todos os Setores</option>
                    {SETORES_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Área</label>
                  <select 
                    value={filters.area}
                    onChange={(e) => setFilters({ ...filters, area: e.target.value })}
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 transition-all"
                  >
                    <option value="Todas">Todas as Áreas</option>
                    {(filters.setor === "Todos" ? areas : areas.filter(a => a.setor_nome === filters.setor)).map(a => (
                      <option key={a.id} value={a.nome}>{a.nome}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Congregação</label>
                  <select 
                    value={filters.congregacao}
                    onChange={(e) => setFilters({ ...filters, congregacao: e.target.value })}
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 transition-all font-bold"
                  >
                    <option value="Todas">Todas</option>
                    {(filters.area === "Todas" ? congregacoes : congregacoes.filter(c => areas.find(a => a.id === c.area_id)?.nome === filters.area)).map(c => (
                      <option key={c.id} value={c.nome}>{c.nome}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Faixa Etária</label>
                  <select 
                    value={filters.faixaEtaria}
                    onChange={(e) => setFilters({ ...filters, faixaEtaria: e.target.value })}
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 transition-all font-bold"
                  >
                    <option value="Todas">Todas</option>
                    {["Kids", "Teens", "Jovem", "Adultos", "Misto"].map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>

                <div className="flex gap-2">
                   <div className="flex-1">
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Início</label>
                      <input 
                        type="date"
                        value={filters.dataInicio}
                        onChange={(e) => setFilters({ ...filters, dataInicio: e.target.value })}
                        className="w-full h-12 px-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-900 outline-none focus:border-indigo-500 transition-all"
                      />
                   </div>
                   <div className="flex-1">
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Fim</label>
                      <input 
                        type="date"
                        value={filters.dataFim}
                        onChange={(e) => setFilters({ ...filters, dataFim: e.target.value })}
                        className="w-full h-12 px-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-900 outline-none focus:border-indigo-500 transition-all"
                      />
                   </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      const escapeCSV = (val: any) => {
                        const s = String(val ?? "");
                        if (s.includes(",") || s.includes('"') || s.includes("\n")) {
                          return `"${s.replace(/"/g, '""')}"`;
                        }
                        return s;
                      };
                      const headers = ["Nome do GM", "Lider", "CPF", "WhatsApp", "Email", "Area", "Congregacao", "Faixa Etaria", "Criado em"];
                      const rows = filteredGms.map(gm => [
                        escapeCSV(gm.nome),
                        escapeCSV(gm.lider),
                        escapeCSV(gm.lider_cpf),
                        escapeCSV(gm.whatsapp_lider),
                        escapeCSV(gm.email_lider),
                        escapeCSV(gm.area_nome),
                        escapeCSV(gm.congregacao_nome),
                        escapeCSV(gm.faixa_etaria),
                        escapeCSV(gm.created_at)
                      ]);
                      const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
                      const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = `base-gms-${format(new Date(), "dd-MM-yyyy")}.csv`;
                      link.click();
                    }}
                    className="w-full h-12 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-3 h-3" /> Exportar CSV
                  </button>
                  <button 
                    onClick={() => {
                      setFilters({
                        search: "", setor: "Todos", area: "Todas", congregacao: "Todas",
                        faixaEtaria: "Todas", dataInicio: "", dataFim: ""
                      });
                    }}
                    className="w-full h-12 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Limpar
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content Table */}
            <div className="bg-white border border-slate-100 rounded-[40px] overflow-hidden shadow-sm flex-1 flex flex-col">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-8 py-6 font-black text-slate-900 uppercase tracking-widest text-[10px]">Nome do GM</th>
                      <th className="px-6 py-6 font-black text-slate-900 uppercase tracking-widest text-[10px]">Líder</th>
                      <th className="px-6 py-6 font-black text-slate-900 uppercase tracking-widest text-[10px]">Área</th>
                      <th className="px-6 py-6 font-black text-slate-900 uppercase tracking-widest text-[10px]">Congregação</th>
                      <th className="px-8 py-6 font-black text-slate-900 uppercase tracking-widest text-[10px] text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="py-24 text-center">
                          <Loader2 className="w-12 h-12 animate-spin text-slate-200 mx-auto" />
                          <p className="text-[10px] font-black text-slate-400 mt-6 uppercase tracking-widest">Sincronizando base de dados...</p>
                        </td>
                      </tr>
                    ) : currentItems.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-24 text-center">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nenhum GM encontrado para estes filtros.</p>
                        </td>
                      </tr>
                    ) : (
                      currentItems.map((gm) => (
                        <tr key={gm.id} className="group hover:bg-slate-50 transition-colors">
                          <td className="px-8 py-6">
                            <div className="flex flex-col">
                              <span className="font-black text-slate-900 uppercase tracking-tight text-base leading-tight">{gm.nome}</span>
                              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1">{gm.faixa_etaria || "Misto"}</span>
                            </div>
                          </td>
                          <td className="px-6 py-6 font-bold text-slate-600 uppercase tracking-tight">{gm.lider}</td>
                          <td className="px-6 py-6">
                            <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                              {gm.area_nome}
                            </span>
                          </td>
                          <td className="px-6 py-6 font-bold text-slate-600 uppercase tracking-tight">{gm.congregacao_nome}</td>
                          <td className="px-8 py-6">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={async () => {
                                  const full = await loadFullGM(gm.id);
                                  if (full) setViewGM(full);
                                }}
                                className="w-10 h-10 flex items-center justify-center bg-slate-100 text-slate-500 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                title="Visualizar Ficha"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={async () => {
                                  const full = await loadFullGM(gm.id);
                                  if (full) setEditGM(full);
                                }}
                                className="w-10 h-10 flex items-center justify-center bg-slate-100 text-slate-500 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                title="Editar Cadastro"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              {gm.whatsapp_lider && (
                                <a 
                                  href={`https://wa.me/55${gm.whatsapp_lider.replace(/\D/g, "")}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="w-10 h-10 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                  title="WhatsApp do Líder"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                </a>
                              )}
                              <button 
                                onClick={() => setDeleteGM(gm)}
                                className="w-10 h-10 flex items-center justify-center bg-slate-100 text-slate-300 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                title="Excluir Definitivamente"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-8 py-6 border-t border-slate-100 bg-[#fdfdfd] flex items-center justify-between mt-auto">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Exibindo <span className="text-slate-900">{currentItems.length}</span> de <span className="text-slate-900">{filteredGms.length}</span> registros totais
                </p>
                <div className="flex items-center gap-2">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-100 transition-all text-slate-600"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-1.5 px-3 font-black text-slate-400 text-xs uppercase tracking-widest">
                    Página <span className="text-slate-900 mx-1">{currentPage}</span> / {totalPages || 1}
                  </div>
                  <button 
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-100 transition-all text-slate-600"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Visualização Detalhada */}
      {viewGM && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setViewGM(null)} />
          <div className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl p-10 overflow-hidden animate-in zoom-in-95 duration-300">
            <button onClick={() => setViewGM(null)} className="absolute top-8 right-8 p-2 hover:bg-slate-100 rounded-xl text-slate-400"><X /></button>
            <div className="flex items-center gap-5 mb-8">
               <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-2xl uppercase">{viewGM.nome.substring(0, 2)}</div>
               <div>
                  <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{viewGM.nome}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-3 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-widest">{viewGM.faixa_etaria}</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">• Desde {viewGM.data_fundacao ? format(new Date(viewGM.data_fundacao), "dd/MM/yyyy") : "N/D"}</span>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-8 py-6 border-y border-slate-100">
               <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Líder Responsável</label>
                    <p className="font-bold text-slate-800 flex items-center gap-2"><User className="w-4 h-4 text-indigo-500" /> {viewGM.lider}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">WhatsApp</label>
                    <p className="font-bold text-slate-800">{viewGM.whatsapp_lider || "Não informado"}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">E-mail</label>
                    <p className="font-bold text-slate-800 break-all">{viewGM.email_lider || "Sem e-mail"}</p>
                  </div>
               </div>
               <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Área / Congregação</label>
                    <p className="font-bold text-slate-800">{viewGM.area_nome} • {viewGM.congregacao_nome}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Endereço de Reunião</label>
                    <p className="font-bold text-slate-800 text-xs leading-relaxed">{viewGM.endereco || "Não cadastrado"}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Cadastro no Sistema</label>
                    <p className="font-bold text-slate-800 text-xs leading-relaxed">{format(new Date(viewGM.created_at), "dd/MM/yyyy 'às' HH:mm")}</p>
                  </div>
               </div>
            </div>
            
            <div className="mt-8">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Observações Adicionais</label>
                <div className="bg-slate-50 p-4 rounded-xl text-sm font-bold text-slate-600 min-h-[80px]">
                  {viewGM.observacoes || "Nenhuma observação cadastrada para este grupo."}
                </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmação Exclusão */}
      {deleteGM && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
          <div className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl p-10 text-center animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Operação Crítica</h3>
            <p className="text-sm font-bold text-slate-500 uppercase leading-relaxed mb-8">
              Você está prestes a excluir o GM <span className="text-red-500">"{deleteGM.nome}"</span>.<br/>Esta ação é irreversível.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setDeleteGM(null)}
                className="flex-1 h-14 rounded-2xl bg-slate-100 text-slate-900 font-black uppercase text-[11px] tracking-widest hover:bg-slate-200"
              >
                Cancelar
              </button>
              <button 
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 h-14 rounded-2xl bg-red-600 text-white font-black uppercase text-[11px] tracking-widest hover:bg-red-700 shadow-xl shadow-red-100 disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : "Confirmar Exclusão"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reaproveitando Modal de Edição Rápida */}
      {editGM && (
        <QuickEditGMModal 
          gm={{
            id: editGM.id,
            nome: editGM.nome,
            lider: editGM.lider,
            cpf_lider: editGM.lider_cpf,
            whatsapp_lider: editGM.whatsapp_lider,
            email_lider: editGM.email_lider,
            area_nome: editGM.area_nome,
            congregacao_nome: editGM.congregacao_nome,
            faixa_etaria: editGM.faixa_etaria,
            endereco: editGM.endereco,
            data_fundacao: editGM.data_fundacao
          }}
          onClose={() => setEditGM(null)}
          onSave={() => {
            setEditGM(null);
            loadGMs();
          }}
        />
      )}
    </>
  );
}
