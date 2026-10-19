"use client";

import React, { useMemo } from "react";
import { Project, ProjectStatus } from "@/types/project";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import {
  ProjectFilters,
  StatusFilterOption,
  SortOption,
} from "@/components/dashboard/ProjectFilters";
import { SearchX, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DetailTab } from "@/components/dashboard/ProjectDetailModal";

interface ProjectGridProps {
  projects: Project[];
  onUpdateStatus: (projectId: string, newStatus: ProjectStatus) => void;
  onInspect: (project: Project, initialTab?: DetailTab) => void;
  selectedFilter: StatusFilterOption;
  onSelectFilter: (filter: StatusFilterOption) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedLanguage: string;
  onSelectLanguage: (lang: string) => void;
  selectedReason: string;
  onSelectReason: (reason: string) => void;
  sortOption: SortOption;
  onSelectSort: (sort: SortOption) => void;
}

export function ProjectGrid({
  projects,
  onUpdateStatus,
  onInspect,
  selectedFilter,
  onSelectFilter,
  searchQuery,
  onSearchChange,
  selectedLanguage,
  onSelectLanguage,
  selectedReason,
  onSelectReason,
  sortOption,
  onSelectSort,
}: ProjectGridProps) {
  // Compute dynamically available languages from actual projects in vault
  const availableLanguages = useMemo(() => {
    const langSet = new Set<string>();
    projects.forEach((p) => {
      p.techTags.forEach((t) => langSet.add(t));
    });
    return Array.from(langSet).sort();
  }, [projects]);

  // Compute common abandonment reasons keywords
  const availableReasons = useMemo(() => {
    const commonCategories = [
      "Momentum",
      "Blockers",
      "Market",
      "Superseded",
      "Security",
      "Burnout",
      "Time",
    ];
    return commonCategories.filter((cat) =>
      projects.some((p) =>
        p.abandonedReason.toLowerCase().includes(cat.toLowerCase())
      )
    );
  }, [projects]);

  // Compute status counts for toolbar options
  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: projects.length,
      Abandoned: projects.filter((p) => p.status === "Abandoned").length,
      "Under Review": projects.filter((p) => p.status === "Under Review").length,
      Revived: projects.filter((p) => p.status === "Revived").length,
      Archived: projects.filter((p) => p.status === "Archived").length,
      "Worth Revisiting": projects.filter(
        (p) => p.worthRevisiting && p.status !== "Revived" && p.status !== "Archived"
      ).length,
      "Needs Decision": projects.filter(
        (p) => !p.nextAction && p.status !== "Revived" && p.status !== "Archived"
      ).length,
    };
    return counts;
  }, [projects]);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    const result = projects.filter((project) => {
      // 1. Status Filter
      if (selectedFilter === "Worth Revisiting") {
        if (!project.worthRevisiting || project.status === "Revived" || project.status === "Archived") {
          return false;
        }
      } else if (selectedFilter === "Needs Decision") {
        if (project.nextAction || project.status === "Revived" || project.status === "Archived") {
          return false;
        }
      } else if (selectedFilter !== "All") {
        if (project.status !== selectedFilter) return false;
      }

      // 2. Language Filter
      if (selectedLanguage !== "All") {
        const hasLang = project.techTags.some(
          (t) => t.toLowerCase() === selectedLanguage.toLowerCase()
        );
        if (!hasLang) return false;
      }

      // 3. Reason Filter
      if (selectedReason !== "All") {
        if (
          !project.abandonedReason
            .toLowerCase()
            .includes(selectedReason.toLowerCase())
        ) {
          return false;
        }
      }

      // 4. Search Query Filter
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const matchName = project.name.toLowerCase().includes(q);
      const matchDesc = project.description.toLowerCase().includes(q);
      const matchTagline = project.tagline.toLowerCase().includes(q);
      const matchProblem = project.originalProblem?.toLowerCase().includes(q);
      const matchUsers = project.intendedUsers?.toLowerCase().includes(q);
      const matchTech = project.techTags.some((tag) =>
        tag.toLowerCase().includes(q)
      );
      const matchReason = project.abandonedReason.toLowerCase().includes(q);
      const matchAction = project.nextAction?.toLowerCase().includes(q);

      return (
        matchName ||
        matchDesc ||
        matchTagline ||
        matchProblem ||
        matchUsers ||
        matchTech ||
        matchReason ||
        matchAction
      );
    });

    // 5. Sorting
    return result.sort((a, b) => {
      if (sortOption === "updated-asc") {
        return (a.lastActiveDate || a.lastUpdated).localeCompare(
          b.lastActiveDate || b.lastUpdated
        );
      }
      if (sortOption === "maturity-desc") {
        return b.completionRate - a.completionRate;
      }
      if (sortOption === "maturity-asc") {
        return a.completionRate - b.completionRate;
      }
      if (sortOption === "name-asc") {
        return a.name.localeCompare(b.name);
      }
      // Default: updated-desc
      return (b.lastActiveDate || b.lastUpdated).localeCompare(
        a.lastActiveDate || a.lastUpdated
      );
    });
  }, [
    projects,
    selectedFilter,
    selectedLanguage,
    selectedReason,
    searchQuery,
    sortOption,
  ]);

  const handleQuickRevive = (projectId: string) => {
    onUpdateStatus(projectId, "Revived");
  };

  const handleClearAll = () => {
    onSearchChange("");
    onSelectFilter("All");
    onSelectLanguage("All");
    onSelectReason("All");
    onSelectSort("updated-desc");
  };

  return (
    <div className="space-y-4">
      {/* Unified Search, Filter and Sort Toolbar */}
      <ProjectFilters
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        selectedStatus={selectedFilter}
        onSelectStatus={onSelectFilter}
        selectedLanguage={selectedLanguage}
        onSelectLanguage={onSelectLanguage}
        selectedReason={selectedReason}
        onSelectReason={onSelectReason}
        sortOption={sortOption}
        onSelectSort={onSelectSort}
        availableLanguages={availableLanguages}
        availableReasons={availableReasons}
        statusCounts={filterCounts}
        totalFiltered={filteredProjects.length}
        totalProjects={projects.length}
        onClearAll={handleClearAll}
      />

      {/* Projects Grid or Useful Empty State */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onInspect={onInspect}
              onQuickRevive={handleQuickRevive}
            />
          ))}
        </div>
      ) : (
        /* Clean Primer Empty State */
        <div className="rounded-lg border border-dashed border-[#D1D9E0] bg-[#F6F8FA]/60 p-10 sm:p-12 text-center my-4 flex flex-col items-center justify-center shadow-2xs">
          <div className="w-10 h-10 rounded-full bg-white border border-[#D1D9E0] flex items-center justify-center text-[#59636E] mb-3">
            <SearchX className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-[#1F2328] tracking-tight">
            {projects.length === 0
              ? "Your Project Graveyard is empty"
              : "No projects match your filter criteria"}
          </h3>
          <p className="mt-1 text-xs text-[#59636E] max-w-md leading-relaxed">
            {projects.length === 0
              ? "You haven't entombed any abandoned repositories yet. Click \"Resurrect a Project\" or \"Import from GitHub\" to preserve your first project."
              : searchQuery
              ? `No repositories matched query "${searchQuery}" under current filters.`
              : `There are currently no projects matching the active filters (${selectedFilter}${
                  selectedLanguage !== "All" ? ` · ${selectedLanguage}` : ""
                }).`}
          </p>
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="gap-1.5 text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset all filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
