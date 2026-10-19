"use client";

import React from "react";
import { Project } from "@/types/project";
import { Badge } from "@/components/ui/badge";
import {
  GitBranch,
  Globe,
  BookMarked,
  Star,
  ArrowRight,
  AlertTriangle,
  Sparkles,
  Lock,
} from "lucide-react";
import { DetailTab } from "@/components/dashboard/ProjectDetailModal";

interface ProjectCardProps {
  project: Project;
  onInspect: (project: Project, initialTab?: DetailTab) => void;
  onQuickRevive?: (projectId: string) => void;
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178C6",
  JavaScript: "#F7DF1E",
  Python: "#3572A5",
  Rust: "#DEA584",
  Go: "#00ADD8",
  WebAssembly: "#654FF0",
  SQLite: "#003B57",
  Tailwind: "#38BDF8",
  React: "#61DAFB",
  Default: "#8C959F",
};

export function ProjectCard({
  project,
  onInspect,
}: ProjectCardProps) {
  const primaryLanguage = project.techTags[0] || "TypeScript";
  const langColor = LANGUAGE_COLORS[primaryLanguage] || LANGUAGE_COLORS.Default;

  // Maximum tags to display before folding into +N
  const visibleTags = project.techTags.slice(0, 3);
  const remainingTags = project.techTags.length - visibleTags.length;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onInspect(project)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onInspect(project);
        }
      }}
      className="group flex flex-col justify-between h-full bg-white border border-[#D1D9E0] hover:border-[#0969DA]/60 hover:shadow-2xs rounded-lg p-4 sm:p-4.5 transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0969DA]/20 select-none text-left"
    >
      <div className="space-y-3">
        {/* Top Header: Name & Status */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <BookMarked className="w-3.5 h-3.5 text-[#59636E] shrink-0" />
              <h3 className="text-sm font-semibold text-[#0969DA] group-hover:underline truncate">
                {project.name}
              </h3>
              {project.repoUrl && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(project.repoUrl, "_blank", "noopener,noreferrer");
                  }}
                  className="p-0.5 text-[#59636E] hover:text-[#1F2328] transition-colors"
                  title="Source repository"
                >
                  <GitBranch className="w-3 h-3" />
                </span>
              )}
              {project.demoUrl && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(project.demoUrl, "_blank", "noopener,noreferrer");
                  }}
                  className="p-0.5 text-[#59636E] hover:text-[#1F2328] transition-colors"
                  title="Live preview"
                >
                  <Globe className="w-3 h-3" />
                </span>
              )}
            </div>

            {/* Tagline / Short description */}
            <p className="text-xs text-[#59636E] line-clamp-1 mt-1 leading-snug">
              {project.tagline || project.description}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-1.5 flex-wrap justify-end">
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border ${
                project.isPublic
                  ? "bg-[#DAFBE8] text-[#1F883D] border-[#1F883D]/30"
                  : "bg-[#F6F8FA] text-[#59636E] border-[#D1D9E0]"
              }`}
              title={
                project.isPublic
                  ? "Public Community Graveyard: Discoverable by other developers"
                  : "Private Vault: Visible only to your account"
              }
            >
              {project.isPublic ? (
                <>
                  <Globe className="w-2.5 h-2.5 text-[#1F883D]" />
                  <span>Public</span>
                </>
              ) : (
                <>
                  <Lock className="w-2.5 h-2.5 text-[#59636E]" />
                  <span>Private</span>
                </>
              )}
            </span>
            <Badge status={project.status} withIcon />
          </div>
        </div>

        {/* 1. Why was it abandoned? */}
        <div className="p-2 rounded bg-[#F6F8FA] border border-[#D1D9E0]/60 text-[11px] leading-relaxed text-[#59636E]">
          <span className="font-semibold text-[#1F2328] inline-flex items-center gap-1">
            <AlertTriangle className="w-2.5 h-2.5 text-[#9A6700]" />
            Why stalled:
          </span>{" "}
          <span className="line-clamp-2 italic">
            &ldquo;{project.abandonedReason}&rdquo;
          </span>
        </div>

        {/* 2. What can I do next? */}
        {project.nextAction ? (
          <div className="p-2 rounded bg-[#DDF4FF]/40 border border-[#54AEFF]/30 text-[11px] font-mono text-[#1F2328] flex items-start gap-1.5">
            <Sparkles className="w-3 h-3 text-[#0969DA] shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1 truncate">
              <span className="font-semibold text-[#0969DA]">Next Action: </span>
              <span>{project.nextAction}</span>
            </div>
          </div>
        ) : (
          <div className="p-1.5 px-2 rounded bg-[#FFF8C5]/50 border border-[#D4A72C]/40 text-[11px] font-mono text-[#9A6700] flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span>⚠️</span>
              <span>Next action unassigned</span>
            </span>
            <span className="text-[10px] underline font-semibold">Assign &rarr;</span>
          </div>
        )}

        {/* Codebase Maturity Progress Bar */}
        <div className="space-y-1 pt-0.5">
          <div className="flex justify-between text-[10px] font-mono text-[#59636E]">
            <span>Maturity</span>
            <span className="text-[#1F2328] font-bold">{project.completionRate}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[#D1D9E0]/50 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                project.status === "Revived"
                  ? "bg-[#1F883D]"
                  : project.worthRevisiting
                  ? "bg-[#0969DA]"
                  : "bg-[#8C959F]"
              }`}
              style={{ width: `${project.completionRate}%` }}
            />
          </div>
        </div>

        {/* Autopsy & Bit-Rot indicator if available */}
        {project.autopsy && (
          <div className="flex items-center justify-between text-[10px] font-mono px-2 py-1 rounded bg-[#F6F8FA] border border-[#D1D9E0]/70">
            <span className="flex items-center gap-1.5 text-[#59636E]">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  project.autopsy.rotSeverity === "healthy"
                    ? "bg-[#1F883D]"
                    : project.autopsy.rotSeverity === "mild"
                    ? "bg-[#D97706]"
                    : "bg-[#CF222E]"
                }`}
              />
              <span>Bit-Rot: {project.autopsy.rotIndex}/100</span>
            </span>
            <span className="font-semibold text-[#1F2328]">
              {project.autopsy.effortSize === "weekend_hack"
                ? "Weekend Hack"
                : project.autopsy.effortSize === "sprint"
                ? "Sprint (1–2w)"
                : "Arch. Dig"}
            </span>
          </div>
        )}

        {/* Technology tags */}
        <div className="flex flex-wrap items-center gap-1 pt-0.5">
          {visibleTags.map((tech) => (
            <Badge key={tech} variant="tech" className="text-[10px] py-0 px-1.5">
              {tech}
            </Badge>
          ))}
          {remainingTags > 0 && (
            <span className="text-[10px] font-mono text-[#59636E]">
              +{remainingTags}
            </span>
          )}
        </div>
      </div>

      {/* Card Footer: Metadata & Quick Inspect CTA */}
      <div className="pt-3 mt-3 border-t border-[#D1D9E0]/60 flex items-center justify-between text-[11px] font-mono text-[#59636E]">
        {/* Primary Language */}
        <div className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: langColor }}
          />
          <span className="text-xs text-[#1F2328] font-medium">{primaryLanguage}</span>
        </div>

        {/* Updated date & action link */}
        <div className="flex items-center gap-2">
          {project.stars !== undefined && project.stars > 0 && (
            <span className="flex items-center gap-0.5 text-[#59636E]">
              <Star className="w-3 h-3 text-[#59636E]" />
              {project.stars}
            </span>
          )}
          <span>{project.lastActiveDate || project.lastUpdated}</span>
          <span className="text-[#0969DA] font-semibold flex items-center group-hover:translate-x-0.5 transition-transform">
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
}
