import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/community/projects - Returns public community graveyard projects with filtering and sorting
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search")?.toLowerCase().trim() || "";
    const tech = searchParams.get("tech")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";
    const collabStatus = searchParams.get("collabStatus")?.trim() || "";
    const sort = searchParams.get("sort") || "stars-desc";

    // Build Prisma query condition
    const whereCondition: Record<string, unknown> = {
      isPublic: true,
    };

    if (status && status !== "All") {
      whereCondition.status = status;
    }

    if (collabStatus && collabStatus !== "All") {
      whereCondition.collaborationStatus = collabStatus;
    }

    // Determine sorting
    let orderBy: Record<string, string> = { updatedAt: "desc" };
    if (sort === "stars-desc") {
      orderBy = { stars: "desc" };
    } else if (sort === "maturity-desc") {
      orderBy = { completionRate: "desc" };
    } else if (sort === "rating-desc") {
      orderBy = { ratingAverage: "desc" };
    } else if (sort === "recent-desc") {
      orderBy = { createdAt: "desc" };
    }

    const dbProjects = await prisma.project.findMany({
      where: whereCondition,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
            xp: true,
            level: true,
          },
        },
        ratings: {
          select: {
            id: true,
            clarity: true,
            documentation: true,
            potential: true,
            onboarding: true,
            reusability: true,
            feedback: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        suggestions: {
          select: {
            id: true,
            title: true,
            category: true,
            status: true,
            upvotesCount: true,
          },
        },
        tasks: {
          select: {
            id: true,
            title: true,
            type: true,
            priority: true,
            status: true,
          },
        },
      },
      orderBy,
    });

interface CommunityProjectResponseItem {
  id: string;
  name: string;
  slug?: string;
  tagline: string;
  description: string;
  originalProblem: string;
  intendedUsers: string;
  techTags: string[];
  repoUrl?: string;
  demoUrl?: string;
  status: string;
  lastActiveDate: string;
  lastUpdated: string;
  createdAt: string;
  worthRevisiting: boolean;
  completionRate: number;
  abandonedReason: string;
  completedFeatures: string[];
  unfinishedFeatures: string[];
  mainBlockers: string;
  lessonsLearned: string;
  revivalPotential: string;
  stars?: number;
  isPublic?: boolean;
  collaborationStatus?: string;
  skillsNeeded?: string[];
  ratingsCount?: number;
  ratingAverage?: number;
  suggestionsCount?: number;
  openTasksCount?: number;
  autopsy?: unknown;
  autopsyRunAt?: string;
  harvestGems?: unknown[];
  adoptionProtocol?: unknown;
  founderEmeritus?: unknown;
  author: {
    id?: string;
    name: string;
    avatar: string;
    handle: string;
    image?: string;
    xp?: number;
    level?: number;
  };
}

    // Format DB projects
    let formatted: CommunityProjectResponseItem[] = dbProjects.map((p) => {
      const parsedTech: string[] = JSON.parse(p.techTags || "[]");
      const parsedSkills: string[] = JSON.parse(p.skillsNeeded || "[]");

      return {
        id: p.id,
        name: p.name,
        slug: p.slug || p.id,
        tagline: p.tagline,
        description: p.description,
        originalProblem: p.originalProblem,
        intendedUsers: p.intendedUsers,
        techTags: parsedTech,
        repoUrl: p.repoUrl || undefined,
        demoUrl: p.demoUrl || undefined,
        status: p.status,
        lastActiveDate: p.lastActiveDate,
        lastUpdated: p.updatedAt.toISOString().split("T")[0],
        createdAt: p.createdAt.toISOString().split("T")[0],
        worthRevisiting: p.worthRevisiting,
        completionRate: p.completionRate,
        abandonedReason: p.abandonedReason,
        completedFeatures: JSON.parse(p.completedFeatures || "[]"),
        unfinishedFeatures: JSON.parse(p.unfinishedFeatures || "[]"),
        mainBlockers: p.mainBlockers,
        lessonsLearned: p.lessonsLearned,
        revivalPotential: p.revivalPotential,
        stars: p.stars,
        isPublic: p.isPublic,
        collaborationStatus: p.collaborationStatus,
        skillsNeeded: parsedSkills,
        ratingsCount: p.ratings.length || p.ratingsCount,
        ratingAverage:
          p.ratings.length > 0
            ? Number(
                (
                  p.ratings.reduce(
                    (acc, r) =>
                      acc +
                      (r.clarity + r.documentation + r.potential + r.onboarding + r.reusability) / 5,
                    0
                  ) / p.ratings.length
                ).toFixed(1)
              )
            : p.ratingAverage,
        suggestionsCount: p.suggestions.length,
        openTasksCount: p.tasks.filter((t) => t.status !== "completed").length,
        autopsy: p.autopsyData ? JSON.parse(p.autopsyData) : undefined,
        autopsyRunAt: p.autopsyRunAt?.toISOString(),
        harvestGems: JSON.parse(p.harvestGems || "[]"),
        adoptionProtocol: p.adoptionProtocol ? JSON.parse(p.adoptionProtocol) : undefined,
        founderEmeritus: p.founderEmeritus ? JSON.parse(p.founderEmeritus) : undefined,
        author: {
          id: p.user.id,
          name: p.user.name || "Community Maintainer",
          avatar: (p.user.name || "CM").slice(0, 2).toUpperCase(),
          handle: `@${p.user.email?.split("@")[0] || "developer"}`,
          image: p.user.image || undefined,
          xp: p.user.xp,
          level: p.user.level,
        },
      };
    });

    // Apply in-memory text search if requested
    if (search) {
      formatted = formatted.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.tagline.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search) ||
          p.abandonedReason.toLowerCase().includes(search) ||
          p.techTags.some((t) => t.toLowerCase().includes(search)) ||
          p.skillsNeeded?.some((s) => s.toLowerCase().includes(search))
      );
    }

    // Apply tech tag filter if requested
    if (tech && tech !== "All") {
      formatted = formatted.filter((p) =>
        p.techTags.some((t) => t.toLowerCase() === tech.toLowerCase())
      );
    }

    // Compute aggregated metrics for public community feed
    const metrics = {
      totalPublicProjects: formatted.length,
      openToCollaborators: formatted.filter((p) => p.collaborationStatus === "open_to_collaborators").length,
      seekingAdoption: formatted.filter((p) => p.collaborationStatus === "open_to_adoption").length,
      avgMaturity: Math.round(
        formatted.reduce((acc, p) => acc + p.completionRate, 0) / (formatted.length || 1)
      ),
    };

    return NextResponse.json({
      projects: formatted,
      metrics,
    });
  } catch (error: unknown) {
    const err = error as { digest?: string };
    if (err?.digest === "NEXT_PRERENDER_INTERRUPTED") {
      throw error;
    }
    console.error("Error fetching community projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch community projects" },
      { status: 500 }
    );
  }
}
