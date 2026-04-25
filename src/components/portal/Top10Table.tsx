import { Trophy } from "lucide-react";
import { useTop10 } from "@/hooks/useTop10";

export function Top10Table() {
  const { data: rows, isLoading } = useTop10();

  // Gerar label da semana atual (dom a sab)
  const now = new Date();
  const dow = now.getDay();
  const sunday = new Date(now);
  sunday.setDate(now.getDate() - dow);
  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);
  const fmt = (d: Date) =>
    `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
  const weekLabel = `(${fmt(sunday)} a ${fmt(saturday)})`;

  return (
    <section
      className="overflow-hidden rounded-2xl border border-border/60 bg-card"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex flex-wrap items-center gap-3 border-b border-border/60 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-soft">
          <Trophy className="h-5 w-5 text-gold-deep" />
        </div>
        <h3 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
          Top 10 GM&apos;s da Semana
        </h3>
        <span className="text-sm font-medium text-muted-foreground">{weekLabel}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead className="bg-surface-muted">
            <tr className="text-left">
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Nome do GM
              </th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Nome do Líder
              </th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Faixa Etária
              </th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Congregação
              </th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Área
              </th>
              <th className="px-6 py-3 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Decisão
              </th>
              <th className="px-6 py-3 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Reconciliação
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-t border-border/50">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-6 py-3.5">
                      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows && rows.length > 0 ? (
              rows.map((r, i) => (
                <tr
                  key={r.gm}
                  className={`border-t border-border/50 transition-colors hover:bg-surface-muted/60 ${
                    i % 2 === 1 ? "bg-surface/40" : ""
                  }`}
                >
                  <td className="px-6 py-3.5 font-semibold text-foreground">{r.gm}</td>
                  <td className="px-6 py-3.5 text-muted-foreground">{r.leader}</td>
                  <td className="px-6 py-3.5 text-muted-foreground">
                    {r.faixa_etaria ? (
                       <span className="rounded-full bg-action-blue-strong/10 px-2.5 py-0.5 text-xs font-bold text-action-blue-strong">
                          {r.faixa_etaria}
                       </span>
                    ) : "—"}
                  </td>
                  <td className="px-6 py-3.5 text-muted-foreground">{r.congregation}</td>
                  <td className="px-6 py-3.5 text-muted-foreground">{r.area}</td>
                  <td className="px-6 py-3.5 text-center">
                    <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-action-green/15 px-2 text-sm font-bold text-action-green">
                      {r.decisions}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-action-blue-strong/10 px-2 text-sm font-bold text-action-blue-strong">
                      {r.reconciliations}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
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
