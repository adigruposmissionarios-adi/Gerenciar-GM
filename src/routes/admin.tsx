import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { BannerHeader } from "@/components/portal/BannerHeader";
import { useStats, getCurrentWeekRange } from "@/hooks/useStats";
import { useTopAreas } from "@/hooks/useTopAreas";
import { RelatorioSetorDialog } from "@/components/portal/RelatorioSetorDialog";
import { RelatorioCompletoDialog } from "@/components/portal/RelatorioCompletoDialog";
import { MenorDesempenhoDialog } from "@/components/portal/MenorDesempenhoDialog";
import { RelatorioFrutosDialog } from "@/components/portal/RelatorioFrutosDialog";
import { GerenciarGMsDialog } from "@/components/portal/GerenciarGMsDialog";
import { ConfiguracoesDialog } from "@/components/portal/ConfiguracoesDialog";
import { 
  ArrowLeft, 
  LayoutGrid, 
  FileSpreadsheet, 
  TrendingDown, 
  List, 
  Star, 
  Settings 
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      if (sessionStorage.getItem("admin_auth") !== "true") {
        throw redirect({
          to: "/",
        });
      }
    }
  },
  component: AdminPage,
});

function formatDateRange(startStr: string, endStr: string) {
  const partsStart = startStr.split("-");
  const partsEnd = endStr.split("-");
  if (partsStart.length === 3 && partsEnd.length === 3) {
    return `${partsStart[2]}/${partsStart[1]} a ${partsEnd[2]}/${partsEnd[1]}`;
  }
  return "";
}

