"use client";

import React, { useState, useMemo, useSyncExternalStore } from "react";
import { getDashboardStats } from "@/data/projects";
import { Project, ProjectStatus } from "@/types/project";
import { projectRepository } from "@/lib/projectRepository";
import { useAuth } from "@/lib/auth";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardTopNav } from "@/components/dashboard/DashboardTopNav";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { ProjectGrid } from "@/components/dashboard/ProjectGrid";
import { ProjectFormModal } from "@/components/dashboard/ProjectFormModal";
import { ProjectDetailModal } from "@/components/dashboard/ProjectDetailModal";
import { GitHubImportModal, ImportedRepoData } from "@/components/dashboard/GitHubImportModal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { RevivalCompassView } from "@/components/dashboard/RevivalCompassView";
import { SettingsView } from "@/components/dashboard/SettingsView";
import { StatusFilterOption, SortOption } from "@/components/dashboard/ProjectFilters";
import { RecommendedToRevive } from "@/components/dashboard/RecommendedToRevive";
import { DetailTab } from "@/components/dashboard/ProjectDetailModal";
import { Plus, GitBranch, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

const EMPTY_PROJECTS: Project[] = [];

export default function DashboardPage() {
  const { user } = useAuth();

  // Use React's useSyncExternalStore to subscribe to the localStorage-backed projectRepository
  const projects = useSyncExternalStore(
    projectRepository.subscribe,
    projectRepository.getAll,
    () => EMPTY_PROJECTS
  );

  const [currentTab, setCurrentTab] = useState<string>("overview");
  const [selectedFilter, setSelectedFilter] = useState<StatusFilterOption>("All");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("All");
  const [selectedReason, setSelectedReason] = useState<string>("All");
  const [sortOption, setSortOption] = useState<SortOption>("updated-desc");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Modal identifiers
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isGitHubImportOpen, setIsGitHubImportOpen] = useState(false);
  const [importedRepoData, setImportedRepoData] = useState<Partial<Project> | null>(null);

  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [inspectingProjectId, setInspectingProjectId] = useState<string | null>(null);
  const [inspectingTab, setInspectingTab] = useState<DetailTab>("overview");
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);

  // Derive active project objects dynamically from current synchronized projects list
  const inspectingProject = useMemo(
    () => projects.find((p) => p.id === inspectingProjectId) || null,
    [projects, inspectingProjectId]
  );

  const editingProject = useMemo(
    () => projects.find((p) => p.id === editingProjectId) || null,
    [projects, editingProjectId]
  );

  const deletingProject = useMemo(
    () => projects.find((p) => p.id === deletingProjectId) || null,
    [projects, deletingProjectId]
  );

  // Dynamic stats recomputed whenever projects change
  const stats = useMemo(() => getDashboardStats(projects), [projects]);

  // Handler: Status Update with timeline logging
  const handleUpdateStatus = (projectId: string, newStatus: ProjectStatus) => {
    projectRepository.update(projectId, {
      status: newStatus,
      worthRevisiting: newStatus === "Revived" ? false : undefined,
    });
  };

  // Handler: Save concrete Next Action
  const handleSaveNextAction = (projectId: string, nextAction: string) => {
    projectRepository.update(
      projectId,
      { nextAction },
      nextAction ? `Defined next action: "${nextAction}"` : "Cleared next action."
    );
  };

  // Handler: Toggle Revival Checklist Step
  const handleToggleChecklistItem = (projectId: string, itemId: string) => {
    const proj = projects.find((p) => p.id === projectId);
    if (!proj) return;
    const currentList = proj.revivalChecklist || [];
    const updated = currentList.map((it) =>
      it.id === itemId ? { ...it, completed: !it.completed } : it
    );
    projectRepository.update(
      projectId,
      { revivalChecklist: updated },
      "Updated revival checklist progress."
    );
  };

  // Handler: Add Custom Checklist Step
  const handleAddChecklistItem = (projectId: string, label: string) => {
    const proj = projects.find((p) => p.id === projectId);
    if (!proj) return;
    const currentList = proj.revivalChecklist || [];
    const newItem = {
      id: `chk-${Date.now()}`,
      label,
      completed: false,
      category: "feature" as const,
    };
    projectRepository.update(
      projectId,
      { revivalChecklist: [...currentList, newItem] },
      `Added custom task: "${label}"`
    );
  };

  // Handler: Inspect project with specific initial tab
  const handleInspectWithTab = (project: Project, tab: DetailTab = "overview") => {
    setInspectingTab(tab);
    setInspectingProjectId(project.id);
  };

  // Handler: Create Project
  const handleCreateProject = (projectData: Partial<Project>) => {
    const created = projectRepository.create({
      name: projectData.name || "Untitled",
      tagline: projectData.tagline || "",
      description: projectData.description || "",
      originalProblem: projectData.originalProblem || "",
      intendedUsers: projectData.intendedUsers || "",
      techTags: projectData.techTags || ["TypeScript"],
      repoUrl: projectData.repoUrl,
      demoUrl: projectData.demoUrl,
      status: projectData.status || "Abandoned",
      lastActiveDate:
        projectData.lastActiveDate || new Date().toISOString().split("T")[0],
      worthRevisiting: projectData.status === "Revived" ? false : (projectData.completionRate || 50) >= 60,
      completionRate: projectData.completionRate ?? 70,
      abandonedReason: projectData.abandonedReason || "Preserved in vault.",
      completedFeatures: projectData.completedFeatures || [],
      unfinishedFeatures: projectData.unfinishedFeatures || [],
      mainBlockers: projectData.mainBlockers || "",
      lessonsLearned: projectData.lessonsLearned || "",
      revivalPotential: projectData.revivalPotential || "Moderate",
      nextAction: projectData.nextAction,
      isPublic: Boolean(projectData.isPublic),
      collaborationStatus: projectData.collaborationStatus || "feedback_only",
      skillsNeeded: projectData.skillsNeeded || [],
      stars: 0,
      author: {
        name: user?.name || "Devon Reed",
        avatar: user?.avatar || "DR",
        handle: user?.githubUsername ? `@${user.githubUsername}` : "@devonreed",
      },
    });

    setIsCreateOpen(false);
    setImportedRepoData(null);
    setSelectedFilter("All");
    handleInspectWithTab(created, "overview");
  };

  // Handler: Edit Project
  const handleEditProject = (projectData: Partial<Project>) => {
    if (!editingProjectId) return;

    projectRepository.update(
      editingProjectId,
      projectData,
      "Project specifications, roadmap, and tombstone details revised."
    );

    setEditingProjectId(null);
  };

  // Handler: Delete Project
  const handleConfirmDelete = () => {
    if (!deletingProjectId) return;

    projectRepository.delete(deletingProjectId);
    if (inspectingProjectId === deletingProjectId) {
      setInspectingProjectId(null);
    }
    setDeletingProjectId(null);
  };

  // Handler: Reset Seed Data
  const handleResetSeed = () => {
    projectRepository.resetToSeed();
    setInspectingProjectId(null);
  };

  // Handler: GitHub Import Pre-population
  const handleGitHubImport = (data: ImportedRepoData) => {
    setImportedRepoData({
      name: data.name,
      tagline: data.tagline,
      description: data.description,
      techTags: data.techTags && data.techTags.length > 0 ? data.techTags : ["TypeScript"],
      repoUrl: data.repoUrl,
      lastActiveDate: data.lastActiveDate,
      status: "Abandoned",
      completionRate: 60,
    });
    setIsGitHubImportOpen(false);
    setIsCreateOpen(true);
  };

  const handleSidebarTabSelect = (tabId: string) => {
    setCurrentTab(tabId);
    if (tabId === "graveyard") {
      setSelectedFilter("Abandoned");
    } else if (tabId === "overview") {
      setSelectedFilter("All");
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F6F8FA] text-[#1F2328]">
      {/* Sidebar */}
      <DashboardSidebar
        currentTab={currentTab}
        onSelectTab={handleSidebarTabSelect}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar with search and profile */}
        <DashboardTopNav
          onOpenMobileMenu={() => setMobileSidebarOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenGitHubImport={() => setIsGitHubImportOpen(true)}
        />

        {/* Dashboard Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-7">
          {/* Welcome Heading and Resurrect a Project button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D1D9E0]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono uppercase tracking-wider text-[#1F883D] font-semibold">
                  {currentTab === "compass"
                    ? "Revival Compass"
                    : currentTab === "settings"
                    ? "Vault Configuration"
                    : currentTab === "graveyard"
                    ? "Personal Graveyard"
                    : "Graveyard / Overview"}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#1F883D]" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1F2328]">
                {currentTab === "compass"
                  ? "Viability Diagnostics"
                  : currentTab === "settings"
                  ? "Settings & Catalog Backups"
                  : "Your projects deserve another look."}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-[#59636E]">
                {currentTab === "compass"
                  ? "Review transparent, rule-based assessments for code staleness and resurgence readiness."
                  : currentTab === "settings"
                  ? "Manage data exports, GitHub connections, and graveyard preferences."
                  : "Review your unfinished work, address blockers, and decide what to do next."}
              </p>
            </div>

            {/* Actions: GitHub Import & Resurrect a Project CTA button */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="md"
                onClick={() => setIsGitHubImportOpen(true)}
                className="w-full sm:w-auto text-xs"
              >
                <GitBranch className="w-4 h-4 mr-1.5 text-[#59636E]" />
                Import Repo
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setImportedRepoData(null);
                  setIsCreateOpen(true);
                }}
                className="w-full sm:w-auto shadow-xs"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Resurrect a Project
              </Button>
            </div>
          </div>

          {/* Conditional Views based on Sidebar Selection */}
          {currentTab === "compass" ? (
            <RevivalCompassView
              projects={projects}
              onInspect={(p) => handleInspectWithTab(p, "overview")}
              onSwitchToOverview={() => {
                setCurrentTab("overview");
                setSelectedFilter("Worth Revisiting");
              }}
            />
          ) : currentTab === "settings" ? (
            <SettingsView
              projects={projects}
              onResetSeed={handleResetSeed}
              onOpenGitHubImport={() => setIsGitHubImportOpen(true)}
            />
          ) : (
            <>
              {/* Four Summary Cards */}
              <StatsCards
                stats={stats}
                selectedFilter={selectedFilter}
                onSelectFilter={(filter) => setSelectedFilter(filter as StatusFilterOption)}
              />

              {/* Actionable "Recommended to Revive" Section */}
              <RecommendedToRevive
                projects={projects}
                onInspect={(p, tab) => handleInspectWithTab(p, tab || "revival")}
                onExploreCompass={() => setCurrentTab("compass")}
                onSelectNeedsDecision={() => setSelectedFilter("Needs Decision")}
              />

              {/* Project Grid with Search & Multi-Filter controls */}
              <div className="space-y-3.5 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#1F883D]" />
                    <h2 className="text-base sm:text-lg font-semibold text-[#1F2328] tracking-tight">
                      All Vault Projects
                    </h2>
                  </div>
                  <span className="text-xs font-mono text-[#59636E]">
                    {projects.length} total projects entombed
                  </span>
                </div>

                <ProjectGrid
                  projects={projects}
                  onUpdateStatus={handleUpdateStatus}
                  onInspect={(p) => handleInspectWithTab(p, "overview")}
                  selectedFilter={selectedFilter}
                  onSelectFilter={setSelectedFilter}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedLanguage={selectedLanguage}
                  onSelectLanguage={setSelectedLanguage}
                  selectedReason={selectedReason}
                  onSelectReason={setSelectedReason}
                  sortOption={sortOption}
                  onSelectSort={setSortOption}
                />
              </div>
            </>
          )}
        </main>
      </div>

      {/* GITHUB IMPORT MODAL */}
      <GitHubImportModal
        isOpen={isGitHubImportOpen}
        onClose={() => setIsGitHubImportOpen(false)}
        onImport={handleGitHubImport}
      />

      {/* CREATE PROJECT MODAL */}
      <ProjectFormModal
        key={isCreateOpen ? `create-${importedRepoData?.name || "new"}` : "create-inactive"}
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setImportedRepoData(null);
        }}
        onSubmit={handleCreateProject}
        initialProject={importedRepoData}
        onOpenGitHubImport={() => {
          setIsCreateOpen(false);
          setIsGitHubImportOpen(true);
        }}
      />

      {/* EDIT PROJECT MODAL */}
      <ProjectFormModal
        key={editingProjectId || "edit-inactive"}
        isOpen={Boolean(editingProject)}
        onClose={() => setEditingProjectId(null)}
        onSubmit={handleEditProject}
        initialProject={editingProject}
      />

      {/* INSPECT PROJECT DETAILS MODAL */}
      <ProjectDetailModal
        key={inspectingProject ? `${inspectingProject.id}-${inspectingTab}` : "detail-inactive"}
        project={inspectingProject}
        isOpen={Boolean(inspectingProject)}
        onClose={() => setInspectingProjectId(null)}
        initialTab={inspectingTab}
        onUpdateStatus={handleUpdateStatus}
        onSaveNextAction={handleSaveNextAction}
        onToggleChecklistItem={handleToggleChecklistItem}
        onAddChecklistItem={handleAddChecklistItem}
        onEdit={(p) => {
          setEditingProjectId(p.id);
          setInspectingProjectId(null);
        }}
        onDelete={(p) => {
          setDeletingProjectId(p.id);
        }}
      />

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={Boolean(deletingProject)}
        onClose={() => setDeletingProjectId(null)}
        onConfirm={handleConfirmDelete}
        title="Permanently Delete Project?"
        description={`Are you sure you want to permanently delete "${deletingProject?.name}" from SecondSpark? All architectural memory, features roadmap, and development timeline will be removed. This action cannot be undone.`}
        confirmLabel="Permanently Delete"
        cancelLabel="Keep Project"
        isDestructive={true}
      />
    </div>
  );
}
