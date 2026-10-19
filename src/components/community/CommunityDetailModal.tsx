"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  Star,
  Users,
  MessageSquare,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Clock,
  Sparkles,
  ThumbsUp,
  Award,
  Send,
  UserPlus,
  FileText,
  ListTodo,
  Check,
  Plus,
  Shield,
  Terminal,
  Package,
  Activity,
} from "lucide-react";
import { CommunityProjectCardData } from "./CommunityProjectCard";
import { ProjectAutopsyView } from "@/components/developer/ProjectAutopsyView";
import { DynamicBadgeModal } from "@/components/developer/DynamicBadgeModal";
import { CloudSandboxModal } from "@/components/developer/CloudSandboxModal";
import { HarvestGemsView } from "@/components/developer/HarvestGemsView";
import { AdoptionProtocolModal } from "@/components/developer/AdoptionProtocolModal";

export type CommunityTab =
  | "overview"
  | "postmortem"
  | "reviews"
  | "suggestions"
  | "tasks"
  | "autopsy"
  | "harvest"
  | "collaborate";

interface ReviewData {
  id: string;
  clarity: number;
  documentation: number;
  potential: number;
  onboarding: number;
  reusability: number;
  average: number;
  feedback: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    image?: string | null;
    xp?: number;
    level?: number;
  };
}

interface SuggestionData {
  id: string;
  title: string;
  description: string;
  category: string;
  expectedImpact: string;
  estimatedEffort: string;
  status: string;
  upvotesCount: number;
  hasVoted?: boolean;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    image?: string | null;
  };
  comments?: Array<{
    id: string;
    content: string;
    createdAt: string;
    author: {
      id: string;
      name: string;
      image?: string | null;
    };
  }>;
}

interface TaskData {
  id: string;
  title: string;
  description: string;
  type: string;
  priority: string;
  status: string;
  requiredSkills: string[];
  assigneeId?: string | null;
  assignee?: {
    id: string;
    name: string;
    image?: string | null;
    xp?: number;
    level?: number;
  } | null;
  githubIssueUrl?: string | null;
  githubPrUrl?: string | null;
  createdAt: string;
}

interface CommunityDetailModalProps {
  project: CommunityProjectCardData | null;
  isOpen: boolean;
  onClose: () => void;
  initialTab?: CommunityTab;
  onReviewSubmitted?: () => void;
  onSuggestionSubmitted?: () => void;
  onApplicationSubmitted?: () => void;
}

