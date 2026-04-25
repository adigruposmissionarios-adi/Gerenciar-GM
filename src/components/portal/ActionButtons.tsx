import { memo, useState } from "react";
import { ArrowRight, Eye, UserPlus, RefreshCw, Send } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CadastrarGMDialog } from "./CadastrarGMDialog";
import { AtualizarGMDialog } from "./AtualizarGMDialog";
import { EnviarRelatorioDialog } from "./EnviarRelatorioDialog";
import { AcompanharDialog } from "./AcompanharDialog";

type Action = {
  id: string;
  label: string;
  icon: LucideIcon;
  bg: string;
  hover: string;
};

const actions: Action[] = [
  {
    id: "acompanhar",
    label: "ACOMPANHAR MEUS GM'S",
    icon: Eye,
    bg: "bg-action-blue-strong",
    hover: "hover:brightness-110",
  },
  {
    id: "cadastrar",
    label: "CADASTRAR GM",
    icon: UserPlus,
    bg: "bg-action-blue-medium",
    hover: "hover:brightness-110",
  },
  {
    id: "atualizar",
    label: "ATUALIZAR DADOS DO GM",
    icon: RefreshCw,
    bg: "bg-action-blue-light",
    hover: "hover:brightness-110",
  },
  {
    id: "relatorio",
    label: "ENVIAR RELATÓRIO SEMANAL",
    icon: Send,
    bg: "bg-action-green",
    hover: "hover:brightness-110",
  },
];

export const ActionButtons = memo(function ActionButtons() {
  const [acompanharOpen, setAcompanharOpen] = useState(false);
  const [cadastrarOpen, setCadastrarOpen] = useState(false);
  const [atualizarOpen, setAtualizarOpen] = useState(false);
  const [relatorioOpen, setRelatorioOpen] = useState(false);

  function handleClick(id: string) {
    if (id === "acompanhar") {
      setAcompanharOpen(true);
    } else if (id === "cadastrar") {
      setCadastrarOpen(true);
    } else if (id === "atualizar") {
      setAtualizarOpen(true);
    } else if (id === "relatorio") {
      setRelatorioOpen(true);
    }
  }

  return (
    <>
      <section className="grid grid-cols-2 gap-3 sm:flex sm:flex-col">
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => handleClick(a.id)}
              className={`group relative flex h-14 sm:h-16 w-full items-center justify-center gap-2 sm:gap-3 overflow-hidden rounded-2xl ${a.bg} ${a.hover} px-3 sm:px-6 text-xs sm:text-base font-bold tracking-wide text-action-foreground shadow-md transition-all hover:-translate-y-0.5 md:h-[72px] md:text-lg`}
            >
              <Icon className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 opacity-90" />
              <span className="text-center leading-tight">{a.label}</span>
              <ArrowRight className="absolute right-4 sm:right-6 hidden sm:block h-5 w-5 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
            </button>
          );
        })}
      </section>

      {acompanharOpen && (
        <AcompanharDialog
          open={acompanharOpen}
          onClose={() => setAcompanharOpen(false)}
        />
      )}
  
      {cadastrarOpen && (
        <CadastrarGMDialog
          open={cadastrarOpen}
          onClose={() => setCadastrarOpen(false)}
        />
      )}
        
      {atualizarOpen && (
        <AtualizarGMDialog
           open={atualizarOpen}
           onClose={() => setAtualizarOpen(false)}
        />
      )}
  
      {relatorioOpen && (
        <EnviarRelatorioDialog
          open={relatorioOpen}
          onClose={() => setRelatorioOpen(false)}
        />
      )}
    </>
  );
});
