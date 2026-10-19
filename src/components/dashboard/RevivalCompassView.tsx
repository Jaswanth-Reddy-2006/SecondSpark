"use client";

import React from "react";
import { Project } from "@/types/project";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Compass, AlertTriangle, CheckCircle2, ArrowRight, Zap, BookMarked } from "lucide-react";

interface RevivalCompassViewProps {
  projects: Project[];
  onInspect: (project: Project) => void;
  onSwitchToOverview: () => void;
}

export function RevivalCompassView({
  projects,
  onInspect,
  onSwitchToOverview,
}: RevivalCompassViewProps) {
  const viableProjects = projects.filter((p) => p.worthRevisiting);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Overview Banner */}
      <div className="p-5 sm:p-6 rounded-lg border border-[#D1D9E0] bg-[#F6F8FA]">
        <div className="flex items-center gap-2 text-xs font-mono text-[#0969DA] mb-1.5 font-medium">
          <Compass className="w-4 h-4 text-[#0969DA]" />
          <span>Rule-Based Viability Diagnostics</span>
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-[#1F2328] tracking-tight">
          Revival Compass: High-Yield Candidates
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-[#59636E] max-w-2xl leading-relaxed">
          The Revival Compass uses transparent, rule-based criteria (codebase completion rate, dormancy duration, and modern runtime tags) to highlight which abandoned repositories have the highest probability of successful resurrection.
        </p>
      </div>

      {/* Viability Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 sm:p-5 rounded-lg border border-[#D1D9E0] bg-white shadow-2xs">
          <div className="flex items-center gap-2 text-[#0969DA] mb-1.5">
            <Zap className="w-4 h-4" />
            <h3 className="text-xs font-semibold text-[#1F2328]">Viable Codebases</h3>
          </div>
          <p className="text-2xl font-bold font-mono text-[#1F2328]">
            {viableProjects.length} of {projects.length}
          </p>
          <p className="mt-1 text-xs text-[#59636E]">
            Prototypes with &ge;60% architecture complete and clear problem scopes.
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-lg border border-[#D1D9E0] bg-white shadow-2xs">
          <div className="flex items-center gap-2 text-[#1A7F37] mb-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <h3 className="text-xs font-semibold text-[#1F2328]">Modern Runtimes</h3>
          </div>
          <p className="text-2xl font-bold font-mono text-[#1F2328]">
            {projects.length > 0
              ? Math.round(
                  (projects.filter((p) =>
                    p.techTags.some((t) =>
                      ["TypeScript", "Next.js", "React", "Rust", "Go"].includes(t)
                    )
                  ).length /
                    projects.length) *
                    100
                )
              : 0}
            %
          </p>
          <p className="mt-1 text-xs text-[#59636E]">
            Repositories built with contemporary language standards and LTS runtimes.
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-lg border border-[#D1D9E0] bg-white shadow-2xs">
          <div className="flex items-center gap-2 text-[#9A6700] mb-1.5">
            <AlertTriangle className="w-4 h-4" />
            <h3 className="text-xs font-semibold text-[#1F2328]">Pending Review</h3>
          </div>
          <p className="text-2xl font-bold font-mono text-[#1F2328]">
            {projects.filter((p) => p.status === "Under Review").length}
          </p>
          <p className="mt-1 text-xs text-[#59636E]">
            Projects actively undergoing architectural audit for potential revival.
          </p>
        </div>
      </div>

      {/* Recommended Candidates for Immediate Revival */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#1F2328] tracking-tight">
            Top Ranked Candidates for Immediate Revival
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSwitchToOverview}
            className="text-xs text-[#0969DA] hover:underline p-0 h-auto"
          >
            View full graveyard &rarr;
          </Button>
        </div>

        {viableProjects.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-lg border border-[#D1D9E0] text-xs text-[#59636E]">
            No projects evaluated as high-yield candidates yet. Add or import projects to calculate revival viability.
          </div>
        ) : (
          <div className="space-y-2.5">
            {viableProjects.map((project, rank) => (
            <div
              key={project.id}
              className="p-4 rounded-lg border border-[#D1D9E0] bg-white hover:border-[#AFB8C1] shadow-2xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
              onClick={() => onInspect(project)}
            >
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-md bg-[#F6F8FA] border border-[#D1D9E0] flex items-center justify-center font-mono font-bold text-[#1F883D] text-xs shrink-0 mt-0.5">
                  #{rank + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-semibold text-[#0969DA] hover:underline flex items-center gap-1.5">
                      <BookMarked className="w-3.5 h-3.5 text-[#59636E]" />
                      {project.name}
                    </h4>
                    <Badge status={project.status} />
                    <span className="text-xs font-mono text-[#1A7F37] bg-[#DAFBE1] border border-[#4AC26B]/40 px-2 py-0.2 rounded-full font-semibold">
                      {project.completionRate}% Done
                    </span>
                  </div>
                  <p className="text-xs text-[#59636E] mt-1 line-clamp-1">
                    {project.tagline || project.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onInspect(project);
                  }}
                  className="text-xs gap-1"
                >
                  Inspect Tombstone
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
}
