import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export type Area = {
  id: string;
  nome: string;
  setor_nome: string | null;
  created_at: string;
};

export type Congregacao = {
  id: string;
  nome: string;
  area_id: string;
  created_at: string;
};

export function useDomain() {
  const { data: areas, isLoading: isLoadingAreas, refetch: refetchAreas } = useQuery<Area[]>({
    queryKey: ['domain_areas'],
    queryFn: async () => {
      const { data, error } = await supabase.from('areas').select('*').order('nome');
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 min
  });

  const { data: congregacoes, isLoading: isLoadingCong, refetch: refetchCong } = useQuery<Congregacao[]>({
    queryKey: ['domain_congregacoes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('congregacoes').select('*').order('nome');
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  return {
    areas: areas || [],
    congregacoes: congregacoes || [],
    isLoading: isLoadingAreas || isLoadingCong,
    refetch: () => {
      refetchAreas();
      refetchCong();
    }
  };
}
