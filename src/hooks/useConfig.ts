import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useConfig() {
  return useQuery({
    queryKey: ["config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("configuracoes")
        .select("*");
      if (error) throw error;
      
      // Transform list to key-value object
      return (data || []).reduce((acc: any, curr: any) => {
        acc[curr.id] = curr.valor;
        return acc;
      }, {});
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
