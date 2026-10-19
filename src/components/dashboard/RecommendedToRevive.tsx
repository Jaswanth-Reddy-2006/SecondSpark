"use client";

import React from "react";
import { Project } from "@/types/project";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, AlertCircle, CheckCircle2, ListTodo } from "lucide-react";
import { DetailTab } from "@/components/dashboard/ProjectDetailModal";

interface RecommendedToReviveProps {
  projects: Project[];
  onInspect: (project: Project, initialTab?: DetailTab) => void;
  onExploreCompass: () => void;
  onSelectNeedsDecision?: () => void;
}

export function RecommendedToRevive({
  projects,
  onInspect,
  onExploreCompass,
  onSelectNeedsDecision,
}: RecommendedToReviveProps) {
  // Derive top revival candidates: worth revisiting, not already revived or archived
  const candidates = projects
    .filter(
      (p) =>
        p.worthRevisiting &&
        p.status !== "Revived" &&
        p.status !== "Archived"
    )
    .sort((a, b) => b.completionRate - a.completionRate)
    .slice(0, 3);

  // Projects needing a decision (no next action defined)
  const needsDecisionCount = projects.filter(
    (p) =>
      !p.nextAction &&
      p.status !== "Revived" &&
      p.status !== "Archived"
  ).length;

  if (candidates.length === 0 && needsDecisionCount === 0) {
    return null;
  }

  return (
    <div className="space-y-3.5">
      {/* Header with Compass link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#DAFBE1] border border-[#4AC26B]/40 flex items-center justify-center text-[#1A7F37]">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-[#1F2328] tracking-tight">
              Recommended to Revive
            </h2>
            <p className="text-xs text-[#59636E]">
              Evaluated from codebase completeness and solvable technical blockers.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onExploreCompass}
          className="text-xs font-medium text-[#0969DA] hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
        >
          <span>Explore Revival Compass</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Needs Decision Notice Banner (if any projects lack next steps) */}
      {needsDecisionCount > 0 && onSelectNeedsDecision && (
        <div className="p-3 rounded-md bg-[#FFF8C5] border border-[#D4A72C]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-[#9A6700]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              <strong>{needsDecisionCount} project{needsDecisionCount > 1 ? "s" : ""}</strong> in your graveyard have no recorded next step. Review blockers and assign a concrete action.
            </span>
          </div>
          <button
            type="button"
            onClick={onSelectNeedsDecision}
            className="text-xs font-semibold text-[#9A6700] hover:text-[#734c00] underline cursor-pointer shrink-0"
          >
            Filter Needs Decision &rarr;
          </button>
        </div>
      )}

      {/* Candidate Recommendation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {candidates.map((project) => {
          const completedCount = project.completedFeatures?.length || 0;
          const unfinishedCount = project.unfinishedFeatures?.length || 0;
          const primaryLanguage = project.techTags[0] || "TypeScript";

          // Generate honest, data-driven "Why now" summary
          const whyNow =
            completedCount > 0
              ? `${completedCount} core features are complete (${project.completionRate}% maturity), and ${unfinishedCount} unfinished tasks remain.`
              : `Codebase reached ${project.completionRate}% maturity before pausing.`;

          return (
            <div
              key={project.id}
              className="p-4 rounded-lg border border-[#D1D9E0] bg-white hover:border-[#0969DA]/60 hover:shadow-2xs transition-all flex flex-col justify-between group"
            >
              <div className="space-y-2.5">
                {/* Title & Language */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-[#1F2328] group-hover:text-[#0969DA] transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-xs text-[#59636E] line-clamp-1 mt-0.5">
                      {project.tagline}
                    </p>
                  </div>
                  <Badge variant="tech" className="shrink-0 text-[10px]">
                    {primaryLanguage}
                  </Badge>
                </div>

                {/* Why Now Reason Callout */}
                <div className="p-2.5 rounded-md bg-[#F6F8FA] border border-[#D1D9E0]/70 text-xs text-[#1F2328] space-y-1">
                  <span className="font-semibold text-[11px] text-[#0969DA] block font-mono">
                    Why now:
                  </span>
                  <p className="text-xs text-[#59636E] leading-relaxed line-clamp-2">
                    {whyNow} {project.mainBlockers ? `Key blocker: ${project.mainBlockers}` : ""}
                  </p>
                </div>

                {/* Metrics ribbon */}
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-[#59636E]">
                  <span className="flex items-center gap-1 text-[#1A7F37]">
                    <CheckCircle2 className="w-3 h-3 text-[#1F883D]" />
                    {completedCount} ready
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-[#9A6700]">
                    <ListTodo className="w-3 h-3 text-[#9A6700]" />
                    {unfinishedCount} pending
                  </span>
                  <span>•</span>
                  <span className="text-[#0969DA] font-semibold">
                    {project.completionRate}% maturity
                  </span>
                </div>

                {/* Defined Next Action snippet if present */}
                {project.nextAction && (
                  <div className="text-[11px] text-[#1F2328] bg-[#DDF4FF]/40 border border-[#54AEFF]/30 p-2 rounded-md font-mono line-clamp-1">
                    <span className="text-[#0969DA] font-bold">Next: </span>
                    {project.nextAction}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-3 mt-3 border-t border-[#D1D9E0]/60 flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#59636E]">
                  Status: {project.status}
                </span>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => onInspect(project, "revival")}
                  className="text-xs h-7 px-2.5 gap-1"
                >
                  <span>Revival Plan</span>
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
