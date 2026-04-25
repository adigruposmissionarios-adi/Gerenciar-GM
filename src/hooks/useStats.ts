import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type Stats = {
  totalGms: number;
  reunioesSemana: number;
  decisoesSemana: number;
  reconciliacoesSemana: number;
};

/**
 * Semana conta de DOMINGO 00:00 a SABADO 23:59.
 * Retorna { start: "YYYY-MM-DD", end: "YYYY-MM-DD" } da semana corrente.
 */
export function getCurrentWeekRange(): { start: string; end: string } {
  const now = new Date();
  const dow = now.getDay(); // 0 = domingo, 6 = sabado

  // Recua até o domingo desta semana
  const sunday = new Date(now);
  sunday.setDate(now.getDate() - dow);
  sunday.setHours(0, 0, 0, 0);

  // Avança até o sabado desta semana
  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);
  saturday.setHours(23, 59, 59, 999);

  const fmt = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };
  
  return { start: fmt(sunday), end: fmt(saturday) };
}

async function fetchStats(): Promise<Stats> {
  // 1) Total de GMs cadastrados no sistema
  const { count: totalGms, error: gmError } = await supabase
    .from("grupos_missionarios")
    .select("*", { count: "exact", head: true });

  if (gmError) throw gmError;

  // 2) Relatórios enviados na semana corrente (Bypass 1000 records)
  const { start, end } = getCurrentWeekRange();
  let allRelatorios: any[] = [];
  let fromRel = 0;
  const pageSizeRel = 1000;

  while (true) {
    const { data: relatorios, error: relError } = await supabase
      .from("relatorios_semanais")
      .select("decisao, reconciliacao")
      .gte("data_gm", start)
      .lte("data_gm", end)
      .range(fromRel, fromRel + pageSizeRel - 1);

    if (relError) throw relError;
    if (!relatorios || relatorios.length === 0) break;

    allRelatorios.push(...relatorios);
    if (relatorios.length < pageSizeRel) break;
    fromRel += pageSizeRel;
  }

  const reunioesSemana        = allRelatorios.length;
  const decisoesSemana        = allRelatorios.reduce((acc, r) => acc + (r.decisao        ?? 0), 0) ?? 0;
  const reconciliacoesSemana  = allRelatorios.reduce((acc, r) => acc + (r.reconciliacao  ?? 0), 0) ?? 0;

  return {
    totalGms:              totalGms ?? 0,
    reunioesSemana,
    decisoesSemana,
    reconciliacoesSemana,
  };
}

export function useStats() {
  return useQuery<Stats>({
    queryKey: ["stats"],
    queryFn: fetchStats,
    // Revalida a cada 2 minutos para refletir novos relatórios enviados
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 2,
  });
}
