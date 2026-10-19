import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateLevel, COMMUNITY_BADGES } from "@/types/community";

// GET /api/community/leaderboard - Top revival champions and gamification metrics
export async function GET() {
  try {
    const topUsers = await prisma.user.findMany({
      orderBy: { xp: "desc" },
      take: 20,
      select: {
        id: true,
        name: true,
        image: true,
        xp: true,
        level: true,
        createdAt: true,
        achievements: {
          select: {
            badgeId: true,
            unlockedAt: true,
          },
        },
        _count: {
          select: {
            projects: true,
            assignedTasks: {
              where: { status: "completed" },
            },
            suggestions: {
              where: { status: "accepted" },
            },
            ratings: true,
          },
        },
      },
    });

    const leaderboard = topUsers.map((u, index) => {
      const levelInfo = calculateLevel(u.xp);
      return {
        rank: index + 1,
        id: u.id,
        name: u.name || "Anonymous Reviver",
        handle: `@${(u.name || "reviver").toLowerCase().replace(/[^a-z0-9]/g, "")}`,
        avatar: (u.name || "AR").slice(0, 2).toUpperCase(),
        image: u.image,
        xp: u.xp,
        level: levelInfo.level,
        progressPercent: levelInfo.progressPercent,
        projectsCount: u._count.projects,
        tasksCompleted: u._count.assignedTasks,
        suggestionsAccepted: u._count.suggestions,
        reviewsSubmitted: u._count.ratings,
        badges: u.achievements.map((a) => {
          const def = COMMUNITY_BADGES[a.badgeId];
          return {
            id: a.badgeId,
            name: def ? def.name : a.badgeId,
            description: def ? def.description : "",
            icon: def ? def.icon : "Award",
            unlockedAt: a.unlockedAt.toISOString(),
          };
        }),
      };
    });

    // Aggregate platform revival impact stats
    const totalXp = await prisma.experienceLedger.aggregate({
      _sum: { points: true },
    });

    const totalTasksCompleted = await prisma.projectTask.count({
      where: { status: "completed" },
    });

    const totalSuggestionsAccepted = await prisma.suggestion.count({
      where: { status: "accepted" },
    });

    const totalProjectsRevived = await prisma.project.count({
      where: { status: "Revived" },
    });

    return NextResponse.json({
      leaderboard,
      metrics: {
        totalXp: totalXp._sum.points || 0,
        totalTasksCompleted,
        totalSuggestionsAccepted,
        totalProjectsRevived,
      },
      availableBadges: Object.values(COMMUNITY_BADGES),
    });
  } catch (error: unknown) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
