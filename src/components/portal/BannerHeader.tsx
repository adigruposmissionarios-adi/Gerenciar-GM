import { memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

async function fetchBannerUrl() {
  const { data, error } = await supabase
    .from("configuracoes")
    .select("valor")
    .eq("id", "banner_url")
    .single();

  if (error) {
    console.error("Erro ao carregar banner:", error);
    return null;
  }
  return data?.valor;
}

export const BannerHeader = memo(function BannerHeader() {
  const { data: bannerUrl, isLoading } = useQuery({
    queryKey: ["config_banner"],
    queryFn: fetchBannerUrl,
    staleTime: 1000 * 60 * 10, // Cache por 10 minutos
  });

  // Estado de carregamento sutil para evitar pulos na tela
  if (isLoading) {
    return (
      <header className="relative w-full bg-slate-100 animate-pulse aspect-[4/1.5] sm:aspect-[4/1.2] md:aspect-[3/1]" />
    );
  }

  return (
    <header className="relative w-full overflow-hidden bg-[#fafafa]">
      {bannerUrl ? (
        /* Caso o administrador tenha configurado uma imagem */
        <div className="relative w-full aspect-[4/1.5] sm:aspect-[4/1] md:aspect-[5/1.5] lg:aspect-[4/1]">
          <img 
            src={bannerUrl} 
            alt="Banner Grupos Missionários" 
            className="h-full w-full object-cover object-center transition-opacity duration-500"
          />
          {/* Sombreamento inferior para suavizar a transicao com o restante da pagina */}
          <div className="absolute bottom-0 left-0 h-16 w-full bg-gradient-to-t from-white/20 to-transparent" />
        </div>
      ) : (
        /* Fallback de seguranca caso o banco esteja vazio ou de erro */
        <div className="px-4 py-16 pb-24 text-center bg-slate-900">
           <h1 className="text-3xl font-black text-white sm:text-5xl uppercase">
             ADI Grupos Missionários
           </h1>
        </div>
      )}
    </header>
  );
});
