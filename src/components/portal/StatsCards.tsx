import { Users, CalendarCheck, HeartHandshake, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useStats } from "@/hooks/useStats";

type StatConfig = {
  title: string;
  key: "totalGms" | "reunioesSemana" | "decisoesSemana" | "reconciliacoesSemana";
  caption: string;
  icon: LucideIcon;
  accent: string;
  iconColor: string;
};

const statConfigs: StatConfig[] = [
  {
    title: "GM's cadastrados",
    key: "totalGms",
    caption: "Total cadastrados",
    icon: Users,
    accent: "bg-action-blue-strong/10",
    iconColor: "text-action-blue-strong",
  },
  {
    title: "Reuniões na semana",
    key: "reunioesSemana",
    caption: "Semana atual",
    icon: CalendarCheck,
    accent: "bg-gold/20",
    iconColor: "text-gold-deep",
  },
  {
    title: "Decisões",
    key: "decisoesSemana",
    caption: "Total na semana",
    icon: Sparkles,
    accent: "bg-action-green/15",
    iconColor: "text-action-green",
  },
  {
    title: "Reconciliações",
    key: "reconciliacoesSemana",
    caption: "Total na semana",
    icon: HeartHandshake,
    accent: "bg-action-blue-light/20",
    iconColor: "text-action-blue-medium",
  },
];

export function StatsCards() {
  const { data: stats, isLoading } = useStats();

  return (
    <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {statConfigs.map((s) => {
        const Icon = s.icon;
        const value = isLoading ? "—" : (stats?.[s.key] ?? 0);
        return (
          <div
            key={s.title}
            className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 sm:p-6 transition-all hover:-translate-y-0.5"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div
              className={`absolute -right-6 -top-6 h-20 w-20 sm:-right-8 sm:-top-8 sm:h-28 sm:w-28 rounded-full ${s.accent} blur-sm transition-transform group-hover:scale-110`}
              aria-hidden
            />
            <div className="relative flex items-start justify-between">
              <p className="text-[10px] sm:text-sm font-semibold uppercase tracking-wide text-muted-foreground leading-tight">
                {s.title}
              </p>
              <Icon className={`h-4 w-4 sm:h-5 sm:w-5 shrink-0 ${s.iconColor}`} />
            </div>
            <p className={`relative mt-2 sm:mt-4 text-3xl sm:text-5xl font-black tracking-tight text-foreground ${isLoading ? "animate-pulse" : ""}`}>
              {value}
            </p>
            <p className="relative mt-1 sm:mt-2 text-[10px] sm:text-xs font-medium text-muted-foreground">{s.caption}</p>
          </div>
        );
      })}
    </section>
  );
}
