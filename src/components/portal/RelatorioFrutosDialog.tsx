import { useState, useMemo } from "react";
import { 
  X, Filter, Search, Download, 
  ChevronLeft, ChevronRight, Loader2,
  Calendar, MapPin, Layers
} from "lucide-react";
import { useRelatorioFrutos, GMFrutoConsolidados, FrutosFilters } from "@/hooks/useRelatorioFrutos";
import { useDomain } from "@/hooks/useDomain";
import { SETORES_LIST } from "@/lib/setores";
import { format } from "date-fns";

type RelatorioFrutosDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function RelatorioFrutosDialog({ open, onClose }: RelatorioFrutosDialogProps) {
  const { areas } = useDomain();
  
  // States para Filtros
  const [tempFilters, setTempFilters] = useState<FrutosFilters>({
    setor: "Todos os setores",
    area: "Todas as áreas",
    faixaEtaria: "Todas as faixas",
    dataInicio: "",
    dataFim: "",
  });

  const [activeFilters, setActiveFilters] = useState<FrutosFilters>(tempFilters);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: rawData, isLoading } = useRelatorioFrutos(activeFilters);

  // Filtro de busca textual e processamento final
  const filteredData = useMemo(() => {
    if (!rawData) return [];
    let result = rawData;

    // Filtro adicional de Faixa Etária (Client-side para manter performance)
    if (activeFilters.faixaEtaria !== "Todas as faixas") {
      result = result.filter(r => r.faixa_etaria === activeFilters.faixaEtaria);
    }

    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      result = result.filter(r => 
        r.nome_gm.toLowerCase().includes(s) || 
        r.area_nome.toLowerCase().includes(s) ||
        r.congregacao.toLowerCase().includes(s)
      );
    }

    // 🏆 Ordenação por Ranking (Maior número de frutos primeiro)
    return result.sort((a, b) => {
      const totalA = a.total_decisoes + a.total_reconciliacoes;
      const totalB = b.total_decisoes + b.total_reconciliacoes;
      return totalB - totalA;
    });
  }, [rawData, searchTerm, activeFilters.faixaEtaria]);

  // Estatísticas dos Cards
  const stats = useMemo(() => {
    return {
      totalGms: filteredData.length,
      totalDecisoes: filteredData.reduce((acc, r) => acc + r.total_decisoes, 0),
      totalReconciliacoes: filteredData.reduce((acc, r) => acc + r.total_reconciliacoes, 0),
    };
  }, [filteredData]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (!open) return null;

  const handleApply = () => {
    setActiveFilters(tempFilters);
    setCurrentPage(1);
  };

  const handleClear = () => {
    const reset = {
      setor: "Todos os setores",
      area: "Todas as áreas",
      faixaEtaria: "Todas as faixas",
      dataInicio: "",
      dataFim: "",
    };
    setTempFilters(reset);
    setActiveFilters(reset);
    setCurrentPage(1);
  };

  const faixas = ["Kids", "Teens", "Jovem", "Adultos", "Misto"];

  const handleExportCSV = (list: GMFrutoConsolidados[], filename: string) => {
    const escapeCSV = (val: any) => {
      const s = String(val ?? "");
      if (s.includes(",") || s.includes('"') || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const headers = ["Area", "Congregacao", "Nome GM", "Faixa Etaria", "Decisoes", "Reconciliacoes"];
    const rows = list.map(r => [
      escapeCSV(r.area_nome), 
      escapeCSV(r.congregacao), 
      escapeCSV(r.nome_gm), 
      escapeCSV(r.faixa_etaria),
      r.total_decisoes, 
      r.total_reconciliacoes
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
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
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Relatório de Frutos</h1>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              Visão: <span className="text-slate-900">{activeFilters.setor}</span>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="px-8 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-black hover:bg-slate-800 transition-all shadow-lg"
          >
            Fechar
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6 bg-[#fcfcfc]">
          
          {/* Filters Bar */}
          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm mb-8">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Filtrar por Setor</label>
                <select 
                  value={tempFilters.setor}
                  onChange={(e) => setTempFilters({ ...tempFilters, setor: e.target.value })}
                  className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-slate-100 transition-all"
                >
                  <option value="Todos os setores">Todos os setores</option>
                  {SETORES_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Filtrar por Área</label>
                <select 
                  value={tempFilters.area}
                  onChange={(e) => setTempFilters({ ...tempFilters, area: e.target.value })}
                  className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-slate-100 transition-all"
                >
                  <option value="Todas as áreas">Todas as áreas</option>
                  {areas.map(a => <option key={a.id} value={a.nome}>{a.nome}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Faixa Etária</label>
                <select 
                  value={tempFilters.faixaEtaria}
                  onChange={(e) => setTempFilters({ ...tempFilters, faixaEtaria: e.target.value })}
                  className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-slate-100 transition-all"
                >
                  <option value="Todas as faixas">Todas as faixas</option>
                  {faixas.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                   <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Início</label>
                   <input 
                    type="date"
                    value={tempFilters.dataInicio}
                    onChange={(e) => setTempFilters({ ...tempFilters, dataInicio: e.target.value })}
                    className="w-full h-12 px-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-900"
                   />
                </div>
                <div>
                   <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Fim</label>
                   <input 
                    type="date"
                    value={tempFilters.dataFim}
                    onChange={(e) => setTempFilters({ ...tempFilters, dataFim: e.target.value })}
                    className="w-full h-12 px-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-900"
                   />
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={handleApply}
                  className="flex-1 h-12 bg-emerald-500 text-white rounded-xl text-sm font-black hover:bg-emerald-600 transition-all shadow-lg"
                >
                  Aplicar
                </button>
                <button 
                  onClick={handleClear}
                  className="h-12 px-4 bg-red-500 text-white rounded-xl text-sm font-black hover:bg-red-600 transition-all shadow-lg"
                >
                  Limpar
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
             <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">GMs com Fruto (nesta lista)</p>
                <h3 className="text-4xl font-black text-slate-900">{stats.totalGms}</h3>
             </div>
             <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Decisões</p>
                <h3 className="text-4xl font-black text-slate-900">{stats.totalDecisoes}</h3>
             </div>
             <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Reconciliações</p>
                <h3 className="text-4xl font-black text-slate-900">{stats.totalReconciliacoes}</h3>
             </div>
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input 
                placeholder="Buscar GM, Área ou Congregação..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 pl-11 pr-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-slate-100"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => handleExportCSV(currentItems, "frutos-pagina")}
                className="h-10 px-6 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-wider border border-blue-100 hover:bg-blue-100"
              >
                CSV (esta página)
              </button>
              <button 
                onClick={() => handleExportCSV(filteredData, "frutos-filtrado")}
                className="h-10 px-6 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-wider border border-blue-100 hover:bg-blue-100"
              >
                CSV (filtrado)
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 font-black text-slate-900 uppercase tracking-widest text-[10px]">Área</th>
                  <th className="px-6 py-5 font-black text-slate-900 uppercase tracking-widest text-[10px]">Congregação</th>
                  <th className="px-6 py-5 font-black text-slate-900 uppercase tracking-widest text-[10px]">Nome do GM</th>
                  <th className="px-6 py-5 font-black text-slate-900 uppercase tracking-widest text-[10px]">Faixa Etária</th>
                  <th className="px-6 py-5 font-black text-slate-900 uppercase tracking-widest text-[10px] text-center">Decisão</th>
                  <th className="px-6 py-5 font-black text-slate-900 uppercase tracking-widest text-[10px] text-center">Reconciliação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <Loader2 className="w-10 h-10 animate-spin text-slate-300 mx-auto" />
                      <p className="text-[10px] font-black text-slate-400 mt-4 uppercase tracking-widest">Processando frutos do campo...</p>
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Nenhum fruto encontrado para estes filtros.
                    </td>
                  </tr>
                ) : (
                  currentItems.map((gm) => (
                    <tr key={gm.gm_id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-5">
                        <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                          {gm.area_nome}
                        </span>
                      </td>
                      <td className="px-6 py-5 font-bold text-slate-600 uppercase tracking-tight">{gm.congregacao}</td>
                      <td className="px-6 py-5 font-black text-slate-900 uppercase tracking-tight">{gm.nome_gm}</td>
                      <td className="px-6 py-5">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-0.5">
                          {gm.faixa_etaria}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="inline-flex items-center justify-center w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl font-black text-lg border border-emerald-100">
                          {gm.total_decisoes}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                         <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-50 text-blue-600 rounded-xl font-black text-lg border border-blue-100">
                          {gm.total_reconciliacoes}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Toolbar */}
        <div className="px-8 py-5 border-t border-slate-100 bg-white flex items-center justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Mostrando <span className="text-slate-900">{currentItems.length}</span> de <span className="text-slate-900">{filteredData.length}</span> GMs únicos
          </p>
          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-100 transition-all"
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
                    className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${currentPage === p ? "bg-slate-900 text-white shadow-lg" : "bg-white text-slate-400 border border-slate-200 hover:bg-slate-50"}`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
            <button 
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-100 transition-all"
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
