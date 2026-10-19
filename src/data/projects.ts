import { Project, DashboardStats } from "@/types/project";

/**
 * Empty initial projects collection - all projects in SecondSpark are authentically
 * created and maintained by users.
 */
export const SAMPLE_PROJECTS: Project[] = [];

export function getDashboardStats(projects: Project[] = []): DashboardStats {
  const readyToReview = projects.filter(
    (p) => p.worthRevisiting && p.status !== "Revived" && p.status !== "Archived"
  ).length;

  const needsDecision = projects.filter(
    (p) => !p.nextAction && p.status !== "Revived" && p.status !== "Archived"
  ).length;

  const revivedProjects = projects.filter((p) => p.status === "Revived").length;
  const archivedProjects = projects.filter((p) => p.status === "Archived").length;

  return {
    totalProjects: projects.length,
    readyToReview,
    needsDecision,
    revivedProjects,
    archivedProjects,
    worthRevisiting: readyToReview,
  };
}
