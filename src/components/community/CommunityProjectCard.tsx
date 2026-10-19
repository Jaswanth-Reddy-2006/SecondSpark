"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  GitBranch,
  Globe,
  Star,
  Users,
  Compass,
  MessageSquare,
  AlertTriangle,
  ArrowRight,
  Award,
} from "lucide-react";
import { Project } from "@/types/project";
import { CollaborationStatus } from "@/types/community";

export interface CommunityProjectCardData extends Project {
  slug?: string;
  suggestionsCount?: number;
  openTasksCount?: number;
  collaborationStatus?: CollaborationStatus;
  skillsNeeded?: string[];
  ratingsCount?: number;
  ratingAverage?: number;
  author: {
    id?: string;
    name: string;
    avatar: string;
    handle: string;
    image?: string;
    xp?: number;
    level?: number;
  };
}

interface CommunityProjectCardProps {
  project: CommunityProjectCardData;
  onSelect: (project: CommunityProjectCardData, initialTab?: string) => void;
}

const COLLAB_STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  open_to_collaborators: {
    label: "Open to Collaborators",
    bg: "bg-[#DDF4FF]",
    text: "text-[#0969DA]",
    border: "border-[#54AEFF]/40",
  },
  open_to_adoption: {
    label: "Seeking New Maintainer",
    bg: "bg-[#FFF8C5]",
    text: "text-[#9A6700]",
    border: "border-[#D4A72C]/40",
  },
  feedback_only: {
    label: "Feedback & Reviews Only",
    bg: "bg-[#F6F8FA]",
    text: "text-[#59636E]",
    border: "border-[#D1D9E0]",
  },
  invitation_only: {
    label: "Invitation Only",
    bg: "bg-[#FBEFFF]",
    text: "text-[#8250DF]",
    border: "border-[#D2A8FF]/40",
  },
  closed: {
    label: "Closed to Contributions",
    bg: "bg-[#F6F8FA]",
    text: "text-[#8C959F]",
    border: "border-[#D1D9E0]",
  },
};

