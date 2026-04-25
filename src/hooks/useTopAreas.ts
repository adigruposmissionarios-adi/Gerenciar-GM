import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

type TopArea = {
  area: string;
  count: number;
};

export function useTopAreas() {
  return useQuery({
    queryKey: ["top-areas"],
    queryFn: async (): Promise<TopArea[]> => {
      const { data, error } = await supabase
        .from("grupos_missionarios")
        .select("area_nome");

      if (error) {
        throw new Error(error.message);
      }

      const areaCounts: Record<string, number> = {};

      data?.forEach((row) => {
        const area = row.area_nome?.trim() || "Sem Área";
        areaCounts[area] = (areaCounts[area] || 0) + 1;
      });

      const sorted: TopArea[] = Object.entries(areaCounts)
        .map(([area, count]) => ({ area, count }))
        .sort((a, b) => b.count - a.count);

      return sorted.slice(0, 10);
    },
    // Revalida a cada 2 minutos para refletir novos cadastros automaticamente
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 2,
  });
}
