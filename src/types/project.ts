import { CollaborationStatus } from "./community";

export type ProjectStatus = "Abandoned" | "Under Review" | "Revived" | "Archived";

export interface TimelineEvent {
  id: string;
  type: "created" | "status_change" | "edited" | "note_added";
  title: string;
  description: string;
  timestamp: string; // ISO date-time string
  actor?: string;
  metadata?: {
    previousStatus?: ProjectStatus;
    newStatus?: ProjectStatus;
    changedFields?: string[];
  };
}

export interface RevivalChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  category?: "audit" | "setup" | "fix" | "feature" | "test";
}

export interface Project {
  id: string;
  name: string;
  tagline: string;
  description: string;
  originalProblem: string;
  intendedUsers: string;
  techTags: string[];
  repoUrl?: string;
  demoUrl?: string;
  status: ProjectStatus;
  lastActiveDate: string; // YYYY-MM-DD
  lastUpdated: string;    // YYYY-MM-DD
  createdAt: string;      // YYYY-MM-DD
  worthRevisiting: boolean;
  completionRate: number; // 0 - 100%
  abandonedReason: string;
  completedFeatures: string[];
  unfinishedFeatures: string[];
  mainBlockers: string;
  lessonsLearned: string;
  revivalPotential: "High" | "Moderate" | "Low";
  nextAction?: string;
  nextActionDueDate?: string;
  revivalChecklist?: RevivalChecklistItem[];
  stars?: number;
  repoName?: string;
  
  // Community & Visibility Extensions
  isPublic?: boolean;
  slug?: string;
  collaborationStatus?: CollaborationStatus;
  skillsNeeded?: string[];
  ratingsCount?: number;
  ratingAverage?: number;

  // Developer Tooling & Ecosystem Extensions
  autopsy?: ProjectAutopsy;
  autopsyRunAt?: string;
  harvestGems?: HarvestGem[];
  adoptionProtocol?: AdoptionProtocol;
  founderEmeritus?: FounderEmeritus;

  author: {
    id?: string;
    name: string;
    avatar: string;
    handle: string;
    image?: string;
  };
  history: TimelineEvent[];
}

export type RotSeverity = "healthy" | "mild" | "severe";
export type EffortSize = "weekend_hack" | "sprint" | "archaeological_dig";

export interface OutdatedDependency {
  name: string;
  currentVersion: string;
  latestVersion: string;
  diff: "major" | "minor" | "patch";
  isDeprecated?: boolean;
  recommendation?: string;
  cveAdvisory?: string;
}

export interface ModernizationStep {
  title: string;
  category: "framework" | "dependency" | "security" | "architecture" | "testing";
  impact: "high" | "medium" | "low";
  description: string;
  replacement?: string;
}

export interface ProjectAutopsy {
  rotIndex: number; // 0 to 100 (0 = fresh, 100 = decayed)
  rotSeverity: RotSeverity;
  effortSize: EffortSize;
  effortDescription: string;
  runtimeVersion?: string;
  targetRuntimeVersion?: string;
  outdatedDependencies: OutdatedDependency[];
  modernizationSteps: ModernizationStep[];
  detectedEnvVars: string[];
  healthSummary: string;
  analyzedAt: string;
}

export interface HarvestGem {
  id: string;
  name: string;
  path: string;
  description: string;
  tags: string[];
  checklist: {
    isolated: boolean;
    tested: boolean;
    packaged: boolean;
  };
  exportTarget?: "gist" | "npm" | "internal_copy";
  createdAt: string;
}

export interface AdoptionProtocol {
  status: "not_started" | "in_progress" | "completed";
  currentStep: 1 | 2 | 3 | 4;
  license: {
    spdx: string;
    verified: boolean;
  };
  handoverType: "org_transfer" | "canonical_fork";
  targetRepoUrl?: string;
  credentialsChecklist: {
    npmTransferred?: boolean;
    domainTransferred?: boolean;
    hostingTransferred?: boolean;
    notes?: string;
  };
  founderEmeritus: {
    name: string;
    userId?: string;
    acknowledged: boolean;
    handoverDate?: string;
  };
  completedAt?: string;
}

export interface FounderEmeritus {
  name: string;
  userId?: string;
  email?: string;
  handoverDate?: string;
}

export interface DashboardStats {
  totalProjects: number;
  readyToReview: number;
  needsDecision: number;
  revivedProjects: number;
  archivedProjects: number;
  // Backward compatibility alias
  worthRevisiting?: number;
}
