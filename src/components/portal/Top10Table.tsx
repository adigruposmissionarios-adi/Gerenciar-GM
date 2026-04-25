import { useMemo } from "react";
import { Trophy } from "lucide-react";
import { useTop10 } from "@/hooks/useTop10";

export function Top10Table() {
  const { data: rows, isLoading } = useTop10();

  const weekLabel = useMemo(() => {
    const now = new Date();
    const dow = now.getDay();
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - dow);
    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);
    const fmt = (d: Date) =>
      `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
    return `(${fmt(sunday)} a ${fmt(saturday)})`;
  }, []);

  return (
    <section
      className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm"
    >
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50">
          <Trophy className="h-5 w-5 text-blue-600" />
        </div>
        <h3 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
          Top 10 GM&apos;s da Semana
        </h3>
        <span className="text-sm font-medium text-slate-400">{weekLabel}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left">
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Nome do GM</th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Líder</th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Faixa Etária</th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Congregação</th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Área</th>
              <th className="px-6 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-500">Decisões</th>
              <th className="px-6 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-500">Reconcil.</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-t border-slate-100">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows && rows.length > 0 ? (
              rows.map((r, i) => (
                <tr
                  key={r.gm}
                  className={`border-t border-slate-100 ${i % 2 === 1 ? "bg-slate-50/50" : ""}`}
                >
                  <td className="px-6 py-4 font-bold text-slate-900">{r.gm}</td>
                  <td className="px-6 py-4 text-slate-600">{r.leader}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600 border border-blue-100">
                      {r.faixa_etaria}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{r.congregation}</td>
                  <td className="px-6 py-4 text-slate-600">{r.area}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-green-50 px-2 text-sm font-bold text-green-600 border border-green-100">
                      {r.decisions}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-blue-50 px-2 text-sm font-bold text-blue-600 border border-blue-100">
                      {r.reconciliations}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">
                  Nenhum dado encontrado para esta semana.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
