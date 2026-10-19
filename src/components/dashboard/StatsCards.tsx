import React from "react";
import { DashboardStats } from "@/types/project";
import { Layers, Compass, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
  stats: DashboardStats;
  selectedFilter: string;
  onSelectFilter: (filter: string) => void;
}

export function StatsCards({ stats, selectedFilter, onSelectFilter }: StatsCardsProps) {
  const cards = [
    {
      id: "All",
      title: "Total Projects",
      value: stats.totalProjects,
      description: "Dormant codebases in vault",
      icon: Layers,
      color: "text-[#1F2328]",
      accentBg: "bg-[#F6F8FA]",
      borderActive: "border-[#1F883D] ring-2 ring-[#1F883D]/10 bg-[#F6F8FA]/60",
    },
    {
      id: "Worth Revisiting",
      title: "Ready to Review",
      value: stats.readyToReview,
      description: "Manageable blockers & high potential",
      icon: Compass,
      color: "text-[#0969DA]",
      accentBg: "bg-[#DDF4FF]",
      borderActive: "border-[#0969DA] ring-2 ring-[#0969DA]/10 bg-[#DDF4FF]/20",
    },
    {
      id: "Needs Decision",
      title: "Needs a Decision",
      value: stats.needsDecision,
      description: "Awaiting concrete next action",
      icon: AlertCircle,
      color: "text-[#9A6700]",
      accentBg: "bg-[#FFF8C5]",
      borderActive: "border-[#9A6700] ring-2 ring-[#9A6700]/10 bg-[#FFF8C5]/20",
    },
    {
      id: "Revived",
      title: "Revived Projects",
      value: stats.revivedProjects,
      description: "Resurrected to active development",
      icon: CheckCircle2,
      color: "text-[#1A7F37]",
      accentBg: "bg-[#DAFBE1]",
      borderActive: "border-[#1F883D] ring-2 ring-[#1F883D]/10 bg-[#DAFBE1]/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = selectedFilter === card.id;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectFilter(card.id)}
            className={cn(
              "p-4 rounded-lg border border-[#D1D9E0] bg-white text-left transition-all duration-150 cursor-pointer hover:border-[#AFB8C1] shadow-2xs select-none",
              isActive && card.borderActive
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#59636E]">
                {card.title}
              </span>
              <div
                className={cn(
                  "w-7 h-7 rounded-md flex items-center justify-center border border-[#D1D9E0]/60",
                  card.accentBg
                )}
              >
                <Icon className={cn("w-3.5 h-3.5", card.color)} />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-[#1F2328] tracking-tight">
                {card.value}
              </span>
            </div>

            <p className="mt-1 text-xs text-[#59636E] truncate">
              {card.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}
