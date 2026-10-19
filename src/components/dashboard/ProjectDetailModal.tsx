"use client";

import React, { useState } from "react";
import { Project, ProjectStatus, RevivalChecklistItem } from "@/types/project";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Compass,
  GitBranch,
  Globe,
  ExternalLink,
  Edit3,
  Trash2,
  Clock,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  ListTodo,
  Sparkles,
  Layers,
  Plus,
  CheckSquare,
  Lock,
  Users,
  Activity,
  Shield,
  Terminal,
  Radio,
  Package,
} from "lucide-react";
import { ProjectAutopsyView } from "@/components/developer/ProjectAutopsyView";
import { DynamicBadgeModal } from "@/components/developer/DynamicBadgeModal";
import { CloudSandboxModal } from "@/components/developer/CloudSandboxModal";
import { HarvestGemsView } from "@/components/developer/HarvestGemsView";
import { AdoptionProtocolModal } from "@/components/developer/AdoptionProtocolModal";
import { GitHubSyncModal } from "@/components/developer/GitHubSyncModal";

export type DetailTab =
  | "overview"
  | "tech"
  | "blockers"
  | "postmortem"
  | "features"
  | "revival"
  | "autopsy"
  | "harvest"
  | "timeline";

interface ProjectDetailModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (projectId: string, newStatus: ProjectStatus) => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onSaveNextAction?: (projectId: string, nextAction: string) => void;
  onToggleChecklistItem?: (projectId: string, checklistItemId: string) => void;
  onAddChecklistItem?: (projectId: string, label: string) => void;
  initialTab?: DetailTab;
}

const DEFAULT_REVIVAL_STEPS: Array<{ label: string; category: RevivalChecklistItem["category"] }> = [
  { label: "Audit outdated package dependencies & security advisories", category: "audit" },
  { label: "Verify local build environment and runtime compatibility", category: "setup" },
  { label: "Reproduce and isolate unresolved technical blockers", category: "fix" },
  { label: "Complete high-priority missing feature from roadmap", category: "feature" },
  { label: "Execute test suite & establish CI regression pipeline", category: "test" },
];

