"use client";

import React from "react";
import { Search, X, RotateCcw, Filter, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProjectStatus } from "@/types/project";

export type StatusFilterOption =
  | "All"
  | ProjectStatus
  | "Worth Revisiting"
  | "Needs Decision";

export type SortOption =
  | "updated-desc"
  | "updated-asc"
  | "maturity-desc"
  | "maturity-asc"
  | "name-asc";

// Backward compatibility type alias
export type FilterCategory = StatusFilterOption;

interface ProjectFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedStatus: StatusFilterOption;
  onSelectStatus: (status: StatusFilterOption) => void;
  selectedLanguage: string;
  onSelectLanguage: (lang: string) => void;
  selectedReason: string;
  onSelectReason: (reason: string) => void;
  sortOption: SortOption;
  onSelectSort: (sort: SortOption) => void;
  availableLanguages: string[];
  availableReasons: string[];
  statusCounts: Record<string, number>;
  totalFiltered: number;
  totalProjects: number;
  onClearAll: () => void;
  // Backward compatibility prop
  selectedFilter?: StatusFilterOption;
  onSelectFilter?: (filter: StatusFilterOption) => void;
  counts?: Record<string, number>;
}

export function ProjectFilters({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onSelectStatus,
  selectedLanguage,
  onSelectLanguage,
  selectedReason,
  onSelectReason,
  sortOption,
  onSelectSort,
  availableLanguages,
  availableReasons,
  totalFiltered,
  totalProjects,
  onClearAll,
  // Fallbacks
  selectedFilter,
  onSelectFilter,
}: ProjectFiltersProps) {
  const currentStatus = selectedStatus || selectedFilter || "All";
  const handleStatusChange = onSelectStatus || onSelectFilter || (() => {});

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    currentStatus !== "All" ||
    (selectedLanguage && selectedLanguage !== "All") ||
    (selectedReason && selectedReason !== "All") ||
    sortOption !== "updated-desc";

  return (
    <div className="bg-white border border-[#D1D9E0] rounded-lg p-3 sm:p-3.5 space-y-3 shadow-2xs">
      {/* Top Row: Search Input and Sort control */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Search input with leading icon and clear button */}
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search projects by name, description, tech stack, or problem..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            icon={<Search className="w-3.5 h-3.5 text-[#59636E]" />}
            className="text-xs h-9 bg-[#F6F8FA] border-[#D1D9E0] focus:bg-white"
            aria-label="Search repositories"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#59636E] hover:text-[#1F2328] rounded cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative flex items-center">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#59636E] absolute left-2.5 pointer-events-none" />
            <select
              value={sortOption}
              onChange={(e) => onSelectSort(e.target.value as SortOption)}
              className="text-xs h-9 pl-8 pr-7 bg-[#F6F8FA] border border-[#D1D9E0] rounded-md text-[#1F2328] font-medium appearance-none cursor-pointer hover:bg-[#eaeef2] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0969DA]/20"
              aria-label="Sort projects"
            >
              <option value="updated-desc">Sort: Recently Active</option>
              <option value="updated-asc">Sort: Oldest Active</option>
              <option value="maturity-desc">Sort: Maturity (High to Low)</option>
              <option value="maturity-asc">Sort: Maturity (Low to High)</option>
              <option value="name-asc">Sort: Alphabetical (A-Z)</option>
            </select>
            <span className="absolute right-2.5 pointer-events-none text-[#59636E] text-[10px]">▼</span>
          </div>
        </div>
      </div>

      {/* Bottom Filter Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 border-t border-[#D1D9E0]/50 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[#59636E] flex items-center gap-1 font-mono text-[11px] font-semibold">
            <Filter className="w-3 h-3 text-[#59636E]" />
            Filters:
          </span>

          {/* Status Dropdown */}
          <select
            value={currentStatus}
            onChange={(e) => handleStatusChange(e.target.value as StatusFilterOption)}
            className={cn(
              "text-xs h-7 px-2.5 rounded-md border text-[#1F2328] font-medium transition-colors cursor-pointer focus:outline-none",
              currentStatus !== "All"
                ? "bg-[#DDF4FF] border-[#54AEFF]/40 text-[#0969DA] font-semibold"
                : "bg-[#F6F8FA] border-[#D1D9E0] hover:bg-[#eaeef2]"
            )}
            aria-label="Filter by status"
          >
            <option value="All">Status: All</option>
            <option value="Abandoned">Status: Abandoned</option>
            <option value="Under Review">Status: Under Review</option>
            <option value="Revived">Status: Revived</option>
            <option value="Archived">Status: Archived</option>
            <option value="Worth Revisiting">Status: Ready to Review</option>
            <option value="Needs Decision">Status: Needs Decision</option>
          </select>

          {/* Programming Language Dropdown */}
          <select
            value={selectedLanguage}
            onChange={(e) => onSelectLanguage(e.target.value)}
            className={cn(
              "text-xs h-7 px-2.5 rounded-md border text-[#1F2328] font-medium transition-colors cursor-pointer focus:outline-none",
              selectedLanguage !== "All"
                ? "bg-[#DDF4FF] border-[#54AEFF]/40 text-[#0969DA] font-semibold"
                : "bg-[#F6F8FA] border-[#D1D9E0] hover:bg-[#eaeef2]"
            )}
            aria-label="Filter by programming language"
          >
            <option value="All">Language: All</option>
            {availableLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>

          {/* Abandonment Reason Filter */}
          {availableReasons.length > 0 && (
            <select
              value={selectedReason}
              onChange={(e) => onSelectReason(e.target.value)}
              className={cn(
                "text-xs h-7 px-2.5 rounded-md border text-[#1F2328] font-medium transition-colors cursor-pointer focus:outline-none max-w-[200px] truncate",
                selectedReason !== "All"
                  ? "bg-[#DDF4FF] border-[#54AEFF]/40 text-[#0969DA] font-semibold"
                  : "bg-[#F6F8FA] border-[#D1D9E0] hover:bg-[#eaeef2]"
              )}
              aria-label="Filter by abandonment reason"
            >
              <option value="All">Reason: All</option>
              {availableReasons.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          )}

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearAll}
              className="text-xs h-7 px-2 gap-1 text-[#D1242F] border-[#D1D9E0] hover:bg-[#FFEBE9] hover:border-[#FF8182]/50"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear filters</span>
            </Button>
          )}
        </div>

        {/* Counter readout */}
        <div className="text-[11px] font-mono text-[#59636E]">
          Showing <span className="font-bold text-[#1F2328]">{totalFiltered}</span> of{" "}
          <span>{totalProjects}</span> projects
        </div>
      </div>
    </div>
  );
}
