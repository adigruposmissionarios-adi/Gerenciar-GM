import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { SETORES_MAP } from "@/lib/setores";

export type GMFrutoConsolidados = {
  gm_id: string;
  nome_gm: string;
  area_nome: string;
  congregacao: string;
  faixa_etaria: string;
  total_decisoes: number;
  total_reconciliacoes: number;
  data_recente: string;
  total_registros: number;
};

export type FrutosFilters = {
  setor: string;
  area: string;
  faixaEtaria: string;
  dataInicio: string;
  dataFim: string;
};

export function useRelatorioFrutos(filters: FrutosFilters) {
  return useQuery({
    queryKey: ["relatorio-frutos", filters],
    queryFn: async () => {
      const pageSize = 1000;
      let from = 0;
      let allData: any[] = [];

      // 🔄 Loop de busca paginada para bypass do limite de 1000
      while (true) {
        let q = supabase
          .from("relatorios_semanais")
          .select("*, grupos_missionarios!inner(faixa_etaria)")
          .range(from, from + pageSize - 1);

        // Aplicação de filtros de banco (Setor/Área/Data/Faixa Etária)
        if (filters.setor !== "Todos os setores") {
          const areasDoSetor = SETORES_MAP[filters.setor as keyof typeof SETORES_MAP] || [];
          q = q.in("area_nome", areasDoSetor);
        }
        if (filters.area !== "Todas as áreas") {
          q = q.eq("area_nome", filters.area);
        }
        if (filters.faixaEtaria !== "Todas as faixas") {
          q = q.eq("grupos_missionarios.faixa_etaria", filters.faixaEtaria);
        }
        if (filters.dataInicio) q = q.gte("data_gm", filters.dataInicio);
        if (filters.dataFim) q = q.lte("data_gm", filters.dataFim);

        const { data, error } = await q;
        if (error) throw error;
        if (!data || data.length === 0) break;

        allData.push(...data);
        if (data.length < pageSize) break; // Fim dos dados
        from += pageSize;
      }

      // 🧠 Lógica de Agrupamento por GM (gm_id)
      const groups: Record<string, GMFrutoConsolidados> = {};

      allData.forEach((rel) => {
        const id = rel.gm_id;
        if (!groups[id]) {
          groups[id] = {
            gm_id: id,
            nome_gm: rel.nome_gm,
            area_nome: rel.area_nome,
            congregacao: rel.congregacao,
            faixa_etaria: rel.grupos_missionarios?.faixa_etaria || "Não informada",
            total_decisoes: 0,
            total_reconciliacoes: 0,
            data_recente: rel.data_gm,
            total_registros: 0,
          };
        }

        groups[id].total_decisoes += Number(rel.decisao || 0);
        groups[id].total_reconciliacoes += Number(rel.reconciliacao || 0);
        groups[id].total_registros += 1;

        // Manter a data mais recente
        if (new Date(rel.data_gm) > new Date(groups[id].data_recente)) {
          groups[id].data_recente = rel.data_gm;
        }
      });

      // 🍇 Filtro Final: Apenas GMs com frutos (Decisões > 0 OU Reconciliações > 0)
      const datasetFinal = Object.values(groups).filter(
        (gm) => gm.total_decisoes > 0 || gm.total_reconciliacoes > 0
      );

      // Ordenar por data recente por padrão
      return datasetFinal.sort((a, b) => new Date(b.data_recente).getTime() - new Date(a.data_recente).getTime());
    }
  });
}
