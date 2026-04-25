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
  const { start, end } = getCurrentWeekRange();

  // Chama a função otimizada no servidor
  const { data, error } = await supabase
    .rpc('get_weekly_stats', { 
      start_date: start, 
      end_date: end 
    });

  if (error) {
    console.error("Erro ao buscar stats otimizadas:", error);
    throw error;
  }

  // A função retorna um array com um objeto
  const result = data[0];

  return {
    totalGms:              Number(result.total_gms)            ?? 0,
    reunioesSemana:        Number(result.reunioes_semana)      ?? 0,
    decisoesSemana:        Number(result.decisoes_semana)      ?? 0,
    reconciliacoesSemana:  Number(result.reconciliacoes_semana)?? 0,
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
