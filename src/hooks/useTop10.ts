import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type Top10Row = {
  gm: string;
  leader: string;
  congregation: string;
  area: string;
  faixa_etaria: string;
  decisions: number;
  reconciliations: number;
  visitantesNaoCristaos: number;
};

/**
 * Semana conta de DOMINGO 00:00 a SABADO 23:59.
 */
function getCurrentWeekRange(): { start: string; end: string } {
  const now = new Date();
  const dow = now.getDay();

  const sunday = new Date(now);
  sunday.setDate(now.getDate() - dow);
  sunday.setHours(0, 0, 0, 0);

  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);
  saturday.setHours(23, 59, 59, 999);

  const fmt = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  return { start: fmt(sunday), end: fmt(saturday) };
}

async function fetchTop10(): Promise<Top10Row[]> {
  const { start, end } = getCurrentWeekRange();

  const { data, error } = await supabase
    .from("relatorios_semanais")
    .select("nome_gm, nome_lider, congregacao, area_nome, decisao, reconciliacao, visitantes_nao_cristaos, grupos_missionarios(faixa_etaria)")
    .gte("data_gm", start)
    .lte("data_gm", end);

  if (error) throw error;

  const grouped = new Map<string, Top10Row>();

  for (const row of data ?? []) {
    const gmNome = row.nome_gm;
    if (!gmNome) continue;

    const faixa = row.grupos_missionarios as any;
    const faixaEtaria = typeof faixa === 'object' && faixa !== null ? faixa.faixa_etaria : "—";

    const existing = grouped.get(gmNome);

    if (existing) {
      existing.decisions += row.decisao ?? 0;
      existing.reconciliations += row.reconciliacao ?? 0;
      existing.visitantesNaoCristaos += row.visitantes_nao_cristaos ?? 0;
    } else {
      grouped.set(gmNome, {
        gm: gmNome,
        leader: row.nome_lider ?? "",
        congregation: row.congregacao ?? "",
        area: row.area_nome ?? "",
        faixa_etaria: faixaEtaria ?? "—",
        decisions: row.decisao ?? 0,
        reconciliations: row.reconciliacao ?? 0,
        visitantesNaoCristaos: row.visitantes_nao_cristaos ?? 0,
      });
    }
  }

  // Regra de Ordenação: 
  // 1º Critério: Soma de (decisões + reconciliações) DESC
  // 2º Critério: Visitantes não cristãos DESC (em caso de empate)
  return Array.from(grouped.values())
    .sort((a, b) => {
      const somaA = a.decisions + a.reconciliations;
      const somaB = b.decisions + b.reconciliations;

      if (somaA !== somaB) {
        return somaB - somaA;
      }
      // Se empatar, vence quem levou mais visitantes não cristãos
      return b.visitantesNaoCristaos - a.visitantesNaoCristaos;
    })
    .slice(0, 10);
}

export function useTop10() {
  return useQuery<Top10Row[]>({
    queryKey: ["top10"],
    queryFn: fetchTop10,
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 2,
  });
}
