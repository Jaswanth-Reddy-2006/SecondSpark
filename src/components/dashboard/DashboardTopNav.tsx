"use client";

import React from "react";
import { Search, Menu, GitBranch } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

interface DashboardTopNavProps {
  onOpenMobileMenu: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenGitHubImport?: () => void;
}

export function DashboardTopNav({
  onOpenMobileMenu,
  searchQuery,
  onSearchChange,
  onOpenGitHubImport,
}: DashboardTopNavProps) {
  const { user } = useAuth();

  return (
    <header className="h-16 border-b border-[#D1D9E0] bg-white/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-md text-[#59636E] hover:text-[#1F2328] hover:bg-[#F6F8FA] transition-colors"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Input */}
        <div className="w-full">
          <Input
            type="search"
            placeholder="Type / to search repositories, tech tags, or maintainers..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            icon={<Search className="w-3.5 h-3.5 text-[#59636E]" />}
            className="h-8 bg-[#F6F8FA] border-[#D1D9E0] text-xs w-full focus-visible:bg-white"
            aria-label="Search repositories"
          />
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-3">
        {/* Import GitHub Repo Button */}
        {onOpenGitHubImport && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenGitHubImport}
            className="text-xs gap-1.5 hidden sm:inline-flex"
          >
            <GitBranch className="w-3.5 h-3.5 text-[#59636E]" />
            <span>Import Repo</span>
          </Button>
        )}

        {/* User Profile Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#D1D9E0]">
          <div className="w-7 h-7 rounded-full bg-[#F6F8FA] border border-[#D1D9E0] flex items-center justify-center text-xs font-semibold text-[#1F2328]">
            {user?.avatar || "DR"}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-[#1F2328] leading-tight">
              {user?.name || "Developer"}
            </p>
            <p className="text-[10px] font-mono text-[#59636E] leading-tight">
              {user?.email || "developer@example.com"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
