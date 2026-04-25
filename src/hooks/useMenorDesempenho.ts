import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type LowPerformerGM = {
  gm_id: string;
  nome_gm: string;
  faixa_etaria: string;
  nome_lider: string;
  congregacao: string;
  area_nome: string;
  total_decisoes: number;
  total_reconciliacoes: number;
  total_visitantes_nc: number;
};

export function useMenorDesempenho(area: string) {
  return useQuery({
    queryKey: ["menor-desempenho", area],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_menor_desempenho", {
        p_area_nome: area || "Todas"
      }).limit(5000); 

      if (error) throw error;
      return (data as LowPerformerGM[]) || [];
    }
  });
}