function AdminPage() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: topAreas, isLoading: areasLoading } = useTopAreas();

  const [setorOpen, setSetorOpen] = useState(false);
  const [completosOpen, setCompletosOpen] = useState(false);
  const [desempenhoOpen, setDesempenhoOpen] = useState(false);
  const [gerenciarOpen, setGerenciarOpen] = useState(false);
  const [frutosOpen, setFrutosOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);

  const { start, end } = getCurrentWeekRange();
  const weekLabel = formatDateRange(start, end);

  function handleLogout() {
    sessionStorage.removeItem("admin_auth");
    navigate({ to: "/" });
  }

  const quckActions = [
    {
      id: "setor",
      title: "Relatórios por Setor",
      desc: "Visão consolidada por setor + lista de GM's do setor.",
      icon: LayoutGrid,
      color: "text-blue-600",
      bgBase: "bg-blue-50",
      onClick: () => setSetorOpen(true),
    },
    {
      id: "completos",
      title: "Relatório Completo (Campo)",
      desc: "Dashboard filtrável, exportação CSV e gestão de relatórios.",
      icon: FileSpreadsheet,
      color: "text-emerald-600",
      bgBase: "bg-emerald-50",
      onClick: () => setCompletosOpen(true),
    },
    {
      id: "desempenho",
      title: "GM's Menor Desempenho",
      desc: "Últimos 6 meses: dec.+reconcil. < 10 ou 2 meses: visitantes NC < 10.",
      icon: TrendingDown,
      color: "text-red-500",
      bgBase: "bg-red-50",
      onClick: () => setDesempenhoOpen(true),
    },
    {
      id: "dados",
      title: "Dados dos GM's",
      desc: 'Visualize, filtre, edite, exclua e exporte os cadastros da aba "dados".',
      icon: List,
      color: "text-indigo-500",
      bgBase: "bg-indigo-50",
      onClick: () => setGerenciarOpen(true),
    },
    {
      id: "frutos",
      title: "Relatório de Frutos",
      desc: "Lista de GM's com Decisões ou Reconciliações registradas.",
      icon: Star,
      color: "text-purple-600",
      bgBase: "bg-purple-50",
      onClick: () => setFrutosOpen(true),
    },
    {
      id: "config",
      title: "Configurações",
      desc: "Troca de Banner, Gestão de Áreas, Setores e Congregações.",
      icon: Settings,
      color: "text-slate-600",
      bgBase: "bg-slate-100",
      onClick: () => setConfigOpen(true),
    },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <BannerHeader />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        
        {/* Header Admin */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-6 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Administração do Portal
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Ferramentas internas para gestão do sistema
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 self-start sm:self-auto rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-slate-800 transition-colors"
          >
            Sair do Painel
          </button>
        </div>

        {/* Visão Geral (4 Cards separados conforme solicitado no áudio) */}
        <section className="mb-10">
          <h2 className="text-xl font-extrabold text-slate-800 mb-4">Resumo Semanal</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            
            {/* GM's cadastrados */}
            <div className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-100">
              <div className="absolute -right-8 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full bg-blue-50/70" />
              <div className="relative">
                <p className="text-sm font-bold text-slate-600">GM's cadastrados</p>
                <div className="mt-3 text-4xl font-black text-slate-900">
                  {statsLoading ? "..." : stats?.totalGms ?? 0}
                </div>
                <p className="mt-1 text-xs font-medium text-slate-400">Total Cadastrados</p>
              </div>
            </div>

            {/* Reuniões na semana */}
            <div className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-100">
              <div className="absolute -right-8 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full bg-slate-50/80" />
              <div className="relative">
                <p className="text-sm font-bold text-slate-600">Reuniões nesta semana</p>
                <div className="mt-3 text-4xl font-black text-slate-900">
                  {statsLoading ? "..." : stats?.reunioesSemana ?? 0}
                </div>
                <p className="mt-1 text-xs font-medium text-slate-400">
                  Semana (dom → sáb): {weekLabel}
                </p>
              </div>
            </div>

            {/* Decisões */}
            <div className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-100">
              <div className="absolute -right-8 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full bg-emerald-50/70" />
              <div className="relative">
                <p className="text-sm font-bold text-slate-600">Decisões</p>
                <div className="mt-3 text-4xl font-black text-slate-900">
                  {statsLoading ? "..." : stats?.decisoesSemana ?? 0}
                </div>
                <p className="mt-1 text-xs font-medium text-slate-400">Total da Semana</p>
              </div>
            </div>

            {/* Reconciliações */}
            <div className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-100">
              <div className="absolute -right-8 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full bg-indigo-50/60" />
              <div className="relative">
                <p className="text-sm font-bold text-slate-600">Reconciliações</p>
                <div className="mt-3 text-4xl font-black text-slate-900">
                  {statsLoading ? "..." : stats?.reconciliacoesSemana ?? 0}
                </div>
                <p className="mt-1 text-xs font-medium text-slate-400">Total da Semana</p>
              </div>
            </div>

          </div>
        </section>

        {/* Ações Rápidas */}
        <section className="mb-12">
          <h2 className="text-xl font-extrabold text-slate-800 mb-4">Gestão Estratégica</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quckActions.map((a) => {
              const Icon = a.icon;
              return (
                <div key={a.id} className="flex flex-col sm:flex-row items-start gap-4 rounded-2xl bg-white p-5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-100 transition-all hover:bg-slate-50/50 group">
                  <div className={`mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${a.bgBase} group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-6 w-6 ${a.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-slate-900">{a.title}</h3>
                    <p className="mt-1 text-sm text-slate-500 leading-snug">{a.desc}</p>
                    <div className="mt-3">
                      <button 
                        onClick={a.onClick}
                        className="rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
                      >
                        Acessar Ferramenta
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Top 10 Áreas */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-extrabold text-slate-800">Top 10 Áreas com mais GM's</h2>
            <p className="text-sm text-slate-500 mt-1">Atualiza automaticamente conforme novos cadastros são criados.</p>
          </div>
          
          <div className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-100">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-[#fcfcfc] border-b border-slate-100">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-bold text-slate-900">
                      Área
                    </th>
                    <th scope="col" className="px-6 py-4 font-bold text-slate-900">
                      Quantidade de GM's
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {areasLoading ? (
                    <tr>
                      <td colSpan={2} className="px-6 py-8 text-center text-slate-400">
                        Calculando ranking...
                      </td>
                    </tr>
                  ) : topAreas && topAreas.length > 0 ? (
                    topAreas.map((item, i) => (
                      <tr key={item.area} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-800">
                          {item.area}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-600">
                          {item.count}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="px-6 py-8 text-center text-slate-400">
                        Nenhuma área cadastrada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

      </main>

      <RelatorioSetorDialog open={setorOpen} onClose={() => setSetorOpen(false)} />
      <RelatorioCompletoDialog open={completosOpen} onClose={() => setCompletosOpen(false)} />
      <MenorDesempenhoDialog open={desempenhoOpen} onClose={() => setDesempenhoOpen(false)} />
      <RelatorioFrutosDialog open={frutosOpen} onClose={() => setFrutosOpen(false)} />
      <GerenciarGMsDialog open={gerenciarOpen} onClose={() => setGerenciarOpen(false)} />
      <ConfiguracoesDialog open={configOpen} onClose={() => setConfigOpen(false)} />
    </div>
  );
}
