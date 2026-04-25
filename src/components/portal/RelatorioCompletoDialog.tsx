import { useState, useMemo } from "react";
import { 
  X, Filter, Search, Calendar, Users, 
  UserCheck, UserX, Star, Heart, 
  Trash2, Loader2, Download, Landmark,
  MapPin, MessageCircle, FileText, ChevronLeft, ChevronRight
} from "lucide-react";
import { useRelatorioCompleto, useTotalGms, RelatorioFilters } from "@/hooks/useRelatorioCompleto";
import { useDomain } from "@/hooks/useDomain";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type RelatorioCompletoDialogProps = {
  open: boolean;
  onClose: () => void;
};

const FAIXAS_ETARIAS = ["Kids", "Teen", "Jovem", "Adulto", "Misto"];

export function RelatorioCompletoDialog({ open, onClose }: RelatorioCompletoDialogProps) {
  const { areas } = useDomain();
  
  // Filters State
  const [filters, setFilters] = useState<RelatorioFilters>({
    area: "Todas",
    dataInicio: "",
    dataFim: "",
    faixaEtaria: "Todas",
    idRelatorio: "",
  });

  const { 
    data: reports, 
    isLoading, 
    stats, 
    deleteRelatorio, 
    isDeleting 
  } = useRelatorioCompleto(filters);

  const { data: totalGmsCount } = useTotalGms(filters.area, filters.faixaEtaria);

  // Pagination & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredReports = useMemo(() => {
    if (!reports) return [];
    if (!searchTerm) return reports;
    
    const search = searchTerm.toLowerCase();
    return reports.filter(r => 
      r.nome_gm.toLowerCase().includes(search) || 
      r.nome_lider.toLowerCase().includes(search) ||
      r.congregacao.toLowerCase().includes(search)
    );
  }, [reports, searchTerm]);

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const currentItems = filteredReports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  if (!open) return null;

  const handleFilterChange = (key: keyof RelatorioFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleExportCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) return;
    
    const headers = [
      "ID", "Data", "Area", "Congregacao", "GM", "Lider", 
      "WhatsApp", "Membros", "Vis. Cristaos", "Vis. N. Cristaos", 
      "Decisoes", "Reconciliacoes"
    ];

    const rows = data.map(r => [
      r.id,
      r.data_gm,
      r.area_nome,
      r.congregacao,
      r.nome_gm,
      r.nome_lider,
      r.whatsapp,
      r.qtd_membros,
      r.visitantes_cristaos,
      r.visitantes_nao_cristaos,
      r.decisao,
      r.reconciliacao
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-7xl h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col scale-in-center">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-start justify-between bg-white">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">RELATÓRIO COMPLETO</h1>
            <span className="inline-block mt-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-wider">
              Visão Geral do Campo
            </span>
          </div>
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
          >
            Fechar
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6 bg-[#fcfcfc]">
          
          {/* Filters Bar (Exactly like the image) */}
          <div className="flex flex-wrap items-end gap-4 mb-8">
            <div className="flex-1 min-w-[240px]">
              <label className="block text-sm font-bold text-slate-600 mb-1.5 ml-1">Filtrar por Área</label>
              <select 
                value={filters.area}
                onChange={(e) => handleFilterChange("area", e.target.value)}
                className="w-full h-12 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 px-4 shadow-sm"
              >
                <option value="Todas">Todas as áreas</option>
                {areas.map(a => <option key={a.id} value={a.nome}>{a.nome}</option>)}
              </select>
            </div>

            <div className="w-44">
              <label className="block text-sm font-bold text-slate-600 mb-1.5 ml-1">Data inicial</label>
              <input 
                type="date"
                value={filters.dataInicio}
                onChange={(e) => handleFilterChange("dataInicio", e.target.value)}
                className="w-full h-12 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 px-3 shadow-sm"
              />
            </div>

            <div className="w-44">
              <label className="block text-sm font-bold text-slate-600 mb-1.5 ml-1">Data final</label>
              <input 
                type="date"
                value={filters.dataFim}
                onChange={(e) => handleFilterChange("dataFim", e.target.value)}
                className="w-full h-12 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 px-3 shadow-sm"
              />
            </div>

            <div className="flex gap-2">
              <button className="h-12 px-8 bg-[#1fa353] text-white rounded-xl text-sm font-black hover:brightness-110 transition-all shadow-md">
                Aplicar
              </button>
              <button 
                onClick={() => setFilters({area: "Todas", dataInicio: "", dataFim: "", faixaEtaria: "Todas", idRelatorio: ""})}
                className="h-12 px-8 bg-[#f14343] text-white rounded-xl text-sm font-black hover:brightness-110 transition-all shadow-md"
              >
                Limpar
              </button>
            </div>
          </div>

          {/* Stats Cards (Separate Cards as requested) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard 
              label="GM's cadastrados (campo)" 
              value={totalGmsCount ?? "..."} 
            />
            <StatCard 
              label="Reuniões (total histórico)" 
              value={stats.totalReunioes} 
            />
            <StatCard 
              label="Decisões" 
              value={stats.totalDecisoes} 
            />
            <StatCard 
              label="Reconciliações" 
              value={stats.totalReconciliacoes} 
            />
          </div>

          {/* Table Toolbar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <div className="w-full md:w-80">
              <input 
                placeholder="Buscar em todas as colunas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/10"
              />
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => handleExportCSV(currentItems, "relatorio-pagina-atual")}
                className="h-10 px-4 bg-blue-50 text-blue-600 rounded-xl text-[11px] font-black uppercase tracking-wider border border-blue-100 hover:bg-blue-100 transition-colors"
              >
                CSV (esta página)
              </button>
              <button 
                onClick={() => handleExportCSV(filteredReports, "relatorio-completo-filtrado")}
                className="h-10 px-4 bg-blue-50 text-blue-600 rounded-xl text-[11px] font-black uppercase tracking-wider border border-blue-100 hover:bg-blue-100 transition-colors"
              >
                CSV (filtrado)
              </button>
              
              <div className="flex items-center gap-2 ml-4">
                <span className="text-xs font-bold text-slate-400">Itens por página</span>
                <select className="h-10 bg-white border border-slate-200 rounded-xl text-xs font-black px-2 outline-none">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                  <option>Todos</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border-x border-t border-slate-100 rounded-t-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-5 font-black text-slate-900 uppercase tracking-widest text-[12px]">Data do Gm</th>
                    <th className="px-6 py-5 font-black text-slate-900 uppercase tracking-widest text-[12px]">Área</th>
                    <th className="px-6 py-5 font-black text-slate-900 uppercase tracking-widest text-[12px]">Congregação</th>
                    <th className="px-6 py-5 font-black text-slate-900 uppercase tracking-widest text-[12px]">Nome do Gm</th>
                    <th className="px-6 py-5 font-black text-slate-900 uppercase tracking-widest text-[12px]">Nome do Líder</th>
                    <th className="px-6 py-5 font-black text-slate-900 uppercase tracking-widest text-[12px]">WhatsApp ("91" + "9" + Número)</th>
                    <th className="px-6 py-5 font-black text-slate-900 uppercase tracking-widest text-[12px] text-center">Quantidade de Membros no GM</th>
                    <th className="px-6 py-5 font-black text-slate-900 uppercase tracking-widest text-[12px] text-center">Quantidade de Visitante Cristão</th>
                    <th className="px-6 py-5 font-black text-slate-900 uppercase tracking-widest text-[12px] text-center">Quantidade de Visitante não cristão</th>
                    <th className="px-6 py-5 font-black text-slate-900 uppercase tracking-widest text-[12px] text-center">Decisão</th>
                    <th className="px-6 py-5 font-black text-slate-900 uppercase tracking-widest text-[12px] text-center">Reconciliação</th>
                    <th className="px-6 py-5 font-black text-slate-900 uppercase tracking-widest text-[12px] text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={12} className="px-6 py-20 text-center">
                        <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto" />
                        <p className="mt-4 text-slate-400 font-bold">Processando dados...</p>
                      </td>
                    </tr>
                  ) : currentItems.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="px-6 py-20 text-center text-slate-400 font-bold">
                        Nenhum relatório encontrado para este filtro.
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-black text-slate-900 border-l-4 border-l-transparent hover:border-l-emerald-500 transition-all">
                          {r.data_gm ? format(new Date(r.data_gm + "T12:00:00"), "dd/MM/yyyy") : "—"}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                            {r.area_nome}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-700">{r.congregacao}</td>
                        <td className="px-6 py-4 font-black text-emerald-700">{r.nome_gm}</td>
                        <td className="px-6 py-4 leading-tight">
                          <p className="font-bold text-slate-900">{r.nome_lider}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{r.grupos_missionarios?.faixa_etaria || "—"}</p>
                        </td>
                        <td className="px-6 py-4">
                          <a 
                            href={`https://wa.me/55${r.whatsapp}`} 
                            target="_blank" rel="noreferrer"
                            className="flex items-center gap-1.5 text-emerald-600 font-black hover:underline group"
                          >
                            <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            {r.whatsapp || "—"}
                          </a>
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-slate-600">{r.qtd_membros}</td>
                        <td className="px-6 py-4 text-center font-bold text-blue-600">{r.visitantes_cristaos}</td>
                        <td className="px-6 py-4 text-center font-bold text-purple-600">{r.visitantes_nao_cristaos}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-lg text-white font-black ${r.decisao > 0 ? "bg-emerald-500" : "bg-slate-200 text-slate-400"}`}>
                            {r.decisao}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-lg text-white font-black ${r.reconciliacao > 0 ? "bg-indigo-500" : "bg-slate-200 text-slate-400"}`}>
                            {r.reconciliacao}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => setConfirmDeleteId(r.id)}
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Excluir Relatório"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pagination Footer */}
        <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-bold text-slate-400">
            Mostrando <span className="text-slate-900">{currentItems.length}</span> de <span className="text-slate-900">{filteredReports.length}</span> relatórios
          </p>
          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                const p = i + 1;
                return (
                  <button 
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${currentPage === p ? "bg-slate-900 text-white shadow-lg shadow-slate-200 scale-110" : "bg-white text-slate-400 border border-slate-200 hover:bg-slate-50"}`}
                  >
                    {p}
                  </button>
                );
              })}
              {totalPages > 5 && <span className="px-1 text-slate-300 text-xs font-bold">...</span>}
            </div>
            <button 
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-50 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !isDeleting && setConfirmDeleteId(null)} />
          <div className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center scale-in-center">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Excluir Relatório?</h3>
            <p className="text-slate-500 font-medium mb-8 leading-relaxed">
              Você está prestes a remover o relatório <span className="font-bold text-slate-900">#{confirmDeleteId}</span> permanentemente. Esta ação não poderá ser desfeita.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setConfirmDeleteId(null)}
                disabled={isDeleting}
                className="h-12 rounded-2xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button 
                onClick={async () => {
                  await deleteRelatorio(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
                disabled={isDeleting}
                className="h-12 rounded-2xl font-black text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sim, Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, className }: any) {
  return (
    <div className={`bg-white px-8 py-10 rounded-[32px] border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden flex flex-col justify-center ${className}`}>
      <p className="text-sm font-bold text-slate-500 mb-2 leading-tight">{label}</p>
      <h3 className="text-6xl font-black text-slate-900 tracking-tighter">{value}</h3>
    </div>
  );
}
