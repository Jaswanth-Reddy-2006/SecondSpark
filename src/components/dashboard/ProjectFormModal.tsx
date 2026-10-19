"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Project, ProjectStatus } from "@/types/project";
import { CollaborationStatus } from "@/types/community";
import {
  GitBranch,
  Globe,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  ListTodo,
  Layers,
  FileText,
  Sparkles,
  Lock,
} from "lucide-react";

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (projectData: Partial<Project>) => void;
  initialProject?: Partial<Project> | null;
  onOpenGitHubImport?: () => void;
}

export function ProjectFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialProject,
  onOpenGitHubImport,
}: ProjectFormModalProps) {
  const isEditing = Boolean(initialProject && initialProject.id);

  const [activeTab, setActiveTab] = useState<"basics" | "stack" | "postmortem" | "visibility">("basics");

  const [name, setName] = useState(() => initialProject?.name || "");
  const [tagline, setTagline] = useState(() => initialProject?.tagline || "");
  const [originalProblem, setOriginalProblem] = useState(() => initialProject?.originalProblem || "");
  const [intendedUsers, setIntendedUsers] = useState(() => initialProject?.intendedUsers || "");
  const [description, setDescription] = useState(() => initialProject?.description || "");
  const [status, setStatus] = useState<ProjectStatus>(() => initialProject?.status || "Abandoned");
  const [completionRate, setCompletionRate] = useState<number>(() => initialProject?.completionRate ?? 70);

  const [techTags, setTechTags] = useState<string[]>(() => initialProject?.techTags || ["TypeScript", "React"]);
  const [techTagInput, setTechTagInput] = useState("");
  const [repoUrl, setRepoUrl] = useState(() => initialProject?.repoUrl || "");
  const [demoUrl, setDemoUrl] = useState(() => initialProject?.demoUrl || "");
  const [lastActiveDate, setLastActiveDate] = useState(
    () => initialProject?.lastActiveDate || initialProject?.lastUpdated || "2024-03-01"
  );

  const [abandonedReason, setAbandonedReason] = useState(() => initialProject?.abandonedReason || "");
  const [completedFeatures, setCompletedFeatures] = useState<string[]>(() => initialProject?.completedFeatures || []);
  const [newCompletedFeature, setNewCompletedFeature] = useState("");
  const [unfinishedFeatures, setUnfinishedFeatures] = useState<string[]>(() => initialProject?.unfinishedFeatures || []);
  const [newUnfinishedFeature, setNewUnfinishedFeature] = useState("");
  const [mainBlockers, setMainBlockers] = useState(() => initialProject?.mainBlockers || "");
  const [lessonsLearned, setLessonsLearned] = useState(() => initialProject?.lessonsLearned || "");
  const [nextAction, setNextAction] = useState(() => initialProject?.nextAction || "");

  // Community & Visibility settings
  const [isPublic, setIsPublic] = useState<boolean>(() => Boolean(initialProject?.isPublic));
  const [collaborationStatus, setCollaborationStatus] = useState<CollaborationStatus>(
    () => initialProject?.collaborationStatus || "feedback_only"
  );
  const [skillsNeeded, setSkillsNeeded] = useState<string[]>(() => initialProject?.skillsNeeded || []);
  const [skillInput, setSkillInput] = useState("");

  const handleAddSkill = () => {
    const trimmed = skillInput.trim().replace(/^,+|,+$/g, "");
    if (!trimmed) return;
    const parts = trimmed.split(",").map((p) => p.trim()).filter(Boolean);
    const combined = Array.from(new Set([...skillsNeeded, ...parts]));
    setSkillsNeeded(combined);
    setSkillInput("");
  };

  const handleRemoveSkill = (skill: string) => {
    setSkillsNeeded((prev) => prev.filter((s) => s !== skill));
  };

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) return true;
    try {
      const parsed = new URL(url.trim());
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Project name is required.";
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters.";
    }

    if (!tagline.trim()) {
      newErrors.tagline = "A one-line tagline is required.";
    }

    if (!description.trim()) {
      newErrors.description = "Technical description is required.";
    } else if (description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters.";
    }

    if (!originalProblem.trim()) {
      newErrors.originalProblem = "Original problem statement is required.";
    }

    if (!intendedUsers.trim()) {
      newErrors.intendedUsers = "Target user audience is required.";
    }

    if (techTags.length === 0) {
      newErrors.techTags = "Add at least one technology tag.";
    }

    if (!abandonedReason.trim()) {
      newErrors.abandonedReason = "Abandonment reason is required.";
    }

    if (!lastActiveDate.trim()) {
      newErrors.lastActiveDate = "Last active date is required.";
    }

    if (repoUrl && !validateUrl(repoUrl)) {
      newErrors.repoUrl = "Must be a valid URL starting with http:// or https://";
    }

    if (demoUrl && !validateUrl(demoUrl)) {
      newErrors.demoUrl = "Must be a valid URL starting with http:// or https://";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTechTag = () => {
    const trimmed = techTagInput.trim().replace(/^,+|,+$/g, "");
    if (!trimmed) return;
    const parts = trimmed.split(",").map((p) => p.trim()).filter(Boolean);
    const combined = Array.from(new Set([...techTags, ...parts]));
    setTechTags(combined);
    setTechTagInput("");
    if (errors.techTags) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.techTags;
        return copy;
      });
    }
  };

  const handleRemoveTechTag = (tag: string) => {
    setTechTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleAddCompletedFeature = () => {
    if (!newCompletedFeature.trim()) return;
    setCompletedFeatures((prev) => [...prev, newCompletedFeature.trim()]);
    setNewCompletedFeature("");
  };

  const handleRemoveCompletedFeature = (index: number) => {
    setCompletedFeatures((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddUnfinishedFeature = () => {
    if (!newUnfinishedFeature.trim()) return;
    setUnfinishedFeatures((prev) => [...prev, newUnfinishedFeature.trim()]);
    setNewUnfinishedFeature("");
  };

  const handleRemoveUnfinishedFeature = (index: number) => {
    setUnfinishedFeatures((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validate()) {
      if (
        errors.name ||
        errors.tagline ||
        errors.description ||
        errors.originalProblem ||
        errors.intendedUsers
      ) {
        setActiveTab("basics");
      } else if (
        errors.techTags ||
        errors.repoUrl ||
        errors.demoUrl ||
        errors.lastActiveDate
      ) {
        setActiveTab("stack");
      } else {
        setActiveTab("postmortem");
      }
      return;
    }

    setIsSubmitting(true);

    const projectPayload: Partial<Project> = {
      ...(initialProject || {}),
      name: name.trim(),
      tagline: tagline.trim(),
      originalProblem: originalProblem.trim(),
      intendedUsers: intendedUsers.trim(),
      description: description.trim(),
      techTags,
      repoUrl: repoUrl.trim() || undefined,
      demoUrl: demoUrl.trim() || undefined,
      status,
      completionRate: Number(completionRate) || 50,
      worthRevisiting: status === "Revived" ? false : completionRate >= 60,
      lastActiveDate: lastActiveDate.trim(),
      abandonedReason: abandonedReason.trim(),
      completedFeatures,
      unfinishedFeatures,
      mainBlockers: mainBlockers.trim() || "None formally logged.",
      lessonsLearned: lessonsLearned.trim() || "Architecture documentation preserved.",
      nextAction: nextAction.trim() || undefined,
      revivalPotential:
        completionRate >= 75 ? "High" : completionRate >= 50 ? "Moderate" : "Low",
      isPublic,
      collaborationStatus: isPublic ? collaborationStatus : "closed",
      skillsNeeded: isPublic ? skillsNeeded : [],
    };

    onSubmit(projectPayload);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit: ${initialProject?.name}` : "Resurrect a Project"}
      description={
        isEditing
          ? "Update the project's tombstone details, stack specifications, and development roadmap."
          : "Preserve an abandoned repository with full architectural memory, problem context, and revival viability."
      }
      className="max-w-2xl max-h-[90vh] flex flex-col"
    >
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
        {/* Quick GitHub import banner if creating */}
        {!isEditing && onOpenGitHubImport && (
          <div className="mb-3.5 p-2.5 rounded-md bg-[#F6F8FA] border border-[#D1D9E0] flex items-center justify-between text-xs">
            <span className="text-[#59636E] flex items-center gap-1.5 font-medium">
              <GitBranch className="w-3.5 h-3.5 text-[#1F883D]" />
              Importing from an existing GitHub repository?
            </span>
            <button
              type="button"
              onClick={onOpenGitHubImport}
              className="text-xs font-semibold text-[#0969DA] hover:underline"
            >
              Fetch via GitHub &rarr;
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 border-b border-[#D1D9E0] pb-2.5 mb-3.5">
          <button
            type="button"
            onClick={() => setActiveTab("basics")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer select-none ${
              activeTab === "basics"
                ? "bg-[#F6F8FA] text-[#1F2328] border border-[#D1D9E0] font-semibold"
                : "text-[#59636E] hover:text-[#1F2328] hover:bg-[#F6F8FA]"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>1. Identity &amp; Purpose</span>
            {(errors.name || errors.tagline || errors.description || errors.originalProblem || errors.intendedUsers) && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#D1242F]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("stack")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer select-none ${
              activeTab === "stack"
                ? "bg-[#F6F8FA] text-[#1F2328] border border-[#D1D9E0] font-semibold"
                : "text-[#59636E] hover:text-[#1F2328] hover:bg-[#F6F8FA]"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2. Stack &amp; Links</span>
            {(errors.techTags || errors.repoUrl || errors.demoUrl || errors.lastActiveDate) && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#D1242F]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("postmortem")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer select-none ${
              activeTab === "postmortem"
                ? "bg-[#F6F8FA] text-[#1F2328] border border-[#D1D9E0] font-semibold"
                : "text-[#59636E] hover:text-[#1F2328] hover:bg-[#F6F8FA]"
            }`}
          >
            <ListTodo className="w-3.5 h-3.5" />
            <span>3. Post-Mortem &amp; Roadmap</span>
            {errors.abandonedReason && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#D1242F]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("visibility")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer select-none ${
              activeTab === "visibility"
                ? "bg-[#F6F8FA] text-[#1F2328] border border-[#D1D9E0] font-semibold"
                : "text-[#59636E] hover:text-[#1F2328] hover:bg-[#F6F8FA]"
            }`}
          >
            {isPublic ? (
              <Globe className="w-3.5 h-3.5 text-[#1F883D]" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-[#59636E]" />
            )}
            <span>4. Visibility &amp; Community</span>
            {isPublic && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#1F883D]" />
            )}
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="overflow-y-auto pr-1 space-y-3.5 max-h-[58vh]">
          {/* TAB 1: BASICS */}
          {activeTab === "basics" && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#1F2328] mb-1">
                    Project Name *
                  </label>
                  <Input
                    placeholder="e.g. DocuPulse, GhostDB"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                    }}
                    className={errors.name ? "border-[#D1242F] focus-visible:border-[#D1242F]" : ""}
                  />
                  {errors.name && (
                    <p className="mt-1 text-[11px] text-[#D1242F] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F2328] mb-1">
                    Graveyard Lifecycle Status *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                    className="w-full h-8 rounded-md border border-[#D1D9E0] bg-white px-2.5 text-xs text-[#1F2328] focus:outline-none focus:border-[#0969DA] focus:ring-1 focus:ring-[#0969DA] cursor-pointer"
                  >
                    <option value="Abandoned">Abandoned (Dormant)</option>
                    <option value="Under Review">Under Review (Evaluating Resurgence)</option>
                    <option value="Revived">Revived (Back in Production)</option>
                    <option value="Archived">Archived (Retired with Memory)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F2328] mb-1">
                  One-Line Tagline *
                </label>
                <Input
                  placeholder="e.g. Instant headless documentation generator from OpenAPI schemas"
                  value={tagline}
                  onChange={(e) => {
                    setTagline(e.target.value);
                    if (errors.tagline) setErrors((prev) => ({ ...prev, tagline: "" }));
                  }}
                  className={errors.tagline ? "border-[#D1242F]" : ""}
                />
                {errors.tagline && (
                  <p className="mt-1 text-[11px] text-[#D1242F] flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.tagline}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#1F2328] mb-1">
                    Original Problem Solved *
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Why did you start building this? What was the acute pain point?"
                    value={originalProblem}
                    onChange={(e) => {
                      setOriginalProblem(e.target.value);
                      if (errors.originalProblem)
                        setErrors((prev) => ({ ...prev, originalProblem: "" }));
                    }}
                    className={`w-full rounded-md border border-[#D1D9E0] bg-white p-2.5 text-xs text-[#1F2328] placeholder:text-[#8C959F] focus:outline-none focus:border-[#0969DA] focus:ring-1 focus:ring-[#0969DA] ${
                      errors.originalProblem ? "border-[#D1242F]" : ""
                    }`}
                  />
                  {errors.originalProblem && (
                    <p className="mt-1 text-[11px] text-[#D1242F] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.originalProblem}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F2328] mb-1">
                    Intended Users &amp; Audience *
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Who was this built for? (e.g. Solo founders, Rust devs, DevOps)"
                    value={intendedUsers}
                    onChange={(e) => {
                      setIntendedUsers(e.target.value);
                      if (errors.intendedUsers)
                        setErrors((prev) => ({ ...prev, intendedUsers: "" }));
                    }}
                    className={`w-full rounded-md border border-[#D1D9E0] bg-white p-2.5 text-xs text-[#1F2328] placeholder:text-[#8C959F] focus:outline-none focus:border-[#0969DA] focus:ring-1 focus:ring-[#0969DA] ${
                      errors.intendedUsers ? "border-[#D1242F]" : ""
                    }`}
                  />
                  {errors.intendedUsers && (
                    <p className="mt-1 text-[11px] text-[#D1242F] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.intendedUsers}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F2328] mb-1">
                  Technical Architecture &amp; Overview *
                </label>
                <textarea
                  rows={3}
                  placeholder="Detailed breakdown of the architecture, data flow, and runtime requirements."
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (errors.description)
                      setErrors((prev) => ({ ...prev, description: "" }));
                  }}
                  className={`w-full rounded-md border border-[#D1D9E0] bg-white p-2.5 text-xs text-[#1F2328] placeholder:text-[#8C959F] focus:outline-none focus:border-[#0969DA] focus:ring-1 focus:ring-[#0969DA] ${
                    errors.description ? "border-[#D1242F]" : ""
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-[11px] text-[#D1242F] flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.description}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-mono text-[#1F2328] mb-1">
                  <span>Codebase Completion Rate: {completionRate}%</span>
                  <span className="text-[#59636E]">
                    {completionRate >= 80
                      ? "Near Production"
                      : completionRate >= 50
                      ? "Functional Prototype"
                      : "Early Spike"}
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={completionRate}
                  onChange={(e) => setCompletionRate(Number(e.target.value))}
                  className="w-full accent-[#1F883D] bg-[#D1D9E0] h-1.5 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB 2: STACK & LINKS */}
          {activeTab === "stack" && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-semibold text-[#1F2328] mb-1">
                  Technology Stack Tags * (Press Enter or comma to add)
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="e.g. Next.js, Rust, SQLite, WebSockets"
                    value={techTagInput}
                    onChange={(e) => setTechTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        handleAddTechTag();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleAddTechTag}
                    className="shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Add
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 rounded-md bg-[#F6F8FA] border border-[#D1D9E0]">
                  {techTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white text-[#1F2328] border border-[#D1D9E0] text-xs font-mono shadow-2xs"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTechTag(tag)}
                        className="text-[#59636E] hover:text-[#D1242F] ml-1 cursor-pointer"
                        aria-label={`Remove ${tag}`}
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                  {techTags.length === 0 && (
                    <span className="text-xs text-[#59636E] italic p-0.5">
                      No tags added yet. Type a technology and click Add.
                    </span>
                  )}
                </div>
                {errors.techTags && (
                  <p className="mt-1 text-[11px] text-[#D1242F] flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.techTags}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#1F2328] mb-1">
                    GitHub / Source Repository URL
                  </label>
                  <Input
                    placeholder="https://github.com/org/repo"
                    value={repoUrl}
                    onChange={(e) => {
                      setRepoUrl(e.target.value);
                      if (errors.repoUrl) setErrors((prev) => ({ ...prev, repoUrl: "" }));
                    }}
                    icon={<GitBranch className="w-3.5 h-3.5 text-[#59636E]" />}
                    className={errors.repoUrl ? "border-[#D1242F]" : ""}
                  />
                  {errors.repoUrl && (
                    <p className="mt-1 text-[11px] text-[#D1242F] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.repoUrl}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F2328] mb-1">
                    Live Demo / Staging URL
                  </label>
                  <Input
                    placeholder="https://preview.app or https://app.dev"
                    value={demoUrl}
                    onChange={(e) => {
                      setDemoUrl(e.target.value);
                      if (errors.demoUrl) setErrors((prev) => ({ ...prev, demoUrl: "" }));
                    }}
                    icon={<Globe className="w-3.5 h-3.5 text-[#59636E]" />}
                    className={errors.demoUrl ? "border-[#D1242F]" : ""}
                  />
                  {errors.demoUrl && (
                    <p className="mt-1 text-[11px] text-[#D1242F] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.demoUrl}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F2328] mb-1">
                  Last Active Commit / Work Date *
                </label>
                <Input
                  type="date"
                  value={lastActiveDate}
                  onChange={(e) => {
                    setLastActiveDate(e.target.value);
                    if (errors.lastActiveDate)
                      setErrors((prev) => ({ ...prev, lastActiveDate: "" }));
                  }}
                  icon={<Calendar className="w-3.5 h-3.5 text-[#59636E]" />}
                  className={errors.lastActiveDate ? "border-[#D1242F]" : ""}
                />
                {errors.lastActiveDate && (
                  <p className="mt-1 text-[11px] text-[#D1242F] flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.lastActiveDate}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: POST-MORTEM & ROADMAP */}
          {activeTab === "postmortem" && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-semibold text-[#1F2328] mb-1">
                  Why was it abandoned? (Honest Tombstone Post-Mortem) *
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Lost developer momentum; switched to fulltime job; hit complex native C bindings."
                  value={abandonedReason}
                  onChange={(e) => {
                    setAbandonedReason(e.target.value);
                    if (errors.abandonedReason)
                      setErrors((prev) => ({ ...prev, abandonedReason: "" }));
                  }}
                  className={`w-full rounded-md border border-[#D1D9E0] bg-white p-2.5 text-xs text-[#1F2328] placeholder:text-[#8C959F] focus:outline-none focus:border-[#0969DA] focus:ring-1 focus:ring-[#0969DA] ${
                    errors.abandonedReason ? "border-[#D1242F]" : ""
                  }`}
                />
                {errors.abandonedReason && (
                  <p className="mt-1 text-[11px] text-[#D1242F] flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.abandonedReason}
                  </p>
                )}
              </div>

              {/* Completed Features */}
              <div>
                <label className="block text-xs font-semibold text-[#1F2328] mb-1">
                  Completed &amp; Working Features
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="e.g. WebAssembly OpenAPI parser, Dark mode viewer"
                    value={newCompletedFeature}
                    onChange={(e) => setNewCompletedFeature(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCompletedFeature();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleAddCompletedFeature}
                  >
                    Add
                  </Button>
                </div>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {completedFeatures.map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-md bg-[#F6F8FA] border border-[#D1D9E0] text-xs text-[#1F2328]"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#1F883D]" />
                        {feat}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCompletedFeature(idx)}
                        className="text-[#59636E] hover:text-[#D1242F] cursor-pointer"
                        aria-label="Remove feature"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {completedFeatures.length === 0 && (
                    <p className="text-xs text-[#59636E] italic p-1">
                      No completed features specified.
                    </p>
                  )}
                </div>
              </div>

              {/* Unfinished Features */}
              <div>
                <label className="block text-xs font-semibold text-[#1F2328] mb-1">
                  Unfinished &amp; Pending Features (Needed to Resurrect)
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="e.g. Multi-tenant auth layer, Docker helm chart"
                    value={newUnfinishedFeature}
                    onChange={(e) => setNewUnfinishedFeature(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddUnfinishedFeature();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleAddUnfinishedFeature}
                  >
                    Add
                  </Button>
                </div>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {unfinishedFeatures.map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-md bg-[#F6F8FA] border border-[#D1D9E0] text-xs text-[#1F2328]"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#D4A72C]" />
                        {feat}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveUnfinishedFeature(idx)}
                        className="text-[#59636E] hover:text-[#D1242F] cursor-pointer"
                        aria-label="Remove pending feature"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {unfinishedFeatures.length === 0 && (
                    <p className="text-xs text-[#59636E] italic p-1">
                      No pending features specified.
                    </p>
                  )}
                </div>
              </div>

              {/* Blockers & Lessons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#1F2328] mb-1">
                    Main Technical Blockers
                  </label>
                  <textarea
                    rows={2}
                    placeholder="What specific architectural hurdle or platform bug halted progress?"
                    value={mainBlockers}
                    onChange={(e) => setMainBlockers(e.target.value)}
                    className="w-full rounded-md border border-[#D1D9E0] bg-white p-2.5 text-xs text-[#1F2328] placeholder:text-[#8C959F] focus:outline-none focus:border-[#0969DA] focus:ring-1 focus:ring-[#0969DA]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F2328] mb-1">
                    Lessons Learned for Next Maintainer
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Advice, caveats, or shortcuts for whoever works on this next."
                    value={lessonsLearned}
                    onChange={(e) => setLessonsLearned(e.target.value)}
                    className="w-full rounded-md border border-[#D1D9E0] bg-white p-2.5 text-xs text-[#1F2328] placeholder:text-[#8C959F] focus:outline-none focus:border-[#0969DA] focus:ring-1 focus:ring-[#0969DA]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F2328] mb-1">
                  Concrete Next Action (Optional)
                </label>
                <Input
                  placeholder="e.g. Audit Rust AST bindings, reproduce bug in Docker, or migrate to Next.js 15..."
                  value={nextAction}
                  onChange={(e) => setNextAction(e.target.value)}
                />
                <p className="mt-1 text-[11px] text-[#59636E]">
                  A clear immediate step to kickstart resurrection when revisiting this project.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: VISIBILITY & COMMUNITY */}
          {activeTab === "visibility" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-semibold text-[#1F2328] mb-1">
                  Graveyard Visibility Mode *
                </label>
                <p className="text-[11px] text-[#59636E] mb-2.5">
                  Decide whether this repository is confidential to your private vault or published to the public developer community.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1: Private Vault */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setIsPublic(false)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setIsPublic(false);
                      }
                    }}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition-all select-none ${
                      !isPublic
                        ? "border-[#0969DA] bg-[#F6F8FA] ring-2 ring-[#0969DA]/20"
                        : "border-[#D1D9E0] bg-white hover:border-[#8C959F]"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Lock className={`w-4 h-4 ${!isPublic ? "text-[#0969DA]" : "text-[#59636E]"}`} />
                      <span className="text-xs font-semibold text-[#1F2328]">
                        Private Vault (Default)
                      </span>
                    </div>
                    <p className="text-[11px] text-[#59636E] leading-relaxed">
                      Visible only to your account. Completely hidden from community discovery, evaluation ratings, and public searches.
                    </p>
                  </div>

                  {/* Option 2: Public Community Graveyard */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setIsPublic(true)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setIsPublic(true);
                      }
                    }}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition-all select-none ${
                      isPublic
                        ? "border-[#1F883D] bg-[#F6F8FA] ring-2 ring-[#1F883D]/20"
                        : "border-[#D1D9E0] bg-white hover:border-[#8C959F]"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Globe className={`w-4 h-4 ${isPublic ? "text-[#1F883D]" : "text-[#59636E]"}`} />
                      <span className="text-xs font-semibold text-[#1F2328]">
                        Public Graveyard
                      </span>
                    </div>
                    <p className="text-[11px] text-[#59636E] leading-relaxed">
                      Listed on the public community graveyard feed. Developers can review, suggest architecture improvements, and apply to revive.
                    </p>
                  </div>
                </div>
              </div>

              {/* Public Community Options (Shown if isPublic is true) */}
              {isPublic && (
                <div className="space-y-3.5 pt-2 border-t border-[#D1D9E0] animate-in fade-in duration-150">
                  <div>
                    <label className="block text-xs font-semibold text-[#1F2328] mb-1">
                      Collaboration &amp; Resurgence Status
                    </label>
                    <select
                      value={collaborationStatus}
                      onChange={(e) => setCollaborationStatus(e.target.value as CollaborationStatus)}
                      className="w-full h-8 rounded-md border border-[#D1D9E0] bg-white px-2.5 text-xs text-[#1F2328] focus:outline-none focus:border-[#0969DA] focus:ring-1 focus:ring-[#0969DA] cursor-pointer"
                    >
                      <option value="open_to_collaborators">
                        Open to Collaborators — Seeking co-maintainers or task helpers
                      </option>
                      <option value="feedback_only">
                        Feedback Only — Seeking architectural reviews and suggestions
                      </option>
                      <option value="open_to_adoption">
                        Open to Adoption — Seeking new steward to take over maintainership
                      </option>
                      <option value="invitation_only">
                        Invitation Only — Collaboration by direct owner invite only
                      </option>
                      <option value="closed">
                        Closed — Listed for historical exploration only
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1F2328] mb-1">
                      Skills &amp; Roles Needed (Press Enter or comma to add)
                    </label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        placeholder="e.g. Rust, WebAssembly, Kubernetes, UX Designer"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === ",") {
                            e.preventDefault();
                            handleAddSkill();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={handleAddSkill}
                        className="shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Add Skill
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 rounded-md bg-[#F6F8FA] border border-[#D1D9E0]">
                      {skillsNeeded.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white text-[#1F2328] border border-[#D1D9E0] text-xs font-mono shadow-2xs"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="text-[#59636E] hover:text-[#D1242F] ml-1 cursor-pointer"
                            aria-label={`Remove ${skill}`}
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                      {skillsNeeded.length === 0 && (
                        <span className="text-xs text-[#59636E] italic p-0.5">
                          No specific contributor skills specified yet.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="pt-3.5 mt-3.5 border-t border-[#D1D9E0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            {activeTab !== "basics" && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (activeTab === "visibility") setActiveTab("postmortem");
                  else if (activeTab === "postmortem") setActiveTab("stack");
                  else setActiveTab("basics");
                }}
              >
                &larr; Previous
              </Button>
            )}
            {activeTab !== "visibility" && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (activeTab === "basics") setActiveTab("stack");
                  else if (activeTab === "stack") setActiveTab("postmortem");
                  else setActiveTab("visibility");
                }}
              >
                Next &rarr;
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
            >
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              {isEditing ? "Save Changes" : "Preserve in Vault"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
