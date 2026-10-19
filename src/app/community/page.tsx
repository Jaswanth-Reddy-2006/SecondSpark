"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { SecondSparkLogo } from "@/components/brand/SecondSparkLogo";
import { CommunityProjectCard, CommunityProjectCardData } from "@/components/community/CommunityProjectCard";
import { CommunityDetailModal, CommunityTab } from "@/components/community/CommunityDetailModal";
import { LeaderboardView } from "@/components/community/LeaderboardView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  Users,
  Compass,
  Sparkles,
  Flame,
  Globe,
  Layers,
  RotateCcw,
  Trophy,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

const TECH_PILLS = [
  "All",
  "TypeScript",
  "Rust",
  "Next.js",
  "Go",
  "WebAssembly",
  "SQLite",
  "Docker",
  "React",
];

export default function CommunityPage() {
  const { user } = useAuth();
  const [activeMainView, setActiveMainView] = useState<"projects" | "leaderboard">("projects");
  const [projects, setProjects] = useState<CommunityProjectCardData[]>([]);
  const [metrics, setMetrics] = useState({
    totalPublicProjects: 0,
    openToCollaborators: 0,
    seekingAdoption: 0,
    avgMaturity: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTech, setSelectedTech] = useState("All");
  const [selectedCollab, setSelectedCollab] = useState("All");
  const [sortOption, setSortOption] = useState("stars-desc");

  // Detail Modal state
  const [selectedProject, setSelectedProject] = useState<CommunityProjectCardData | null>(null);
  const [modalInitialTab, setModalInitialTab] = useState<CommunityTab>("overview");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch community projects
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (selectedTech !== "All") params.set("tech", selectedTech);
      if (selectedCollab !== "All") params.set("collabStatus", selectedCollab);
      if (sortOption) params.set("sort", sortOption);

      const res = await fetch(`/api/community/projects?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
        if (data.metrics) setMetrics(data.metrics);
      }
    } catch (err) {
      console.error("Failed to load community projects:", err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedTech, selectedCollab, sortOption]);

  useEffect(() => {
    let ignore = false;
    const executeFetch = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (searchQuery) params.set("search", searchQuery);
        if (selectedTech !== "All") params.set("tech", selectedTech);
        if (selectedCollab !== "All") params.set("collabStatus", selectedCollab);
        if (sortOption) params.set("sort", sortOption);

        const res = await fetch(`/api/community/projects?${params.toString()}`);
        if (res.ok && !ignore) {
          const data = await res.json();
          setProjects(data.projects || []);
          if (data.metrics) setMetrics(data.metrics);
        }
      } catch (err) {
        console.error("Failed to load community projects:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    executeFetch();
    return () => {
      ignore = true;
    };
  }, [selectedTech, selectedCollab, sortOption, searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProjects();
  };

  const handleOpenDetail = (project: CommunityProjectCardData, initialTab?: string) => {
    setSelectedProject(project);
    setModalInitialTab((initialTab as CommunityTab) || "overview");
    setIsModalOpen(true);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedTech("All");
    setSelectedCollab("All");
    setSortOption("stars-desc");
  };

  return (
    <div className="min-h-screen bg-[#F6F8FA] text-[#1F2328] flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#D1D9E0] px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 text-inherit no-underline">
              <SecondSparkLogo size={28} />
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight text-[#1F2328]">SecondSpark</span>
                <span className="text-[10px] text-[#59636E] font-mono leading-none">
                  Project Graveyard
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-4 text-xs font-medium">
              <Link
                href="/community"
                className="text-[#0969DA] font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#DDF4FF]/40 border border-[#54AEFF]/30"
              >
                <Globe className="w-3.5 h-3.5" />
                Community Graveyard
              </Link>
              <Link
                href="/dashboard"
                className="text-[#59636E] hover:text-[#1F2328] flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-[#F6F8FA] transition-colors"
              >
                <Layers className="w-3.5 h-3.5" />
                Personal Vault
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2.5">
            {user ? (
              <div className="flex items-center gap-2">
                <Link href="/dashboard">
                  <Button variant="secondary" size="sm">
                    Open Vault
                  </Button>
                </Link>
                <div className="w-7 h-7 rounded-full bg-[#1F883D]/10 border border-[#1F883D]/30 flex items-center justify-center text-xs font-bold text-[#1F883D]">
                  {user.avatar || (user.name || "D").slice(0, 2).toUpperCase()}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    Join Graveyard
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-white border-b border-[#D1D9E0] py-8 sm:py-12 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="max-w-3xl space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-[#DAFBE8] text-[#1F883D] border border-[#1F883D]/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Public Developer Community Ecosystem</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#1F2328]">
              Where Abandoned Repositories Find a Second Life
            </h1>
            <p className="text-sm sm:text-base text-[#59636E] leading-relaxed">
              Explore public dormant codebases preserved with honest architectural post-mortems.
              Review 5-dimension viability scores, propose solutions to technical blockers, and step
              forward to adopt or collaborate.
            </p>
          </div>

          {/* View Toggle Bar */}
          <div className="flex items-center gap-2 pt-2 border-t border-[#D1D9E0]/60">
            <button
              type="button"
              onClick={() => setActiveMainView("projects")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeMainView === "projects"
                  ? "bg-[#1F2328] text-white shadow-sm"
                  : "bg-[#F6F8FA] text-[#59636E] hover:text-[#1F2328] border border-[#D1D9E0]"
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Graveyard Repositories ({metrics.totalPublicProjects})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMainView("leaderboard")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeMainView === "leaderboard"
                  ? "bg-[#1F2328] text-white shadow-sm"
                  : "bg-[#F6F8FA] text-[#59636E] hover:text-[#1F2328] border border-[#D1D9E0]"
              }`}
            >
              <Trophy className="w-4 h-4 text-[#D4A72C]" />
              <span>Revival Champions &amp; XP Leaderboard</span>
            </button>
          </div>

          {/* Quick Metrics Bar (Shown on projects view) */}
          {activeMainView === "projects" && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 rounded-lg bg-[#F6F8FA] border border-[#D1D9E0] space-y-1">
                <span className="text-[11px] font-mono text-[#59636E] block">
                  Public Repositories
                </span>
                <span className="text-xl font-bold text-[#1F2328]">
                  {metrics.totalPublicProjects}
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-[#DDF4FF]/40 border border-[#54AEFF]/30 space-y-1">
                <span className="text-[11px] font-mono text-[#0969DA] block flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Open to Collaborators
                </span>
                <span className="text-xl font-bold text-[#0969DA]">
                  {metrics.openToCollaborators}
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-[#FFF8C5]/50 border border-[#D4A72C]/40 space-y-1">
                <span className="text-[11px] font-mono text-[#9A6700] block flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  Seeking Maintainer (Adoption)
                </span>
                <span className="text-xl font-bold text-[#9A6700]">
                  {metrics.seekingAdoption}
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-[#F6F8FA] border border-[#D1D9E0] space-y-1">
                <span className="text-[11px] font-mono text-[#59636E] block flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-[#1F883D]" />
                  Average Maturity
                </span>
                <span className="text-xl font-bold text-[#1F883D]">
                  {metrics.avgMaturity ? `${metrics.avgMaturity}%` : "—"}
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 sm:py-8 flex-1 space-y-6">
        {activeMainView === "leaderboard" ? (
          <LeaderboardView />
        ) : (
          <>
            {/* Unified Search & Filters Toolbar */}
            <div className="bg-white border border-[#D1D9E0] rounded-lg p-3 sm:p-4 space-y-3.5 shadow-2xs">
              {/* Top Row: Search and Sort */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-[#59636E]" />
                    <Input
                      placeholder="Search abandoned projects by name, problem, stack, or blocker..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 text-xs h-9 bg-white"
                    />
                  </div>
                  <Button type="submit" variant="secondary" size="sm" className="h-9 px-4 shrink-0">
                    Search
                  </Button>
                </form>

                <div className="shrink-0">
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="w-full sm:w-auto h-9 px-3 rounded-md bg-[#F6F8FA] border border-[#D1D9E0] text-xs text-[#1F2328] font-medium focus:outline-none cursor-pointer"
                  >
                    <option value="stars-desc">Sort: Most Starred</option>
                    <option value="rating-desc">Sort: Highest Community Rating</option>
                    <option value="maturity-desc">Sort: Highest Codebase Maturity</option>
                    <option value="recent-desc">Sort: Recently Preserved</option>
                  </select>
                </div>
              </div>

              {/* Middle Row: Collaboration Status Tabs */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-[#D1D9E0]/60 text-xs">
                <span className="text-[#59636E] font-mono text-[11px] font-semibold flex items-center gap-1 mr-1">
                  <Filter className="w-3 h-3 text-[#59636E]" />
                  Collaboration:
                </span>

                {[
                  { id: "All", label: "All Repositories" },
                  { id: "open_to_collaborators", label: "Open to Collaborators" },
                  { id: "open_to_adoption", label: "Seeking New Maintainer" },
                  { id: "feedback_only", label: "Feedback Only" },
                ].map((collab) => (
                  <button
                    key={collab.id}
                    type="button"
                    onClick={() => setSelectedCollab(collab.id)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      selectedCollab === collab.id
                        ? "bg-[#1F2328] text-white font-semibold"
                        : "bg-[#F6F8FA] text-[#59636E] hover:text-[#1F2328] border border-[#D1D9E0]"
                    }`}
                  >
                    {collab.label}
                  </button>
                ))}
              </div>

              {/* Bottom Row: Technology Filter Pills */}
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                <span className="text-[#59636E] font-mono text-[11px] font-semibold mr-1">
                  Stack Tag:
                </span>
                {TECH_PILLS.map((tech) => (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => setSelectedTech(tech)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                      selectedTech === tech
                        ? "bg-[#0969DA] text-white font-semibold"
                        : "bg-[#F6F8FA] text-[#59636E] hover:text-[#1F2328] border border-[#D1D9E0]"
                    }`}
                  >
                    {tech}
                  </button>
                ))}

                {(searchQuery || selectedTech !== "All" || selectedCollab !== "All") && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="ml-auto text-[11px] text-[#0969DA] hover:underline flex items-center gap-1 font-mono"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset filters
                  </button>
                )}
              </div>
            </div>

            {/* Community Projects Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#1F883D]" />
                  <h2 className="text-base sm:text-lg font-bold text-[#1F2328]">
                    Preserved Projects in the Graveyard
                  </h2>
                </div>
                <span className="text-xs font-mono text-[#59636E]">
                  Showing {projects.length} repositories
                </span>
              </div>

              {loading ? (
                <div className="p-12 text-center text-xs text-[#59636E] font-mono bg-white rounded-lg border border-[#D1D9E0]">
                  Loading public community projects...
                </div>
              ) : projects.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-lg border border-[#D1D9E0] space-y-3">
                  <span className="text-sm font-semibold text-[#1F2328] block">
                    No matching graveyard projects found
                  </span>
                  <p className="text-xs text-[#59636E] max-w-sm mx-auto">
                    Try adjusting your search criteria or clear the active technology filters.
                  </p>
                  <Button variant="outline" size="sm" onClick={handleClearFilters}>
                    Clear All Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.map((project) => (
                    <CommunityProjectCard
                      key={project.id}
                      project={project}
                      onSelect={handleOpenDetail}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Community Detail Modal */}
      <CommunityDetailModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialTab={modalInitialTab}
        onReviewSubmitted={fetchProjects}
        onSuggestionSubmitted={fetchProjects}
      />
    </div>
  );
}
