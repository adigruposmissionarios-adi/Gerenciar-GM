import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type RelatorioCompleto = {
  id: number;
  data_gm: string;
  area_nome: string;
  congregacao: string;
  nome_gm: string;
  nome_lider: string;
  whatsapp: string;
  qtd_membros: number;
  visitantes_cristaos: number;
  visitantes_nao_cristaos: number;
  decisao: number;
  reconciliacao: number;
  gm_id: string;
  grupos_missionarios: {
    faixa_etaria: string;
  } | null;
};

export type RelatorioFilters = {
  area: string;
  dataInicio: string;
  dataFim: string;
  faixaEtaria: string;
  idRelatorio: string;
};

export function useRelatorioCompleto(filters: RelatorioFilters) {
  const queryClient = useQueryClient();

  // Query para os dados da TABELA (com limite de 1000 para performance)
  const query = useQuery({
    queryKey: ["relatorios-completos-lista", filters],
    queryFn: async () => {
      let q = supabase
        .from("relatorios_semanais")
        .select(`
          *,
          grupos_missionarios(faixa_etaria)
        `)
        .order("data_gm", { ascending: false })
        .limit(1000);

      if (filters.idRelatorio) {
        q = q.eq("id", parseInt(filters.idRelatorio) || 0);
      } else {
        if (filters.area && filters.area !== "Todas") q = q.eq("area_nome", filters.area);
        if (filters.dataInicio) q = q.gte("data_gm", filters.dataInicio);
        if (filters.dataFim) q = q.lte("data_gm", filters.dataFim);
      }

      const { data, error } = await q;
      if (error) throw error;
      let result = (data as RelatorioCompleto[]) || [];
      if (filters.faixaEtaria && filters.faixaEtaria !== "Todas") {
        result = result.filter(r => r.grupos_missionarios?.faixa_etaria === filters.faixaEtaria);
      }
      return result;
    }
  });

  // Query para as ESTATÍSTICAS TOTAIS (Via RPC no Banco de Dados)
  const statsQuery = useQuery({
    queryKey: ["relatorios-completos-stats", filters],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_relatorios_stats", {
        p_area_nome: filters.area || "Todas",
        p_data_inicio: filters.dataInicio || null,
        p_data_fim: filters.dataFim || null,
      });

      if (error) throw error;
      const stats = data[0] || { total_reunioes: 0, total_decisoes: 0, total_reconciliacoes: 0 };
      
      return {
        totalReunioes: Number(stats.total_reunioes),
        totalDecisoes: Number(stats.total_decisoes),
        totalReconciliacoes: Number(stats.total_reconciliacoes),
      };
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("relatorios_semanais").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["relatorios-completos-lista"] });
      queryClient.invalidateQueries({ queryKey: ["relatorios-completos-stats"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    }
  });

  return {
    ...query,
    stats: statsQuery.data || { totalReunioes: 0, totalDecisoes: 0, totalReconciliacoes: 0 },
    isStatsLoading: statsQuery.isLoading,
    deleteRelatorio: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending
  };
}

export function useTotalGms(area: string, faixaEtaria: string) {
  return useQuery({
    queryKey: ["total-gms-filtrado", area, faixaEtaria],
    queryFn: async () => {
      let q = supabase
        .from("grupos_missionarios")
        .select("*", { count: "exact", head: true });

      if (area && area !== "Todas") q = q.eq("area_nome", area);
      if (faixaEtaria && faixaEtaria !== "Todas") q = q.eq("faixa_etaria", faixaEtaria);

      const { count, error } = await q;
      if (error) throw error;
      return count || 0;
    }
  });
}
