import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Project } from "@/types/project";

// POST /api/projects/migrate - Safely migrates browser localStorage projects into authenticated user's database
export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const localProjects: Project[] = Array.isArray(body.projects) ? body.projects : [];

    if (localProjects.length === 0) {
      return NextResponse.json({ migratedCount: 0, message: "No local projects provided for migration." });
    }

    // Fetch user's existing database projects to prevent duplicates
    const existingDbProjects = await prisma.project.findMany({
      where: { userId: session.user.id },
      select: { name: true, repoUrl: true },
    });

    const existingNames = new Set(existingDbProjects.map((p) => p.name.toLowerCase()));
    const existingRepos = new Set(
      existingDbProjects.filter((p) => p.repoUrl).map((p) => p.repoUrl!.toLowerCase())
    );

    let migratedCount = 0;

    for (const project of localProjects) {
      const isDuplicate =
        existingNames.has(project.name.toLowerCase()) ||
        (project.repoUrl && existingRepos.has(project.repoUrl.toLowerCase()));

      if (!isDuplicate) {
        await prisma.project.create({
          data: {
            userId: session.user.id,
            name: project.name,
            tagline: project.tagline || "",
            description: project.description || "",
            originalProblem: project.originalProblem || "",
            intendedUsers: project.intendedUsers || "",
            techTags: JSON.stringify(project.techTags || ["TypeScript"]),
            repoUrl: project.repoUrl || null,
            demoUrl: project.demoUrl || null,
            status: project.status || "Abandoned",
            lastActiveDate: project.lastActiveDate || project.lastUpdated || "2024-03-01",
            worthRevisiting: project.worthRevisiting ?? true,
            completionRate: project.completionRate ?? 70,
            abandonedReason: project.abandonedReason || "Preserved in vault.",
            completedFeatures: JSON.stringify(project.completedFeatures || []),
            unfinishedFeatures: JSON.stringify(project.unfinishedFeatures || []),
            mainBlockers: project.mainBlockers || "",
            lessonsLearned: project.lessonsLearned || "",
            revivalPotential: project.revivalPotential || "Moderate",
            stars: project.stars || 0,
            isPublic: Boolean(project.isPublic),
            collaborationStatus: project.collaborationStatus || "feedback_only",
            skillsNeeded: JSON.stringify(project.skillsNeeded || []),
            memberships: {
              create: [
                {
                  userId: session.user.id,
                  role: "OWNER",
                },
              ],
            },
            timeline: {
              create: (Array.isArray(project.history) && project.history.length > 0)
                ? project.history.map((e) => ({
                    title: e.title,
                    description: e.description,
                    type: e.type,
                    timestamp: e.timestamp ? new Date(e.timestamp) : new Date(),
                  }))
                : [
                    {
                      title: "Migrated from Browser Vault",
                      description: "Transferred from local browser storage to persistent cloud database.",
                      type: "created",
                    },
                  ],
            },
          },
        });

        migratedCount++;
        existingNames.add(project.name.toLowerCase());
        if (project.repoUrl) existingRepos.add(project.repoUrl.toLowerCase());
      }
    }

    return NextResponse.json({
      success: true,
      migratedCount,
      totalProcessed: localProjects.length,
      message: `Successfully migrated ${migratedCount} projects into your database.`,
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { error: "Failed to migrate browser projects" },
      { status: 500 }
    );
  }
}