export function ProjectDetailModal({
  project,
  isOpen,
  onClose,
  onUpdateStatus,
  onEdit,
  onDelete,
  onSaveNextAction,
  onToggleChecklistItem,
  onAddChecklistItem,
  initialTab = "overview",
}: ProjectDetailModalProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>(initialTab);
  const [editingNextAction, setEditingNextAction] = useState(false);
  const [nextActionInput, setNextActionInput] = useState(project?.nextAction || "");
  const [newStepInput, setNewStepInput] = useState("");
  const [badgeModalOpen, setBadgeModalOpen] = useState(false);
  const [sandboxModalOpen, setSandboxModalOpen] = useState(false);
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [adoptModalOpen, setAdoptModalOpen] = useState(false);

  if (!project) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return dateString.split("T")[0];
  };

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return "N/A";
    const parts = isoString.split("T");
    if (parts.length > 1) {
      const date = parts[0];
      const time = parts[1].slice(0, 5);
      return `${date} ${time} UTC`;
    }
    return isoString;
  };

  // Derive active checklist items (fallback to default steps if empty)
  const checklist: RevivalChecklistItem[] =
    project.revivalChecklist && project.revivalChecklist.length > 0
      ? project.revivalChecklist
      : DEFAULT_REVIVAL_STEPS.map((step, idx) => ({
          id: `def-step-${idx}`,
          label: step.label,
          completed: false,
          category: step.category,
        }));

  const completedSteps = checklist.filter((item) => item.completed).length;
  const checklistProgress = Math.round((completedSteps / (checklist.length || 1)) * 100);

  const handleSaveAction = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (onSaveNextAction) {
      onSaveNextAction(project.id, nextActionInput.trim());
    }
    setEditingNextAction(false);
  };

  const handleAddStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStepInput.trim()) return;
    if (onAddChecklistItem) {
      onAddChecklistItem(project.id, newStepInput.trim());
      setNewStepInput("");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={project.name}
      description={project.tagline}
      className="max-w-3xl max-h-[92vh] flex flex-col"
    >
      <div className="flex flex-col flex-1 overflow-hidden space-y-3">
        {/* Top Badges & Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-[#D1D9E0]/60">
          <div className="flex flex-wrap items-center gap-2">
            <Badge status={project.status} withIcon />
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full font-medium border ${
                project.isPublic
                  ? "bg-[#DAFBE8] text-[#1F883D] border-[#1F883D]/40"
                  : "bg-[#F6F8FA] text-[#59636E] border-[#D1D9E0]"
              }`}
            >
              {project.isPublic ? (
                <>
                  <Globe className="w-3 h-3 text-[#1F883D]" />
                  <span>Public Graveyard</span>
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3 text-[#59636E]" />
                  <span>Private Vault</span>
                </>
              )}
            </span>
            {project.isPublic && project.collaborationStatus && (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#0969DA] bg-[#DDF4FF] border border-[#54AEFF]/40 px-2 py-0.5 rounded-full font-medium">
                <Users className="w-3 h-3" />
                <span>
                  {project.collaborationStatus === "open_to_collaborators"
                    ? "Open to Collaborators"
                    : project.collaborationStatus === "open_to_adoption"
                    ? "Open to Adoption"
                    : project.collaborationStatus === "feedback_only"
                    ? "Feedback Only"
                    : project.collaborationStatus === "invitation_only"
                    ? "Invitation Only"
                    : "Closed"}
                </span>
              </span>
            )}
            {project.worthRevisiting && (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#0969DA] bg-[#DDF4FF] border border-[#54AEFF]/40 px-2 py-0.5 rounded-full font-medium">
                <Compass className="w-3 h-3 text-[#0969DA]" />
                Worth Revisiting
              </span>
            )}
            <span className="text-xs font-mono text-[#59636E] flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Last active: {project.lastActiveDate || project.lastUpdated}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(project)}
              className="text-xs gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#59636E]" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => onDelete(project)}
              className="text-xs gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </Button>
          </div>
        </div>

        {/* Next Action Prominent Callout Banner */}
        <div className="p-3 rounded-md bg-[#F6F8FA] border border-[#D1D9E0] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-start gap-2.5 flex-1 min-w-0">
            <div className="w-6 h-6 rounded bg-[#DDF4FF] border border-[#54AEFF]/40 flex items-center justify-center text-[#0969DA] shrink-0 mt-0.5">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#0969DA] font-bold block">
                Defined Next Action
              </span>
              {editingNextAction ? (
                <form onSubmit={handleSaveAction} className="flex items-center gap-2 mt-1">
                  <Input
                    type="text"
                    value={nextActionInput}
                    onChange={(e) => setNextActionInput(e.target.value)}
                    placeholder="e.g. Audit Rust AST bindings or fix CORS headers..."
                    className="text-xs h-8 bg-white border-[#D1D9E0]"
                    autoFocus
                  />
                  <Button type="submit" size="sm" variant="primary" className="text-xs h-8 shrink-0">
                    Save
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingNextAction(false)}
                    className="text-xs h-8 shrink-0"
                  >
                    Cancel
                  </Button>
                </form>
              ) : (
                <p className="text-xs text-[#1F2328] font-medium mt-0.5">
                  {project.nextAction || (
                    <span className="text-[#9A6700] italic">
                      No concrete next action set. Review blockers and define a revival step.
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>

          {!editingNextAction && (
            <button
              type="button"
              onClick={() => {
                setNextActionInput(project.nextAction || "");
                setEditingNextAction(true);
              }}
              className="text-xs font-semibold text-[#0969DA] hover:underline cursor-pointer shrink-0 self-start sm:self-auto"
            >
              {project.nextAction ? "Edit action" : "Assign next step"}
            </button>
          )}
        </div>

        {/* Links Ribbon */}
        <div className="px-3 py-2 rounded-md bg-[#F6F8FA] border border-[#D1D9E0]/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-3">
            {project.repoUrl ? (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[#0969DA] hover:underline font-medium"
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>Source Repository</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <span className="text-[#8C959F] flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5" />
                No repo link
              </span>
            )}

            {project.demoUrl ? (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[#1A7F37] hover:underline font-medium"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Live Demo</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : null}

            {/* Developer Tooling Fast Actions */}
            <button
              type="button"
              onClick={() => setBadgeModalOpen(true)}
              className="flex items-center gap-1 text-[#59636E] hover:text-[#0969DA] transition-colors cursor-pointer font-medium ml-1"
            >
              <Shield className="w-3.5 h-3.5 text-[#0969DA]" />
              <span>Badge</span>
            </button>

            <button
              type="button"
              onClick={() => setSandboxModalOpen(true)}
              className="flex items-center gap-1 text-[#59636E] hover:text-[#0969DA] transition-colors cursor-pointer font-medium"
            >
              <Terminal className="w-3.5 h-3.5 text-[#1F883D]" />
              <span>Cloud Sandbox</span>
            </button>

            <button
              type="button"
              onClick={() => setSyncModalOpen(true)}
              className="flex items-center gap-1 text-[#59636E] hover:text-[#0969DA] transition-colors cursor-pointer font-medium"
            >
              <Radio className="w-3.5 h-3.5 text-[#8250DF]" />
              <span>GitHub Sync</span>
            </button>

            {(project.collaborationStatus === "open_to_adoption" || project.status === "Abandoned") && (
              <button
                type="button"
                onClick={() => setAdoptModalOpen(true)}
                className="flex items-center gap-1 text-[#59636E] hover:text-[#1F883D] transition-colors cursor-pointer font-medium"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                <span>Adoption</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 text-[#59636E]">
            <span>
              Maturity:{" "}
              <strong className="text-[#1F2328] font-bold">{project.completionRate}%</strong>
            </span>
            <span>
              Preserved:{" "}
              <strong className="text-[#1F2328]">{formatDate(project.createdAt)}</strong>
            </span>
          </div>
        </div>

        {/* Clean Navigation Tabs */}
        <div className="flex items-center gap-1 border-b border-[#D1D9E0] pb-2 overflow-x-auto scrollbar-none">
          {[
            { id: "overview" as DetailTab, label: "Overview" },
            { id: "tech" as DetailTab, label: "Tech Stack" },
            { id: "blockers" as DetailTab, label: "Blockers & Post-Mortem" },
            {
              id: "features" as DetailTab,
              label: `Features (${(project.completedFeatures?.length || 0) + (project.unfinishedFeatures?.length || 0)})`,
            },
            {
              id: "revival" as DetailTab,
              label: "Revival Plan",
              highlight: true,
            },
            {
              id: "autopsy" as DetailTab,
              label: `Autopsy & Bit-Rot ${project.autopsy ? `(${project.autopsy.rotIndex}/100)` : ""}`,
              highlight: true,
            },
            {
              id: "harvest" as DetailTab,
              label: `Code Harvest (${project.harvestGems?.length || 0})`,
            },
            {
              id: "timeline" as DetailTab,
              label: `Timeline (${project.history?.length || 0})`,
            },
          ].map((tab) => {
            const isActive =
              activeTab === tab.id ||
              (tab.id === "blockers" && activeTab === "postmortem");
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap select-none ${
                  isActive
                    ? "bg-[#F6F8FA] text-[#1F2328] border border-[#D1D9E0] font-semibold"
                    : tab.highlight
                    ? "text-[#0969DA] hover:bg-[#DDF4FF]/40 font-semibold"
                    : "text-[#59636E] hover:text-[#1F2328] hover:bg-[#F6F8FA]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="overflow-y-auto pr-1 space-y-3.5 max-h-[50vh]">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-md bg-[#F6F8FA] border border-[#D1D9E0]">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#1F883D] font-semibold block mb-1">
                    Original Problem
                  </span>
                  <p className="text-xs text-[#1F2328] leading-relaxed">
                    {project.originalProblem ||
                      "No explicit problem statement recorded when preserved."}
                  </p>
                </div>

                <div className="p-3.5 rounded-md bg-[#F6F8FA] border border-[#D1D9E0]">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#0969DA] font-semibold block mb-1">
                    Intended Users
                  </span>
                  <p className="text-xs text-[#1F2328] leading-relaxed">
                    {project.intendedUsers || "General software developers."}
                  </p>
                </div>
              </div>

              {/* Technical Description */}
              <div className="space-y-1">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#59636E] font-semibold">
                  Architectural Summary
                </h4>
                <p className="text-xs sm:text-sm text-[#1F2328] leading-relaxed p-3.5 rounded-md bg-[#F6F8FA] border border-[#D1D9E0]">
                  {project.description}
                </p>
              </div>

              {/* Author & Vault Metadata */}
              <div className="flex items-center justify-between p-3 rounded-md bg-[#F6F8FA] border border-[#D1D9E0] text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-white border border-[#D1D9E0] flex items-center justify-center font-bold text-[#1F2328] text-xs">
                    {project.author?.avatar || "DR"}
                  </div>
                  <div>
                    <p className="font-semibold text-[#1F2328]">
                      {project.author?.name || "Devon Reed"}
                    </p>
                    <p className="text-[10px] font-mono text-[#59636E]">
                      {project.author?.handle || "@devonreed"}
                    </p>
                  </div>
                </div>

                <div className="text-right font-mono text-[11px] text-[#59636E]">
                  <p>
                    Revival Potential:{" "}
                    <strong className="text-[#1F883D] font-bold">
                      {project.revivalPotential}
                    </strong>
                  </p>
                  {project.stars !== undefined && project.stars > 0 && (
                    <p>{project.stars} GitHub stars</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TECH STACK */}
          {activeTab === "tech" && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="space-y-2 p-3.5 rounded-md bg-[#F6F8FA] border border-[#D1D9E0]">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#1F883D] font-semibold flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#1F883D]" />
                  <span>Detected Technology Stack</span>
                </h4>
                <div className="flex flex-wrap gap-2 pt-1">
                  {project.techTags.map((tech) => (
                    <Badge key={tech} variant="tech" className="text-xs py-1 px-2.5">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-md bg-[#F6F8FA] border border-[#D1D9E0] space-y-1">
                  <span className="font-semibold text-[#1F2328] block">Primary Language</span>
                  <p className="text-[#59636E] font-mono">
                    {project.techTags[0] || "TypeScript"}
                  </p>
                </div>
                <div className="p-3.5 rounded-md bg-[#F6F8FA] border border-[#D1D9E0] space-y-1">
                  <span className="font-semibold text-[#1F2328] block">Runtime &amp; Target</span>
                  <p className="text-[#59636E] font-mono">
                    {project.techTags.slice(1).join(", ") || "Standard Node/Web"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BLOCKERS & POST-MORTEM */}
          {(activeTab === "blockers" || activeTab === "postmortem") && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-md bg-[#FFF8C5] border border-[#D4A72C]/40 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-mono text-[#9A6700] font-semibold uppercase">
                  <AlertTriangle className="w-4 h-4 text-[#9A6700]" />
                  <span>Tombstone Reason for Abandonment</span>
                </div>
                <p className="text-xs sm:text-sm text-[#1F2328] leading-relaxed italic">
                  &ldquo;{project.abandonedReason}&rdquo;
                </p>
              </div>

              <div className="p-3.5 rounded-md bg-[#F6F8FA] border border-[#D1D9E0] space-y-1">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#D1242F] font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#D1242F]" />
                  <span>Main Technical Blockers</span>
                </h4>
                <p className="text-xs text-[#59636E] leading-relaxed">
                  {project.mainBlockers || "No specific platform blockers recorded."}
                </p>
              </div>

              <div className="p-3.5 rounded-md bg-[#F6F8FA] border border-[#D1D9E0] space-y-1">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#1F883D] font-semibold flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-[#1F883D]" />
                  <span>Lessons Learned for Successors</span>
                </h4>
                <p className="text-xs text-[#59636E] leading-relaxed">
                  {project.lessonsLearned || "No architectural caveats noted."}
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: FEATURES */}
          {activeTab === "features" && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              {/* Completed Features */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#1A7F37] font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#1F883D]" />
                  <span>Completed &amp; Functional Features ({project.completedFeatures?.length || 0})</span>
                </h4>
                {project.completedFeatures && project.completedFeatures.length > 0 ? (
                  <div className="space-y-1.5">
                    {project.completedFeatures.map((feat, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 p-2.5 rounded-md bg-[#DAFBE1]/40 border border-[#4AC26B]/40 text-xs text-[#1F2328]"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#1F883D] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#59636E] italic p-2 bg-[#F6F8FA] rounded-md border border-[#D1D9E0]">
                    No completed features logged.
                  </p>
                )}
              </div>

              {/* Unfinished / Pending Features */}
              <div className="space-y-1.5 pt-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#9A6700] font-semibold flex items-center gap-1.5">
                  <ListTodo className="w-4 h-4 text-[#9A6700]" />
                  <span>Pending Primitives Needed for Revival ({project.unfinishedFeatures?.length || 0})</span>
                </h4>
                {project.unfinishedFeatures && project.unfinishedFeatures.length > 0 ? (
                  <div className="space-y-1.5">
                    {project.unfinishedFeatures.map((feat, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 p-2.5 rounded-md bg-[#FFF8C5]/50 border border-[#D4A72C]/40 text-xs text-[#1F2328]"
                      >
                        <ListTodo className="w-3.5 h-3.5 text-[#9A6700] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#59636E] italic p-2 bg-[#F6F8FA] rounded-md border border-[#D1D9E0]">
                    All planned initial features were finished before abandonment.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: REVIVAL PLAN (ACTIONABLE ENGINE) */}
          {activeTab === "revival" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Progress Summary Card */}
              <div className="p-3.5 rounded-md bg-[#F6F8FA] border border-[#D1D9E0] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-[#1F883D]" />
                    <span className="font-semibold text-[#1F2328]">
                      Revival Execution Checklist
                    </span>
                  </div>
                  <span className="font-mono text-[#59636E]">
                    {completedSteps} of {checklist.length} steps completed ({checklistProgress}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#D1D9E0]/60 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#1F883D] transition-all duration-300"
                    style={{ width: `${checklistProgress}%` }}
                  />
                </div>
              </div>

              {/* Checklist Items */}
              <div className="space-y-2">
                {checklist.map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-start gap-3 p-3 rounded-md border transition-all cursor-pointer text-xs select-none ${
                      item.completed
                        ? "bg-[#DAFBE1]/30 border-[#4AC26B]/50 text-[#1F2328]"
                        : "bg-white border-[#D1D9E0] hover:border-[#0969DA]/50 text-[#1F2328]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => {
                        if (onToggleChecklistItem) {
                          onToggleChecklistItem(project.id, item.id);
                        }
                      }}
                      className="w-4 h-4 rounded border-[#D1D9E0] text-[#1F883D] focus:ring-[#1F883D] mt-0.5"
                    />
                    <div className="flex-1">
                      <span className={item.completed ? "line-through text-[#59636E]" : "font-medium"}>
                        {item.label}
                      </span>
                    </div>
                    {item.category && (
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#F6F8FA] border border-[#D1D9E0] text-[#59636E]">
                        {item.category}
                      </span>
                    )}
                  </label>
                ))}
              </div>

              {/* Add Custom Checklist Step */}
              {onAddChecklistItem && (
                <form onSubmit={handleAddStep} className="flex items-center gap-2 pt-1">
                  <Input
                    type="text"
                    value={newStepInput}
                    onChange={(e) => setNewStepInput(e.target.value)}
                    placeholder="Add custom task (e.g. Audit SQLite schema migrations)..."
                    className="text-xs h-8 bg-white border-[#D1D9E0]"
                  />
                  <Button type="submit" size="sm" variant="outline" className="text-xs h-8 gap-1 shrink-0">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Task</span>
                  </Button>
                </form>
              )}

              {/* Quick Status Advancement CTA */}
              <div className="p-3 rounded-md bg-[#DDF4FF]/40 border border-[#54AEFF]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                <div>
                  <span className="font-semibold text-[#1F2328] block">
                    Ready to advance development?
                  </span>
                  <span className="text-[#59636E]">
                    Switch status to mark this project active in your team backlog.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {project.status !== "Revived" && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => onUpdateStatus(project.id, "Revived")}
                      className="text-xs"
                    >
                      Mark as Revived
                    </Button>
                  )}
                  {project.status === "Abandoned" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUpdateStatus(project.id, "Under Review")}
                      className="text-xs"
                    >
                      Move to Review
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: TIMELINE */}
          {activeTab === "timeline" && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="text-xs text-[#59636E] flex items-center justify-between pb-1">
                <span className="font-mono uppercase text-[11px]">
                  Chronological Vault History
                </span>
                <span className="font-mono text-[11px] text-[#1F883D] font-medium">
                  {project.history?.length || 0} recorded events
                </span>
              </div>

              {project.history && project.history.length > 0 ? (
                <div className="relative border-l border-[#D1D9E0] ml-3 space-y-5 py-1.5">
                  {project.history.map((event, idx) => {
                    const isStatus = event.type === "status_change";
                    const isCreated = event.type === "created";

                    return (
                      <div key={event.id || idx} className="relative pl-5">
                        <div
                          className={`absolute -left-1.5 top-0.5 w-3 h-3 rounded-full border-2 bg-white ${
                            isStatus
                              ? "border-[#0969DA]"
                              : isCreated
                              ? "border-[#1F883D]"
                              : "border-[#8C959F]"
                          }`}
                        />

                        <div>
                          <div className="flex flex-wrap items-center justify-between gap-1 mb-0.5">
                            <span className="text-xs font-semibold text-[#1F2328]">
                              {event.title}
                            </span>
                            <span className="text-[10px] font-mono text-[#59636E] flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDateTime(event.timestamp)}
                            </span>
                          </div>

                          <p className="text-xs text-[#59636E] leading-relaxed">
                            {event.description}
                          </p>

                          {event.actor && (
                            <span className="inline-block mt-1 text-[10px] font-mono text-[#8C959F]">
                              By {event.actor}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-[#59636E] italic p-3 bg-[#F6F8FA] rounded-md border border-[#D1D9E0]">
                  No development history logged yet.
                </p>
              )}
            </div>
          )}
          {/* TAB: AUTOPSY & BIT-ROT */}
          {activeTab === "autopsy" && (
            <ProjectAutopsyView
              project={project}
              onAutopsyUpdated={(newAutopsy) => {
                project.autopsy = newAutopsy;
              }}
            />
          )}

          {/* TAB: CODE HARVEST */}
          {activeTab === "harvest" && (
            <HarvestGemsView
              project={project}
              onGemsUpdated={(newGems) => {
                project.harvestGems = newGems;
              }}
            />
          )}
        </div>

        {/* Bottom Lifecycle Actions Bar */}
        <div className="pt-3 border-t border-[#D1D9E0]/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono text-[#59636E] mr-1">Status:</span>
            {(["Abandoned", "Under Review", "Revived", "Archived"] as ProjectStatus[]).map(
              (st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => onUpdateStatus(project.id, st)}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors cursor-pointer border select-none ${
                    project.status === st
                      ? "bg-[#F6F8FA] border-[#D1D9E0] text-[#1F2328] font-bold shadow-2xs"
                      : "bg-white border-[#D1D9E0] text-[#59636E] hover:text-[#1F2328] hover:bg-[#F6F8FA]"
                  }`}
                >
                  {st}
                </button>
              )
            )}
          </div>

          <Button variant="outline" size="sm" onClick={onClose}>
            Close View
          </Button>
        </div>
      </div>

      {/* Dynamic README Badge Modal */}
      <DynamicBadgeModal
        project={project}
        isOpen={badgeModalOpen}
        onClose={() => setBadgeModalOpen(false)}
      />

      {/* Zero-Install Cloud Sandbox Modal */}
      <CloudSandboxModal
        project={project}
        isOpen={sandboxModalOpen}
        onClose={() => setSandboxModalOpen(false)}
      />

      {/* GitHub Sync & Heartbeat Modal */}
      <GitHubSyncModal
        project={project}
        isOpen={syncModalOpen}
        onClose={() => setSyncModalOpen(false)}
      />

      {/* Maintainer Handover & Adoption Protocol Modal */}
      <AdoptionProtocolModal
        project={project}
        isOpen={adoptModalOpen}
        onClose={() => setAdoptModalOpen(false)}
        onAdoptionCompleted={() => {
          onUpdateStatus(project.id, "Revived");
          setAdoptModalOpen(false);
        }}
      />
    </Modal>
  );
}
