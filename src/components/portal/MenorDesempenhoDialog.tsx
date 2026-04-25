import { useState, useMemo } from "react";
import { 
  X, Search, Download, MapPin, 
  ChevronLeft, ChevronRight, AlertCircle, 
  Loader2, Filter, Info
} from "lucide-react";
import { useMenorDesempenho, LowPerformerGM } from "@/hooks/useMenorDesempenho";
import { useDomain } from "@/hooks/useDomain";
import { format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

type MenorDesempenhoDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function MenorDesempenhoDialog({ open, onClose }: MenorDesempenhoDialogProps) {
  const { areas } = useDomain();
  const [areaFilter, setAreaFilter] = useState("Todas");
  const { data: rawData, isLoading } = useMenorDesempenho(areaFilter);

  // Search local state
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fenchas (Windows) para o cabeçalho informativo
  const today = new Date();
  const date6m = format(subMonths(today, 6), "dd/MM/yyyy");
  const date2m = format(subMonths(today, 2), "dd/MM/yyyy");
  const now = format(today, "dd/MM/yyyy");

  const filteredData = useMemo(() => {
    if (!rawData) return [];
    let result = rawData;

    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      result = result.filter(r => 
        r.nome_gm.toLowerCase().includes(s) || 
        r.area_nome.toLowerCase().includes(s)
      );
    }

    return result;
  }, [rawData, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (!open) return null;

  const handleExportCSV = (list: LowPerformerGM[], filename: string) => {
    const headers = ["GM", "Faixa Etaria", "Lider", "Congregacao", "Area", "Decisoes (6m)", "Reconciliacoes (6m)", "Visitantes NC (2m)"];
    const rows = list.map(r => [
      r.nome_gm, r.faixa_etaria, r.nome_lider, r.congregacao, r.area_nome, 
      r.total_decisoes, r.total_reconciliacoes, r.total_visitantes_nc
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-7xl h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col scale-in-center">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-start justify-between bg-white">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">GM's — Menor Desempenho</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                <Info className="w-3.5 h-3.5 text-blue-500" />
                Janela Decisões/Reconciações: <span className="text-slate-900">{date6m} → {now}</span>
              </span>
              <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                <Info className="w-3.5 h-3.5 text-emerald-500" />
                Janela Visitantes NC: <span className="text-slate-900">{date2m} → {now}</span>
              </span>
              <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                Selecionados: {filteredData.length}
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="px-8 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-black hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
          >
            Fechar
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6 bg-[#fcfcfc]">
          
          {/* Stats Highlight (NEW) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-8 rounded-[32px] border border-red-100 shadow-[0_4px_25px_-5px_rgba(239,68,68,0.1)] flex items-center justify-between group overflow-hidden relative">
               <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/5 rounded-full group-hover:scale-150 transition-transform" />
               <div className="relative z-10">
                 <p className="text-xs font-black text-red-500 uppercase tracking-widest mb-1">GMs em Alerta / Críticos</p>
                 <h3 className="text-5xl font-black text-slate-900 tracking-tight">{filteredData.length}</h3>
                 <p className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Atendem aos critérios de baixo desempenho</p>
               </div>
               <div className="p-4 bg-red-50 text-red-500 rounded-2xl relative z-10">
                 <AlertCircle className="w-8 h-8" />
               </div>
            </div>
            
            <div className="md:col-span-2 bg-slate-50 border border-slate-100 rounded-[32px] p-6 flex flex-col justify-center">
               <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                 <Info className="w-4 h-4 text-indigo-500" /> Critérios para Listagem:
               </h4>
               <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <li className="flex items-start gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                   <p className="text-xs font-medium text-slate-600">Zero Decisões ou Reconciliações nos últimos <span className="font-black text-slate-900">6 meses</span>.</p>
                 </li>
                 <li className="flex items-start gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                   <p className="text-xs font-medium text-slate-600">Zero Visitantes Não Cristãos nos últimos <span className="font-black text-slate-900">2 meses</span>.</p>
                 </li>
               </ul>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-end gap-x-6 gap-y-4 mb-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex-1 min-w-[280px]">
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Buscar por Nome do GM ou Área</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input 
                  placeholder="Ex: Maranata ou Área 22..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all"
                />
              </div>
            </div>

            <div className="w-64">
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Filtro por Área</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <select 
                  value={areaFilter}
                  onChange={(e) => setAreaFilter(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white outline-none appearance-none"
                >
                  <option value="Todas">Todas as áreas</option>
                  {areas.map(a => <option key={a.id} value={a.nome}>{a.nome}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 ml-auto">
              <button 
                onClick={() => handleExportCSV(currentItems, `desempenho-atual-${now}`)}
                className="h-12 px-6 bg-blue-50 text-blue-600 rounded-xl text-[11px] font-black uppercase tracking-wider border border-blue-100 hover:bg-blue-100 transition-all"
              >
                CSV (esta página)
              </button>
              <button 
                onClick={() => handleExportCSV(filteredData, `desempenho-completo-${now}`)}
                className="h-12 px-6 bg-blue-50 text-blue-600 rounded-xl text-[11px] font-black uppercase tracking-wider border border-blue-100 hover:bg-blue-100 transition-all"
              >
                CSV (filtrado)
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white border border-slate-100 rounded-[32px] shadow-sm overflow-hidden mb-10">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-6 font-black text-slate-900 uppercase tracking-widest text-[11px]">Nome do GM</th>
                    <th className="px-6 py-6 font-black text-slate-900 uppercase tracking-widest text-[11px]">Nome do Líder</th>
                    <th className="px-6 py-6 font-black text-slate-900 uppercase tracking-widest text-[11px]">Congregação</th>
                    <th className="px-6 py-6 font-black text-slate-900 uppercase tracking-widest text-[11px]">Área</th>
                    <th className="px-5 py-6 font-black text-slate-900 uppercase tracking-widest text-[11px] text-center">Decisões (6m)</th>
                    <th className="px-5 py-6 font-black text-slate-900 uppercase tracking-widest text-[11px] text-center">Reconcil. (6m)</th>
                    <th className="px-8 py-6 font-black text-slate-900 uppercase tracking-widest text-[11px] text-center">Visitantes NC (2m)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-8 py-32 text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-slate-300 mx-auto" />
                        <p className="mt-4 text-slate-400 font-bold uppercase tracking-widest text-xs">Analisando desempenho do campo...</p>
                      </td>
                    </tr>
                  ) : filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-8 py-32 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                        Nenhum GM identificado com baixo desempenho para estes filtros! 🙌
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((r) => {
                      const isCritical = Number(r.total_decisoes) === 0 && Number(r.total_visitantes_nc) === 0;
                      return (
                        <tr key={r.gm_id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className={`w-2.5 h-2.5 rounded-full ${isCritical ? 'bg-red-500 shadow-lg shadow-red-200 animate-pulse' : 'bg-amber-400 shadow-lg shadow-amber-200'}`} />
                              <div>
                                <p className="font-black text-slate-900 uppercase tracking-tight">{r.nome_gm}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{r.faixa_etaria}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 font-bold text-slate-600">{r.nome_lider}</td>
                          <td className="px-6 py-5 font-bold text-slate-600">{r.congregacao}</td>
                          <td className="px-6 py-5">
                            <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                              {r.area_nome}
                            </span>
                          </td>
                          <td className="px-5 py-5 text-center">
                            <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl font-black text-lg transition-all ${Number(r.total_decisoes) === 0 ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                              {Number(r.total_decisoes)}
                            </div>
                          </td>
                          <td className="px-5 py-5 text-center">
                            <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl font-black text-lg transition-all ${Number(r.total_reconciliacoes) === 0 ? 'bg-amber-50 text-amber-600 border border-amber-100 shadow-sm' : 'bg-slate-50 text-slate-600 border border-slate-100'}`}>
                              {Number(r.total_reconciliacoes)}
                            </div>
                          </td>
                          <td className="px-8 py-5 text-center">
                             <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl font-black text-lg transition-all ${Number(r.total_visitantes_nc) === 0 ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                              {Number(r.total_visitantes_nc)}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer / Pagination */}
        <div className="px-8 py-5 border-t border-slate-100 bg-white flex items-center justify-between">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-tight">
            Página <span className="text-slate-900">{currentPage}</span> de <span className="text-slate-900">{totalPages || 1}</span>
          </p>
          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                const p = i + 1;
                return (
                  <button 
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${currentPage === p ? "bg-slate-900 text-white shadow-lg shadow-slate-200" : "bg-white text-slate-400 border border-slate-200 hover:bg-slate-50"}`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
            <button 
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-100 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
