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
    .rpc('get_top_10_gms', { 
      start_date: start, 
      end_date: end 
    });

  if (error) {
    console.error("Erro ao buscar Top 10 otimizado:", error);
    throw error;
  }

  return (data ?? []).map(r => ({
    gm: r.gm,
    leader: r.leader,
    congregation: r.congregation,
    area: r.area,
    faixa_etaria: r.faixa_etaria || "—",
    decisions: Number(r.decisions),
    reconciliations: Number(r.reconciliations),
    visitantesNaoCristaos: Number(r.visitantes_nao_cristaos)
  }));
}

export function useTop10() {
  return useQuery<Top10Row[]>({
    queryKey: ["top10"],
    queryFn: fetchTop10,
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 2,
  });
}
