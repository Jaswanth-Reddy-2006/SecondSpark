export type CollaborationStatus =
  | "feedback_only"
  | "open_to_collaborators"
  | "invitation_only"
  | "open_to_adoption"
  | "closed";

export type ProjectRole = "OWNER" | "MAINTAINER" | "CONTRIBUTOR" | "REVIEWER";

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectRole;
  joinedAt: string;
  user: {
    id: string;
    name: string | null;
    email?: string | null;
    image?: string | null;
    xp?: number;
    level?: number;
  };
}

export interface ProjectRatingReview {
  id: string;
  projectId: string;
  userId: string;
  clarity: number; // 1 - 5
  documentation: number; // 1 - 5
  potential: number; // 1 - 5
  onboarding: number; // 1 - 5
  reusability: number; // 1 - 5
  feedback: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    image?: string | null;
  };
}

export type SuggestionCategory =
  | "architecture"
  | "feature"
  | "tech_debt"
  | "business_model"
  | "security"
  | "refactor";

export type SuggestionImpact = "high" | "medium" | "low";
export type SuggestionEffort = "high" | "medium" | "low";
export type SuggestionStatus = "open" | "accepted" | "planned" | "completed" | "rejected";

export interface SuggestionComment {
  id: string;
  suggestionId: string;
  authorId: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    image?: string | null;
  };
}

export interface CommunitySuggestion {
  id: string;
  projectId: string;
  authorId: string;
  title: string;
  description: string;
  category: SuggestionCategory;
  expectedImpact: SuggestionImpact;
  estimatedEffort: SuggestionEffort;
  status: SuggestionStatus;
  upvotesCount: number;
  hasVoted?: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string | null;
    image?: string | null;
  };
  comments?: SuggestionComment[];
}

export type CollaborationRequestStatus = "pending" | "accepted" | "declined" | "withdrawn";

export interface CollaborationRequest {
  id: string;
  projectId: string;
  applicantId: string;
  motivation: string;
  skills: string[];
  proposedContribution: string;
  status: CollaborationRequestStatus;
  responseNote?: string | null;
  createdAt: string;
  updatedAt: string;
  applicant: {
    id: string;
    name: string | null;
    email?: string | null;
    image?: string | null;
    xp?: number;
  };
  project?: {
    id: string;
    name: string;
    tagline: string;
  };
}

export type TaskType = "bug" | "feature" | "documentation" | "test" | "chore";
export type TaskPriority = "critical" | "high" | "medium" | "low";
export type TaskStatus = "open" | "in_progress" | "review" | "completed";

export interface CommunityTask {
  id: string;
  projectId: string;
  title: string;
  description: string;
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  requiredSkills: string[];
  assigneeId?: string | null;
  assignee?: {
    id: string;
    name: string | null;
    image?: string | null;
  } | null;
  githubIssueUrl?: string | null;
  githubPrUrl?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "review" | "contribution" | "revival" | "leadership";
  xpReward: number;
}

export const COMMUNITY_BADGES: Record<string, BadgeDefinition> = {
  first_spark: {
    id: "first_spark",
    name: "First Spark",
    description: "Published your first dormant repository to the community graveyard.",
    icon: "Sparkles",
    category: "revival",
    xpReward: 50,
  },
  necromancer: {
    id: "necromancer",
    name: "Code Necromancer",
    description: "Successfully revived an abandoned project and verified working builds.",
    icon: "Flame",
    category: "revival",
    xpReward: 300,
  },
  master_architect: {
    id: "master_architect",
    name: "Master Architect",
    description: "Submitted 5 accepted architectural suggestions across community projects.",
    icon: "Compass",
    category: "review",
    xpReward: 150,
  },
  code_guardian: {
    id: "code_guardian",
    name: "Code Guardian",
    description: "Conducted 10 comprehensive 5-dimension project evaluations.",
    icon: "ShieldCheck",
    category: "review",
    xpReward: 200,
  },
  task_finisher: {
    id: "task_finisher",
    name: "Blocker Smasher",
    description: "Claimed and completed 3 resurrection tasks from the community board.",
    icon: "CheckCircle",
    category: "contribution",
    xpReward: 250,
  },
  torchbearer: {
    id: "torchbearer",
    name: "Torchbearer",
    description: "Took over maintainership and stewardship of an adopted project.",
    icon: "Crown",
    category: "leadership",
    xpReward: 400,
  },
};

export const XP_REWARDS = {
  SUBMIT_REVIEW: 25,
  PROPOSE_SUGGESTION: 20,
  SUGGESTION_ACCEPTED: 50,
  UPVOTE_SUGGESTION: 5,
  CLAIM_TASK: 10,
  COMPLETE_TASK: 100,
  ACCEPT_COLLABORATOR: 30,
  TRANSFER_MAINTAINERSHIP: 150,
  REVIVE_PROJECT: 300,
} as const;

export function calculateLevel(xp: number): { level: number; currentLevelXp: number; nextLevelXp: number; progressPercent: number } {
  // Level threshold curve: each level requires level * 100 XP
  let level = 1;
  let remaining = Math.max(0, xp);
  let threshold = 100;

  while (remaining >= threshold) {
    remaining -= threshold;
    level++;
    threshold = level * 100;
  }

  const progressPercent = Math.min(100, Math.round((remaining / threshold) * 100));

  return {
    level,
    currentLevelXp: remaining,
    nextLevelXp: threshold,
    progressPercent,
  };
}
