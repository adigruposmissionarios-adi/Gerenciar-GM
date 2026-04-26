import { memo } from "react";
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
    bg: "bg-blue-600",
    hover: "hover:bg-blue-700",
  },
  {
    id: "cadastrar",
    label: "CADASTRAR GM",
    icon: UserPlus,
    bg: "bg-blue-500",
    hover: "hover:bg-blue-600",
  },
  {
    id: "atualizar",
    label: "ATUALIZAR DADOS DO GM",
    icon: RefreshCw,
    bg: "bg-blue-400",
    hover: "hover:bg-blue-500",
  },
  {
    id: "relatorio",
    label: "ENVIAR RELATÓRIO SEMANAL",
    icon: Send,
    bg: "bg-green-600",
    hover: "hover:bg-green-700",
  },
];

interface ActionButtonsProps {
  onOpenDialog: (id: string) => void;
  activeDialog?: string | null;
  onClose?: () => void;
}

export const ActionButtons = memo(function ActionButtons({ onOpenDialog, activeDialog, onClose }: ActionButtonsProps) {
  
  if (activeDialog) {
    return (
      <>
        {activeDialog === "acompanhar" && <AcompanharDialog open={true} onClose={onClose!} />}
        {activeDialog === "cadastrar" && <CadastrarGMDialog open={true} onClose={onClose!} />}
        {activeDialog === "atualizar" && <AtualizarGMDialog open={true} onClose={onClose!} />}
        {activeDialog === "relatorio" && <EnviarRelatorioDialog open={true} onClose={onClose!} />}
      </>
    );
  }

  return (
    <section className="grid grid-cols-1 gap-4 sm:flex sm:flex-col">
      {actions.map((a) => {
        const Icon = a.icon;
        return (
          <button
            key={a.id}
            type="button"
            onClick={() => onOpenDialog(a.id)}
            className={`group relative flex h-16 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl ${a.bg} ${a.hover} px-6 text-base font-bold tracking-wide text-white shadow-md transition-all active:scale-95 md:h-[72px] md:text-lg`}
          >
            <Icon className="h-5 w-5 shrink-0 opacity-90" />
            <span className="text-center leading-tight uppercase">{a.label}</span>
            <ArrowRight className="absolute right-6 hidden sm:block h-5 w-5 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
          </button>
        );
      })}
    </section>
  );
});