export function CommunityProjectCard({ project, onSelect }: CommunityProjectCardProps) {
  const collabConfig =
    COLLAB_STATUS_CONFIG[project.collaborationStatus || "feedback_only"] ||
    COLLAB_STATUS_CONFIG.feedback_only;

  const visibleTech = project.techTags.slice(0, 3);
  const remainingTech = project.techTags.length - visibleTech.length;

  const skills = project.skillsNeeded || [];
  const visibleSkills = skills.slice(0, 3);
  const remainingSkills = skills.length - visibleSkills.length;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(project, "overview")}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(project, "overview");
        }
      }}
      className="group flex flex-col justify-between h-full bg-white border border-[#D1D9E0] hover:border-[#0969DA]/60 hover:shadow-xs rounded-lg p-4 sm:p-5 transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0969DA]/20 select-none text-left"
    >
      <div className="space-y-3.5">
        {/* Top Header: Author, Project Title, and Collab Status */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            {/* Author Profile */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full bg-[#1F883D]/10 border border-[#1F883D]/30 flex items-center justify-center text-[10px] font-bold text-[#1F883D] shrink-0">
                {project.author.avatar || "DR"}
              </div>
              <div className="min-w-0 flex items-center gap-1.5 truncate">
                <span className="text-xs font-semibold text-[#1F2328] truncate">
                  {project.author.name}
                </span>
                <span className="text-[11px] text-[#59636E] truncate">
                  {project.author.handle}
                </span>
                {project.author.level && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#F6F8FA] border border-[#D1D9E0] text-[#59636E]">
                    <Award className="w-2.5 h-2.5 text-[#9A6700]" />
                    Lv.{project.author.level}
                  </span>
                )}
              </div>
            </div>

            {/* Status & Collaboration Badges */}
            <div className="shrink-0 flex items-center gap-1.5 flex-wrap justify-end">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border ${collabConfig.bg} ${collabConfig.text} ${collabConfig.border}`}
              >
                <Users className="w-2.5 h-2.5" />
                <span>{collabConfig.label}</span>
              </span>
            </div>
          </div>

          {/* Project Title & Links */}
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-base font-bold text-[#0969DA] group-hover:underline truncate">
              {project.name}
            </h3>
            <div className="flex items-center gap-1 shrink-0">
              {project.repoUrl && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(project.repoUrl, "_blank", "noopener,noreferrer");
                  }}
                  className="p-1 text-[#59636E] hover:text-[#1F2328] hover:bg-[#F6F8FA] rounded transition-colors"
                  title="Source repository"
                >
                  <GitBranch className="w-3.5 h-3.5" />
                </span>
              )}
              {project.demoUrl && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(project.demoUrl, "_blank", "noopener,noreferrer");
                  }}
                  className="p-1 text-[#59636E] hover:text-[#1F2328] hover:bg-[#F6F8FA] rounded transition-colors"
                  title="Live preview"
                >
                  <Globe className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
          </div>

          <p className="text-xs text-[#59636E] line-clamp-2 mt-1 leading-relaxed">
            {project.tagline || project.description}
          </p>
        </div>

        {/* Tombstone Post-Mortem Callout */}
        <div className="p-2.5 rounded-md bg-[#F6F8FA] border border-[#D1D9E0]/70 text-[11px] leading-relaxed text-[#59636E]">
          <span className="font-semibold text-[#1F2328] inline-flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-[#9A6700]" />
            Why Abandoned:
          </span>{" "}
          <span className="line-clamp-2 italic">
            &ldquo;{project.abandonedReason}&rdquo;
          </span>
        </div>

        {/* Codebase Maturity & Potential */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-mono text-[#59636E]">
            <span className="flex items-center gap-1">
              <span>Codebase Maturity</span>
              <span className="text-[#1F2328] font-bold">({project.completionRate}%)</span>
            </span>
            <span className="text-[#0969DA] font-semibold flex items-center gap-1">
              <Compass className="w-3 h-3" />
              {project.revivalPotential} Feasibility
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[#D1D9E0]/60 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                project.completionRate >= 80
                  ? "bg-[#1F883D]"
                  : project.completionRate >= 50
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
                ? "Sprint"
                : "Archaeological Dig"}
            </span>
          </div>
        )}

        {/* Contributor Skills Needed */}
        {skills.length > 0 && (
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#59636E] font-semibold block">
              Contributors / Skills Needed:
            </span>
            <div className="flex flex-wrap gap-1">
              {visibleSkills.map((skill) => (
                <span
                  key={skill}
                  className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#DDF4FF]/60 text-[#0969DA] border border-[#54AEFF]/30 font-medium"
                >
                  +{skill}
                </span>
              ))}
              {remainingSkills > 0 && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#F6F8FA] text-[#59636E] border border-[#D1D9E0]">
                  +{remainingSkills} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Tech Stack Pills */}
        <div className="flex flex-wrap items-center gap-1">
          {visibleTech.map((tech) => (
            <Badge key={tech} variant="tech" className="text-[10px] py-0 px-1.5">
              {tech}
            </Badge>
          ))}
          {remainingTech > 0 && (
            <span className="text-[10px] font-mono text-[#59636E]">
              +{remainingTech}
            </span>
          )}
        </div>
      </div>

      {/* Card Footer: Ratings, Suggestions & CTAs */}
      <div className="pt-3.5 mt-3.5 border-t border-[#D1D9E0]/70 flex items-center justify-between text-xs font-mono text-[#59636E]">
        {/* Rating Score & Suggestions */}
        <div className="flex items-center gap-3">
          <div
            onClick={(e) => {
              e.stopPropagation();
              onSelect(project, "reviews");
            }}
            className="flex items-center gap-1 text-[#1F2328] font-bold hover:text-[#0969DA] transition-colors"
            title="Community 5-dimension review score"
          >
            <Star className="w-3.5 h-3.5 text-[#D4A72C] fill-[#D4A72C]" />
            <span>{project.ratingAverage ? project.ratingAverage.toFixed(1) : "—"}</span>
            <span className="text-[#59636E] text-[10px] font-normal">
              ({project.ratingsCount || 0})
            </span>
          </div>

          <div
            onClick={(e) => {
              e.stopPropagation();
              onSelect(project, "suggestions");
            }}
            className="flex items-center gap-1 hover:text-[#0969DA] transition-colors"
            title="Community suggestions and architecture ideas"
          >
            <MessageSquare className="w-3 h-3 text-[#59636E]" />
            <span>{project.suggestionsCount || 0}</span>
          </div>
        </div>

        {/* Inspect / Revive Action Button */}
        <div className="flex items-center gap-1 text-[#0969DA] font-semibold group-hover:translate-x-0.5 transition-transform text-xs">
          <span>Explore Revival</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}
