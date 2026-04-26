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
    bg: "bg-[#2563EB]", // Blue 600
    hover: "hover:bg-[#1E40AF]",
  },
  {
    id: "cadastrar",
    label: "CADASTRAR GM",
    icon: UserPlus,
    bg: "bg-[#3B82F6]", // Blue 500
    hover: "hover:bg-[#2563EB]",
  },
  {
    id: "atualizar",
    label: "ATUALIZAR DADOS DO GM",
    icon: RefreshCw,
    bg: "bg-[#60A5FA]", // Blue 400
    hover: "hover:bg-[#3B82F6]",
  },
  {
    id: "relatorio",
    label: "ENVIAR RELATÓRIO SEMANAL",
    icon: Send,
    bg: "bg-[#059669]", // Green 600
    hover: "hover:bg-[#047857]",
  },
];

export const ActionButtons = memo(function ActionButtons() {
  const [acompanharOpen, setAcompanharOpen] = useState(false);
  const [cadastrarOpen, setCadastrarOpen] = useState(false);
  const [atualizarOpen, setAtualizarOpen] = useState(false);
  const [relatorioOpen, setRelatorioOpen] = useState(false);

  function handleClick(id: string) {
    if (id === "acompanhar") setAcompanharOpen(true);
    else if (id === "cadastrar") setCadastrarOpen(true);
    else if (id === "atualizar") setAtualizarOpen(true);
    else if (id === "relatorio") setRelatorioOpen(true);
  }

  return (
    <>
      <section className="grid grid-cols-2 gap-4 sm:flex sm:flex-col">
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => handleClick(a.id)}
              className={`group relative flex h-16 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl ${a.bg} ${a.hover} px-4 text-sm font-black tracking-tight text-white shadow-lg transition-all hover:-translate-y-0.5 active:scale-95 sm:h-20 sm:text-xl`}
            >
              <Icon className="h-5 w-5 shrink-0 opacity-90 sm:h-6 sm:w-6" />
              <span className="text-center leading-tight uppercase">{a.label}</span>
              <ArrowRight className="absolute right-6 hidden sm:block h-6 w-6 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
            </button>
          );
        })}
      </section>

      {acompanharOpen && (
        <AcompanharDialog open={true} onClose={() => setAcompanharOpen(false)} />
      )}
      {cadastrarOpen && (
        <CadastrarGMDialog open={true} onClose={() => setCadastrarOpen(false)} />
      )}
      {atualizarOpen && (
        <AtualizarGMDialog open={true} onClose={() => setAtualizarOpen(false)} />
      )}
      {relatorioOpen && (
        <EnviarRelatorioDialog open={true} onClose={() => setRelatorioOpen(false)} />
      )}
    </>
  );
});