export function CommunityDetailModal({
  project,
  isOpen,
  onClose,
  initialTab = "overview",
  onReviewSubmitted,
  onSuggestionSubmitted,
  onApplicationSubmitted,
}: CommunityDetailModalProps) {
  const [activeTab, setActiveTab] = useState<CommunityTab>(initialTab);

  // Reviews data state
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [clarity, setClarity] = useState(4);
  const [documentation, setDocumentation] = useState(4);
  const [potential, setPotential] = useState(5);
  const [onboarding, setOnboarding] = useState(3);
  const [reusability, setReusability] = useState(4);
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Suggestions data state
  const [suggestions, setSuggestions] = useState<SuggestionData[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestionTitle, setSuggestionTitle] = useState("");
  const [suggestionDesc, setSuggestionDesc] = useState("");
  const [suggestionCategory, setSuggestionCategory] = useState("architecture");
  const [suggestionImpact, setSuggestionImpact] = useState("high");
  const [isSubmittingSuggestion, setIsSubmittingSuggestion] = useState(false);
  const [suggestionSuccess, setSuggestionSuccess] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  const [expandedSuggestionComments, setExpandedSuggestionComments] = useState<Record<string, boolean>>({});
  const [newCommentText, setNewCommentText] = useState<Record<string, string>>({});
  const [submittingCommentId, setSubmittingCommentId] = useState<string | null>(null);

  // Tasks data state
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskType, setTaskType] = useState("feature");
  const [taskPriority, setTaskPriority] = useState("medium");
  const [taskSkills, setTaskSkills] = useState("");
  const [taskGithubIssue, setTaskGithubIssue] = useState("");
  const [claimingTaskId, setClaimingTaskId] = useState<string | null>(null);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [prUrlInput, setPrUrlInput] = useState("");

  // Application state
  const [motivation, setMotivation] = useState("");
  const [proposedContribution, setProposedContribution] = useState("");
  const [applicantSkills, setApplicantSkills] = useState("");
  const [isSubmittingCollab, setIsSubmittingCollab] = useState(false);
  const [collabSuccess, setCollabSuccess] = useState(false);
  const [collabError, setCollabError] = useState<string | null>(null);
  const [badgeModalOpen, setBadgeModalOpen] = useState(false);
  const [sandboxModalOpen, setSandboxModalOpen] = useState(false);
  const [adoptModalOpen, setAdoptModalOpen] = useState(false);

  // Synchronize initialTab when prop changes
  const [prevInitialTab, setPrevInitialTab] = useState(initialTab);
  if (initialTab !== prevInitialTab) {
    setPrevInitialTab(initialTab);
    setActiveTab(initialTab);
  }

  const loadReviews = useCallback(async () => {
    if (!project?.id) return;
    try {
      const res = await fetch(`/api/community/projects/${project.id}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    }
  }, [project]);

  const loadSuggestions = useCallback(async () => {
    if (!project?.id) return;
    try {
      const res = await fetch(`/api/community/projects/${project.id}/suggestions`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (err) {
      console.error("Failed to fetch suggestions:", err);
    }
  }, [project]);

  const loadTasks = useCallback(async () => {
    if (!project?.id) return;
    try {
      const res = await fetch(`/api/community/projects/${project.id}/tasks`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      }
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    }
  }, [project]);

  // Load appropriate data asynchronously when tab changes or modal opens
  useEffect(() => {
    if (!isOpen || !project?.id) return;
    let ignore = false;

    async function loadData() {
      if (activeTab === "reviews") {
        setIsLoadingReviews(true);
        try {
          const res = await fetch(`/api/community/projects/${project?.id}/reviews`);
          if (res.ok && !ignore) {
            const data = await res.json();
            setReviews(data.reviews || []);
          }
        } catch (err) {
          console.error("Failed to load reviews:", err);
        } finally {
          if (!ignore) setIsLoadingReviews(false);
        }
      } else if (activeTab === "suggestions") {
        setIsLoadingSuggestions(true);
        try {
          const res = await fetch(`/api/community/projects/${project?.id}/suggestions`);
          if (res.ok && !ignore) {
            const data = await res.json();
            setSuggestions(data.suggestions || []);
          }
        } catch (err) {
          console.error("Failed to load suggestions:", err);
        } finally {
          if (!ignore) setIsLoadingSuggestions(false);
        }
      } else if (activeTab === "tasks") {
        setIsLoadingTasks(true);
        try {
          const res = await fetch(`/api/community/projects/${project?.id}/tasks`);
          if (res.ok && !ignore) {
            const data = await res.json();
            setTasks(data.tasks || []);
          }
        } catch (err) {
          console.error("Failed to load tasks:", err);
        } finally {
          if (!ignore) setIsLoadingTasks(false);
        }
      }
    }

    loadData();

    return () => {
      ignore = true;
    };
  }, [isOpen, project, activeTab]);

  if (!project) return null;

  // Review submission
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError(null);
    setIsSubmittingReview(true);
    try {
      const res = await fetch(`/api/community/projects/${project.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clarity,
          documentation,
          potential,
          onboarding,
          reusability,
          feedback: reviewFeedback,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setReviewSuccess(true);
        loadReviews();
        onReviewSubmitted?.();
      } else {
        setReviewError(data.error || "Failed to submit review");
      }
    } catch (err) {
      console.error("Failed to submit review:", err);
      setReviewError("Network error occurred");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Suggestion submission
  const handleSubmitSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestionTitle.trim()) return;
    setSuggestionError(null);
    setIsSubmittingSuggestion(true);
    try {
      const res = await fetch(`/api/community/projects/${project.id}/suggestions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: suggestionTitle,
          description: suggestionDesc,
          category: suggestionCategory,
          expectedImpact: suggestionImpact,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuggestionSuccess(true);
        setSuggestionTitle("");
        setSuggestionDesc("");
        loadSuggestions();
        onSuggestionSubmitted?.();
      } else {
        setSuggestionError(data.error || "Failed to submit suggestion");
      }
    } catch (err) {
      console.error("Failed to submit suggestion:", err);
      setSuggestionError("Network error occurred");
    } finally {
      setIsSubmittingSuggestion(false);
    }
  };

  // Toggle upvote on suggestion
  const handleToggleVote = async (suggestionId: string) => {
    try {
      const res = await fetch(`/api/community/suggestions/${suggestionId}/vote`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setSuggestions((prev) =>
          prev.map((s) =>
            s.id === suggestionId
              ? {
                  ...s,
                  upvotesCount: data.upvotesCount,
                  hasVoted: data.upvoted,
                }
              : s
          )
        );
      }
    } catch (err) {
      console.error("Failed to toggle vote:", err);
    }
  };

  // Add comment on suggestion
  const handleAddComment = async (suggestionId: string) => {
    const text = newCommentText[suggestionId]?.trim();
    if (!text) return;
    setSubmittingCommentId(suggestionId);
    try {
      const res = await fetch(`/api/community/suggestions/${suggestionId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      if (res.ok) {
        const data = await res.json();
        setSuggestions((prev) =>
          prev.map((s) =>
            s.id === suggestionId
              ? {
                  ...s,
                  comments: [...(s.comments || []), data.comment],
                }
              : s
          )
        );
        setNewCommentText((prev) => ({ ...prev, [suggestionId]: "" }));
      }
    } catch (err) {
      console.error("Failed to post comment:", err);
    } finally {
      setSubmittingCommentId(null);
    }
  };

  // Create Task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    try {
      const res = await fetch(`/api/community/projects/${project.id}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: taskTitle,
          description: taskDescription,
          type: taskType,
          priority: taskPriority,
          requiredSkills: taskSkills.split(",").map((s) => s.trim()).filter(Boolean),
          githubIssueUrl: taskGithubIssue,
        }),
      });

      if (res.ok) {
        setTaskTitle("");
        setTaskDescription("");
        setTaskSkills("");
        setTaskGithubIssue("");
        setIsCreatingTask(false);
        loadTasks();
      }
    } catch (err) {
      console.error("Failed to create task:", err);
    }
  };

  // Claim Task
  const handleClaimTask = async (taskId: string) => {
    setClaimingTaskId(taskId);
    try {
      const res = await fetch(`/api/community/tasks/${taskId}/claim`, {
        method: "POST",
      });
      if (res.ok) {
        loadTasks();
      }
    } catch (err) {
      console.error("Failed to claim task:", err);
    } finally {
      setClaimingTaskId(null);
    }
  };

  // Complete Task
  const handleCompleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/community/tasks/${taskId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ githubPrUrl: prUrlInput }),
      });
      if (res.ok) {
        setCompletingTaskId(null);
        setPrUrlInput("");
        loadTasks();
      }
    } catch (err) {
      console.error("Failed to complete task:", err);
    }
  };

  // Collaboration application
  const handleSubmitCollab = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivation.trim()) return;
    setCollabError(null);
    setIsSubmittingCollab(true);
    try {
      const res = await fetch(`/api/community/projects/${project.id}/collaborate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          motivation,
          proposedContribution,
          skills: applicantSkills.split(",").map((s) => s.trim()).filter(Boolean),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setCollabSuccess(true);
        onApplicationSubmitted?.();
      } else {
        setCollabError(data.error || "Failed to submit collaboration request");
      }
    } catch (err) {
      console.error("Failed to submit collaboration request:", err);
      setCollabError("Network error occurred");
    } finally {
      setIsSubmittingCollab(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={project.name}
      description={project.tagline || project.description}
      className="max-w-3xl max-h-[92vh] flex flex-col"
    >
      <div className="flex flex-col flex-1 overflow-hidden space-y-3.5">
        {/* Top Badges & Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-[#D1D9E0]/70">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-[#DAFBE8] text-[#1F883D] border border-[#1F883D]/30">
              <Globe className="w-3 h-3 text-[#1F883D]" />
              Public Graveyard
            </span>

            <Badge status={project.status} withIcon />

            <div className="flex items-center gap-1 text-xs font-mono font-bold text-[#1F2328] bg-[#FFF8C5]/60 border border-[#D4A72C]/40 px-2 py-0.5 rounded-full">
              <Star className="w-3 h-3 text-[#D4A72C] fill-[#D4A72C]" />
              <span>{project.ratingAverage ? project.ratingAverage.toFixed(1) : "—"}</span>
              <span className="text-[#59636E] text-[10px] font-normal">
                ({project.ratingsCount || reviews.length} reviews)
              </span>
            </div>

            <span className="text-xs font-mono text-[#59636E] flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Stalled: {project.lastActiveDate || project.lastUpdated}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {project.repoUrl && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(project.repoUrl, "_blank", "noopener,noreferrer")}
                className="text-xs gap-1.5"
              >
                <GitBranch className="w-3.5 h-3.5 text-[#59636E]" />
                Repository
                <ExternalLink className="w-3 h-3 text-[#59636E]" />
              </Button>
            )}
            {project.demoUrl && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(project.demoUrl, "_blank", "noopener,noreferrer")}
                className="text-xs gap-1.5"
              >
                <Globe className="w-3.5 h-3.5 text-[#59636E]" />
                Demo
              </Button>
            )}

            {/* Developer Tooling Fast Actions */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setBadgeModalOpen(true)}
              className="text-xs gap-1.5"
              title="Generate Dynamic README Badge"
            >
              <Shield className="w-3.5 h-3.5 text-[#0969DA]" />
              Badge
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setSandboxModalOpen(true)}
              className="text-xs gap-1.5"
              title="Launch In-Browser Cloud Sandbox"
            >
              <Terminal className="w-3.5 h-3.5 text-[#1F883D]" />
              Sandbox
            </Button>

            {project.collaborationStatus === "open_to_adoption" && (
              <Button
                size="sm"
                variant="primary"
                onClick={() => setAdoptModalOpen(true)}
                className="text-xs gap-1.5 bg-[#8250DF] hover:bg-[#6e3dc7] border-[#8250DF]"
                title="Execute 4-Step Maintainer Handover"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Adopt Project
              </Button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-[#D1D9E0] pb-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 ${
              activeTab === "overview"
                ? "bg-[#F6F8FA] text-[#1F2328] border border-[#D1D9E0] font-semibold"
                : "text-[#59636E] hover:text-[#1F2328] hover:bg-[#F6F8FA]"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Architecture &amp; Features</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("postmortem")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 ${
              activeTab === "postmortem"
                ? "bg-[#F6F8FA] text-[#1F2328] border border-[#D1D9E0] font-semibold"
                : "text-[#59636E] hover:text-[#1F2328] hover:bg-[#F6F8FA]"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-[#9A6700]" />
            <span>Tombstone Post-Mortem</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("autopsy")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 ${
              activeTab === "autopsy"
                ? "bg-[#DDF4FF] text-[#0969DA] border border-[#54AEFF] font-semibold"
                : "text-[#0969DA] hover:bg-[#DDF4FF]/40 font-medium"
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-[#0969DA]" />
            <span>Autopsy &amp; Bit-Rot</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("harvest")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 ${
              activeTab === "harvest"
                ? "bg-[#F6F8FA] text-[#1F2328] border border-[#D1D9E0] font-semibold"
                : "text-[#59636E] hover:text-[#1F2328] hover:bg-[#F6F8FA]"
            }`}
          >
            <Package className="w-3.5 h-3.5 text-[#59636E]" />
            <span>Code Harvest ({project.harvestGems?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("reviews")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 ${
              activeTab === "reviews"
                ? "bg-[#F6F8FA] text-[#1F2328] border border-[#D1D9E0] font-semibold"
                : "text-[#59636E] hover:text-[#1F2328] hover:bg-[#F6F8FA]"
            }`}
          >
            <Star className="w-3.5 h-3.5 text-[#D4A72C]" />
            <span>5D Reviews ({project.ratingsCount || reviews.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("suggestions")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 ${
              activeTab === "suggestions"
                ? "bg-[#F6F8FA] text-[#1F2328] border border-[#D1D9E0] font-semibold"
                : "text-[#59636E] hover:text-[#1F2328] hover:bg-[#F6F8FA]"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#0969DA]" />
            <span>Suggestions &amp; Pivots</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("tasks")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 ${
              activeTab === "tasks"
                ? "bg-[#F6F8FA] text-[#1F2328] border border-[#D1D9E0] font-semibold"
                : "text-[#59636E] hover:text-[#1F2328] hover:bg-[#F6F8FA]"
            }`}
          >
            <ListTodo className="w-3.5 h-3.5 text-[#1F883D]" />
            <span>Revival Tasks</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("collaborate")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 ${
              activeTab === "collaborate"
                ? "bg-[#1F883D] text-white font-semibold"
                : "text-[#1F883D] hover:bg-[#DAFBE8]"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Apply to Revive / Adopt</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto pr-1 space-y-4 max-h-[60vh] text-xs">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3 rounded-md bg-[#F6F8FA] border border-[#D1D9E0]/70 space-y-1">
                  <span className="font-semibold text-[#1F2328] flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-[#0969DA]" />
                    Original Problem Solved
                  </span>
                  <p className="text-[#59636E] leading-relaxed">
                    {project.originalProblem || "Not formally recorded."}
                  </p>
                </div>

                <div className="p-3 rounded-md bg-[#F6F8FA] border border-[#D1D9E0]/70 space-y-1">
                  <span className="font-semibold text-[#1F2328] flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#1F883D]" />
                    Intended Users &amp; Audience
                  </span>
                  <p className="text-[#59636E] leading-relaxed">
                    {project.intendedUsers || "General developers and engineers."}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-semibold text-[#1F2328]">
                  Technical Architecture Breakdown
                </span>
                <p className="text-[#59636E] leading-relaxed whitespace-pre-line bg-white p-3 rounded-md border border-[#D1D9E0]">
                  {project.description}
                </p>
              </div>

              <div className="p-3 rounded-md bg-[#F6F8FA] border border-[#D1D9E0] space-y-1.5">
                <div className="flex justify-between items-center font-mono">
                  <span className="font-semibold text-[#1F2328]">Codebase Completion Rate</span>
                  <span className="font-bold text-[#0969DA]">{project.completionRate}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#D1D9E0] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#1F883D]"
                    style={{ width: `${project.completionRate}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-2">
                  <span className="font-semibold text-[#1F883D] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1F883D]" />
                    Functional Features ({project.completedFeatures?.length || 0})
                  </span>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {project.completedFeatures?.map((f, i) => (
                      <div
                        key={i}
                        className="p-1.5 rounded bg-white border border-[#D1D9E0] text-[11px] text-[#1F2328] flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1F883D] shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="font-semibold text-[#9A6700] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#9A6700]" />
                    Pending Work to Resurrect ({project.unfinishedFeatures?.length || 0})
                  </span>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {project.unfinishedFeatures?.map((f, i) => (
                      <div
                        key={i}
                        className="p-1.5 rounded bg-white border border-[#D1D9E0] text-[11px] text-[#1F2328] flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#9A6700] shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="font-semibold text-[#1F2328]">Technology Stack</span>
                <div className="flex flex-wrap gap-1.5">
                  {project.techTags.map((tag) => (
                    <Badge key={tag} variant="tech">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: POST-MORTEM */}
          {activeTab === "postmortem" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-md bg-[#FFF8C5]/40 border border-[#D4A72C]/40 space-y-1.5">
                <span className="font-bold text-[#9A6700] flex items-center gap-1.5 text-xs">
                  <AlertTriangle className="w-4 h-4 text-[#9A6700]" />
                  Why the Codebase Stalled
                </span>
                <p className="text-[#1F2328] leading-relaxed italic">
                  &ldquo;{project.abandonedReason}&rdquo;
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="font-semibold text-[#1F2328] flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#D1242F]" />
                  Major Technical Blockers &amp; Edge Cases
                </span>
                <div className="p-3 rounded-md bg-white border border-[#D1D9E0] text-[#59636E] leading-relaxed">
                  {project.mainBlockers || "No blockers formally recorded."}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="font-semibold text-[#1F2328] flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-[#0969DA]" />
                  Lessons Learned for the Next Maintainer
                </span>
                <div className="p-3 rounded-md bg-white border border-[#D1D9E0] text-[#59636E] leading-relaxed">
                  {project.lessonsLearned || "No architectural lessons recorded."}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 5D REVIEWS */}
          {activeTab === "reviews" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-md bg-[#F6F8FA] border border-[#D1D9E0] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#1F2328] block">
                      5-Dimension Community Evaluation
                    </span>
                    <span className="text-[11px] text-[#59636E]">
                      Aggregated ratings across key architectural dimensions
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-lg font-bold text-[#1F2328]">
                    <Star className="w-5 h-5 text-[#D4A72C] fill-[#D4A72C]" />
                    <span>{project.ratingAverage ? project.ratingAverage.toFixed(1) : "—"}</span>
                    <span className="text-xs text-[#59636E] font-normal">/ 5.0</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-[#D1D9E0]/60 text-[11px] font-mono">
                  <div className="p-2 rounded bg-white border border-[#D1D9E0]">
                    <span className="text-[#59636E] block">Clarity</span>
                    <span className="font-bold text-[#1F2328]">
                      {reviews.length > 0
                        ? (reviews.reduce((acc, r) => acc + (Number(r.clarity) || 0), 0) / reviews.length).toFixed(1)
                        : "—"} ★
                    </span>
                  </div>
                  <div className="p-2 rounded bg-white border border-[#D1D9E0]">
                    <span className="text-[#59636E] block">Documentation</span>
                    <span className="font-bold text-[#1F2328]">
                      {reviews.length > 0
                        ? (reviews.reduce((acc, r) => acc + (Number(r.documentation) || 0), 0) / reviews.length).toFixed(1)
                        : "—"} ★
                    </span>
                  </div>
                  <div className="p-2 rounded bg-white border border-[#D1D9E0]">
                    <span className="text-[#59636E] block">Revival Potential</span>
                    <span className="font-bold text-[#1F883D]">
                      {reviews.length > 0
                        ? (reviews.reduce((acc, r) => acc + (Number(r.potential) || 0), 0) / reviews.length).toFixed(1)
                        : "—"} ★
                    </span>
                  </div>
                  <div className="p-2 rounded bg-white border border-[#D1D9E0]">
                    <span className="text-[#59636E] block">Onboarding</span>
                    <span className="font-bold text-[#1F2328]">
                      {reviews.length > 0
                        ? (reviews.reduce((acc, r) => acc + (Number(r.onboarding) || 0), 0) / reviews.length).toFixed(1)
                        : "—"} ★
                    </span>
                  </div>
                  <div className="p-2 rounded bg-white border border-[#D1D9E0]">
                    <span className="text-[#59636E] block">Reusability</span>
                    <span className="font-bold text-[#1F2328]">
                      {reviews.length > 0
                        ? (reviews.reduce((acc, r) => acc + (Number(r.reusability) || 0), 0) / reviews.length).toFixed(1)
                        : "—"} ★
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Review Form */}
              <div className="p-4 rounded-md bg-white border border-[#D1D9E0] space-y-3">
                <span className="text-xs font-bold text-[#1F2328] block">
                  Submit a Structured Project Evaluation (+25 XP)
                </span>

                {reviewError && (
                  <div className="p-2.5 rounded bg-[#FFEBE9] border border-[#CF222E]/30 text-[#CF222E] text-xs">
                    {reviewError}
                  </div>
                )}

                {reviewSuccess ? (
                  <div className="p-3 rounded-md bg-[#DAFBE8] border border-[#1F883D]/40 text-[#1F883D] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Thank you! Your evaluation has been recorded and +25 XP awarded.</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReview} className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                      <div>
                        <label className="block text-[10px] text-[#59636E] mb-1 font-mono">
                          Clarity: {clarity}/5
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={clarity}
                          onChange={(e) => setClarity(Number(e.target.value))}
                          className="w-full accent-[#0969DA] h-1.5"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-[#59636E] mb-1 font-mono">
                          Docs: {documentation}/5
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={documentation}
                          onChange={(e) => setDocumentation(Number(e.target.value))}
                          className="w-full accent-[#0969DA] h-1.5"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-[#59636E] mb-1 font-mono">
                          Potential: {potential}/5
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={potential}
                          onChange={(e) => setPotential(Number(e.target.value))}
                          className="w-full accent-[#1F883D] h-1.5"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-[#59636E] mb-1 font-mono">
                          Onboard: {onboarding}/5
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={onboarding}
                          onChange={(e) => setOnboarding(Number(e.target.value))}
                          className="w-full accent-[#0969DA] h-1.5"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-[#59636E] mb-1 font-mono">
                          Reuse: {reusability}/5
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={reusability}
                          onChange={(e) => setReusability(Number(e.target.value))}
                          className="w-full accent-[#0969DA] h-1.5"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#1F2328] font-semibold mb-1">
                        Technical Feedback &amp; Architectural Audit Notes
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Provide concrete advice on code quality, security posture, and revival hurdles..."
                        value={reviewFeedback}
                        onChange={(e) => setReviewFeedback(e.target.value)}
                        className="w-full rounded-md border border-[#D1D9E0] p-2 text-xs bg-white focus:outline-none focus:border-[#0969DA]"
                      />
                    </div>

                    <Button type="submit" size="sm" variant="primary" disabled={isSubmittingReview}>
                      <Award className="w-3.5 h-3.5 mr-1" />
                      Submit Evaluation
                    </Button>
                  </form>
                )}
              </div>

              {/* Reviews List */}
              <div className="space-y-2">
                <span className="font-semibold text-[#1F2328] block">
                  Community Evaluations ({reviews.length})
                </span>

                {isLoadingReviews ? (
                  <p className="text-xs text-[#59636E]">Loading evaluations...</p>
                ) : reviews.length === 0 ? (
                  <p className="text-xs text-[#59636E] italic bg-[#F6F8FA] p-3 rounded border border-[#D1D9E0]">
                    No evaluations submitted yet. Be the first to evaluate this dormant repository!
                  </p>
                ) : (
                  reviews.map((r) => (
                    <div key={r.id} className="p-3 rounded-md bg-white border border-[#D1D9E0] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#1F2328] text-white flex items-center justify-center text-[10px] font-mono font-bold">
                            {r.author.avatar}
                          </span>
                          <span className="font-semibold text-xs text-[#1F2328]">{r.author.name}</span>
                          {r.author.level && (
                            <span className="text-[10px] font-mono bg-[#DDF4FF] text-[#0969DA] px-1 rounded">
                              Lvl {r.author.level}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs font-mono font-bold text-[#1F2328]">
                          <Star className="w-3.5 h-3.5 text-[#D4A72C] fill-[#D4A72C]" />
                          <span>{r.average} ★</span>
                        </div>
                      </div>
                      {r.feedback && <p className="text-[#59636E] text-[11px] leading-relaxed">{r.feedback}</p>}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: SUGGESTIONS */}
          {activeTab === "suggestions" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Propose a Suggestion Form */}
              <div className="p-4 rounded-md bg-[#F6F8FA] border border-[#D1D9E0] space-y-3">
                <span className="text-xs font-bold text-[#1F2328] block">
                  Propose an Architectural Solution or Pivot (+20 XP)
                </span>

                {suggestionError && (
                  <div className="p-2.5 rounded bg-[#FFEBE9] border border-[#CF222E]/30 text-[#CF222E] text-xs">
                    {suggestionError}
                  </div>
                )}

                {suggestionSuccess ? (
                  <div className="p-3 rounded-md bg-[#DAFBE8] border border-[#1F883D]/40 text-[#1F883D] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Suggestion proposed! Community members can now review and vote.</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitSuggestion} className="space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <Input
                        placeholder="Suggestion Title (e.g. Migrate parser to WASM)"
                        value={suggestionTitle}
                        onChange={(e) => setSuggestionTitle(e.target.value)}
                      />
                      <select
                        value={suggestionCategory}
                        onChange={(e) => setSuggestionCategory(e.target.value)}
                        className="h-8 rounded-md border border-[#D1D9E0] bg-white px-2 text-xs"
                      >
                        <option value="architecture">Category: Architecture</option>
                        <option value="feature">Category: Feature Pivot</option>
                        <option value="tech_debt">Category: Tech Debt</option>
                        <option value="security">Category: Security</option>
                      </select>
                      <select
                        value={suggestionImpact}
                        onChange={(e) => setSuggestionImpact(e.target.value)}
                        className="h-8 rounded-md border border-[#D1D9E0] bg-white px-2 text-xs"
                      >
                        <option value="high">Impact: High</option>
                        <option value="medium">Impact: Medium</option>
                        <option value="low">Impact: Low</option>
                      </select>
                    </div>

                    <textarea
                      rows={2}
                      placeholder="Explain the proposed architectural change and why it solves the stalled blocker..."
                      value={suggestionDesc}
                      onChange={(e) => setSuggestionDesc(e.target.value)}
                      className="w-full rounded-md border border-[#D1D9E0] p-2 text-xs bg-white focus:outline-none"
                    />

                    <Button type="submit" size="sm" variant="primary" disabled={isSubmittingSuggestion}>
                      <Send className="w-3.5 h-3.5 mr-1" />
                      Post Suggestion
                    </Button>
                  </form>
                )}
              </div>

              {/* Suggestions List */}
              <div className="space-y-2.5">
                <span className="font-semibold text-[#1F2328] block">
                  Proposals &amp; Community Solutions ({suggestions.length})
                </span>

                {isLoadingSuggestions ? (
                  <p className="text-xs text-[#59636E]">Loading suggestions...</p>
                ) : suggestions.length === 0 ? (
                  <p className="text-xs text-[#59636E] italic bg-[#F6F8FA] p-3 rounded border border-[#D1D9E0]">
                    No architecture suggestions yet. Propose the first solution above!
                  </p>
                ) : (
                  suggestions.map((s) => (
                    <div key={s.id} className="p-3.5 rounded-md bg-white border border-[#D1D9E0] space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#0969DA] text-xs">{s.title}</span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-[#DDF4FF] text-[#0969DA]">
                              {s.category}
                            </span>
                            {s.status === "accepted" && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-[#DAFBE8] text-[#1F883D] border border-[#1F883D]/30">
                                Accepted
                              </span>
                            )}
                          </div>
                          <p className="text-[#59636E] text-[11px] leading-relaxed">{s.description}</p>
                          <div className="text-[10px] text-[#59636E] flex items-center gap-2">
                            <span>Proposed by {s.author.name}</span>
                            <span>•</span>
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedSuggestionComments((prev) => ({
                                  ...prev,
                                  [s.id]: !prev[s.id],
                                }))
                              }
                              className="text-[#0969DA] hover:underline cursor-pointer"
                            >
                              {s.comments?.length || 0} comments
                            </button>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleVote(s.id)}
                          className={`flex flex-col items-center justify-center p-2 rounded-md border transition-colors shrink-0 cursor-pointer ${
                            s.hasVoted
                              ? "bg-[#DDF4FF] border-[#0969DA] text-[#0969DA]"
                              : "bg-[#F6F8FA] border-[#D1D9E0] text-[#59636E] hover:bg-[#DDF4FF] hover:text-[#0969DA]"
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span className="text-xs font-bold mt-0.5">{s.upvotesCount}</span>
                        </button>
                      </div>

                      {/* Comments Drawer */}
                      {expandedSuggestionComments[s.id] && (
                        <div className="pt-2 border-t border-[#D1D9E0]/60 space-y-2">
                          <div className="space-y-1.5">
                            {s.comments?.map((c) => (
                              <div key={c.id} className="p-2 rounded bg-[#F6F8FA] text-[11px] space-y-0.5">
                                <span className="font-semibold text-[#1F2328]">{c.author.name}: </span>
                                <span className="text-[#59636E]">{c.content}</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Write a technical response..."
                              value={newCommentText[s.id] || ""}
                              onChange={(e) =>
                                setNewCommentText((prev) => ({ ...prev, [s.id]: e.target.value }))
                              }
                              className="flex-1 rounded border border-[#D1D9E0] px-2 py-1 text-xs"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAddComment(s.id)}
                              disabled={submittingCommentId === s.id}
                            >
                              Reply
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: REVIVAL TASKS */}
          {activeTab === "tasks" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-[#D1D9E0]">
                <div>
                  <span className="font-semibold text-xs text-[#1F2328] block">
                    Resurrection Task Board
                  </span>
                  <span className="text-[11px] text-[#59636E]">
                    Claim blockers (+10 XP) and smash them with PRs (+100 XP)
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsCreatingTask(!isCreatingTask)}
                  className="gap-1 text-xs"
                >
                  <Plus className="w-3 h-3" />
                  {isCreatingTask ? "Cancel" : "Add Task"}
                </Button>
              </div>

              {/* Task Creation Form */}
              {isCreatingTask && (
                <form
                  onSubmit={handleCreateTask}
                  className="p-3.5 rounded-md bg-[#F6F8FA] border border-[#D1D9E0] space-y-2.5 animate-in fade-in"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Input
                      placeholder="Task Title (e.g. Implement WASM SQLite driver)"
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      required
                    />
                    <select
                      value={taskType}
                      onChange={(e) => setTaskType(e.target.value)}
                      className="h-8 rounded-md border border-[#D1D9E0] bg-white px-2 text-xs"
                    >
                      <option value="feature">Type: Feature</option>
                      <option value="bug">Type: Bugfix</option>
                      <option value="documentation">Type: Documentation</option>
                      <option value="test">Type: Test Coverage</option>
                    </select>
                    <select
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value)}
                      className="h-8 rounded-md border border-[#D1D9E0] bg-white px-2 text-xs"
                    >
                      <option value="critical">Priority: Critical</option>
                      <option value="high">Priority: High</option>
                      <option value="medium">Priority: Medium</option>
                      <option value="low">Priority: Low</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      placeholder="Required Skills (e.g. Rust, SQLite, TypeScript)"
                      value={taskSkills}
                      onChange={(e) => setTaskSkills(e.target.value)}
                    />
                    <Input
                      placeholder="GitHub Issue Link (optional)"
                      value={taskGithubIssue}
                      onChange={(e) => setTaskGithubIssue(e.target.value)}
                    />
                  </div>

                  <textarea
                    rows={2}
                    placeholder="Details about the blocker and acceptance criteria..."
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    className="w-full rounded border border-[#D1D9E0] p-2 text-xs bg-white"
                  />

                  <Button type="submit" size="sm" variant="primary">
                    Create Task
                  </Button>
                </form>
              )}

              {/* Tasks List */}
              <div className="space-y-2">
                {isLoadingTasks ? (
                  <p className="text-xs text-[#59636E]">Loading tasks...</p>
                ) : tasks.length === 0 ? (
                  <p className="text-xs text-[#59636E] italic bg-[#F6F8FA] p-3 rounded border border-[#D1D9E0]">
                    No resurrection tasks created yet. Click &quot;Add Task&quot; to define the next milestones!
                  </p>
                ) : (
                  tasks.map((t) => (
                    <div
                      key={t.id}
                      className={`p-3 rounded-md border flex items-start justify-between gap-3 transition-colors ${
                        t.status === "completed"
                          ? "bg-[#DAFBE8]/30 border-[#1F883D]/30"
                          : t.status === "in_progress"
                          ? "bg-[#FFF8C5]/20 border-[#D4A72C]/40"
                          : "bg-white border-[#D1D9E0]"
                      }`}
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-[#1F2328]">{t.title}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-medium ${
                              t.priority === "critical"
                                ? "bg-[#FFEBE9] text-[#CF222E]"
                                : t.priority === "high"
                                ? "bg-[#FFF8C5] text-[#9A6700]"
                                : "bg-[#F6F8FA] text-[#59636E]"
                            }`}
                          >
                            {t.priority}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-[#F6F8FA] text-[#59636E]">
                            {t.type}
                          </span>
                        </div>

                        {t.description && (
                          <p className="text-[#59636E] text-[11px] leading-relaxed">{t.description}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {t.requiredSkills.map((sk) => (
                            <span
                              key={sk}
                              className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#F6F8FA] border border-[#D1D9E0] text-[#59636E]"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>

                        {t.assignee && (
                          <div className="text-[10px] text-[#59636E] flex items-center gap-1 pt-0.5">
                            <span>Claimed by:</span>
                            <span className="font-semibold text-[#1F2328]">{t.assignee.name}</span>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        {t.status === "open" && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleClaimTask(t.id)}
                            disabled={claimingTaskId === t.id}
                            className="text-xs"
                          >
                            Claim (+10 XP)
                          </Button>
                        )}

                        {t.status === "in_progress" && (
                          <>
                            {completingTaskId === t.id ? (
                              <div className="space-y-1 text-right">
                                <input
                                  type="text"
                                  placeholder="GitHub PR URL"
                                  value={prUrlInput}
                                  onChange={(e) => setPrUrlInput(e.target.value)}
                                  className="w-40 rounded border border-[#D1D9E0] px-2 py-0.5 text-[11px]"
                                />
                                <div className="flex gap-1 justify-end">
                                  <Button
                                    size="sm"
                                    variant="primary"
                                    onClick={() => handleCompleteTask(t.id)}
                                    className="text-xs"
                                  >
                                    Confirm (+100 XP)
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setCompletingTaskId(null)}
                                    className="text-xs"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setCompletingTaskId(t.id)}
                                className="text-xs border-[#1F883D] text-[#1F883D] hover:bg-[#DAFBE8]"
                              >
                                Mark Done (+100 XP)
                              </Button>
                            )}
                          </>
                        )}

                        {t.status === "completed" && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#1F883D] font-semibold bg-[#DAFBE8] px-2 py-0.5 rounded">
                            <Check className="w-3.5 h-3.5" />
                            Resolved
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 6: COLLABORATE / ADOPT */}
          {activeTab === "collaborate" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-md bg-[#DAFBE8]/60 border border-[#1F883D]/40 space-y-1">
                <span className="font-bold text-[#1F883D] flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-4 h-4 text-[#1F883D]" />
                  Resurrect This Project
                </span>
                <p className="text-[#1F2328] leading-relaxed">
                  The original maintainer has marked this project as{" "}
                  <strong>{project.collaborationStatus?.replace(/_/g, " ")}</strong>. Apply to join
                  the revival team or assume stewardship.
                </p>
              </div>

              {collabError && (
                <div className="p-3 rounded-md bg-[#FFEBE9] border border-[#CF222E]/30 text-[#CF222E] text-xs">
                  {collabError}
                </div>
              )}

              {collabSuccess ? (
                <div className="p-4 rounded-md bg-[#DAFBE8] border border-[#1F883D]/40 text-[#1F883D] space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Collaboration Application Submitted!</span>
                  </div>
                  <p className="text-xs text-[#1F2328]">
                    Your application has been delivered to the project maintainer. You will receive a
                    notification once they review your proposed contribution.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmitCollab}
                  className="space-y-3 p-4 rounded-md bg-white border border-[#D1D9E0]"
                >
                  <div>
                    <label className="block text-xs font-semibold text-[#1F2328] mb-1">
                      Why do you want to revive this project? *
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. I am actively dealing with this problem at work and would love to contribute a working libSQL driver..."
                      value={motivation}
                      onChange={(e) => setMotivation(e.target.value)}
                      className="w-full rounded-md border border-[#D1D9E0] p-2 text-xs bg-white focus:outline-none focus:border-[#0969DA]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1F2328] mb-1">
                      Proposed Contribution / Role
                    </label>
                    <Input
                      placeholder="e.g. Lead maintainer, WebAssembly developer, Documentation writer"
                      value={proposedContribution}
                      onChange={(e) => setProposedContribution(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1F2328] mb-1">
                      Your Relevant Skills (comma-separated)
                    </label>
                    <Input
                      placeholder="e.g. Rust, TypeScript, Docker, SQLite"
                      value={applicantSkills}
                      onChange={(e) => setApplicantSkills(e.target.value)}
                    />
                  </div>

                  <div className="pt-2">
                    <Button type="submit" size="md" variant="primary" disabled={isSubmittingCollab}>
                      <UserPlus className="w-4 h-4 mr-1.5" />
                      Submit Collaboration Application
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB: AUTOPSY & BIT-ROT */}
          {activeTab === "autopsy" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <ProjectAutopsyView
                project={project}
                onAutopsyUpdated={(newAutopsy) => {
                  project.autopsy = newAutopsy;
                }}
              />
            </div>
          )}

          {/* TAB: CODE HARVEST */}
          {activeTab === "harvest" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <HarvestGemsView
                project={project}
                onGemsUpdated={(newGems) => {
                  project.harvestGems = newGems;
                }}
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-[#D1D9E0] flex items-center justify-between">
          <div className="text-[11px] text-[#59636E] font-mono">
            Maintained by {project.author.name} ({project.author.handle})
          </div>
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {/* Dynamic README Badge Modal */}
      <DynamicBadgeModal
        project={project}
        isOpen={badgeModalOpen}
        onClose={() => setBadgeModalOpen(false)}
      />

      {/* Cloud Sandbox Modal */}
      <CloudSandboxModal
        project={project}
        isOpen={sandboxModalOpen}
        onClose={() => setSandboxModalOpen(false)}
      />

      {/* Maintainer Handover & Adoption Protocol Modal */}
      <AdoptionProtocolModal
        project={project}
        isOpen={adoptModalOpen}
        onClose={() => setAdoptModalOpen(false)}
        onAdoptionCompleted={() => {
          project.status = "Revived";
          setAdoptModalOpen(false);
        }}
      />
    </Modal>
  );
}
