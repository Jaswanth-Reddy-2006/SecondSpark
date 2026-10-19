import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/projects - Returns all projects owned by the currently authenticated user
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const projects = await prisma.project.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        timeline: {
          orderBy: {
            timestamp: "desc",
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Format for frontend
    const formatted = projects.map((p) => ({
      id: p.id,
      name: p.name,
      tagline: p.tagline,
      description: p.description,
      originalProblem: p.originalProblem,
      intendedUsers: p.intendedUsers,
      techTags: JSON.parse(p.techTags || "[]"),
      repoUrl: p.repoUrl || undefined,
      demoUrl: p.demoUrl || undefined,
      status: p.status,
      lastActiveDate: p.lastActiveDate,
      lastUpdated: p.updatedAt.toISOString().split("T")[0],
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
      slug: p.slug || undefined,
      collaborationStatus: p.collaborationStatus,
      skillsNeeded: JSON.parse(p.skillsNeeded || "[]"),
      ratingsCount: p.ratingsCount,
      ratingAverage: p.ratingAverage,
      autopsy: p.autopsyData ? JSON.parse(p.autopsyData) : undefined,
      autopsyRunAt: p.autopsyRunAt?.toISOString(),
      harvestGems: JSON.parse(p.harvestGems || "[]"),
      adoptionProtocol: p.adoptionProtocol ? JSON.parse(p.adoptionProtocol) : undefined,
      founderEmeritus: p.founderEmeritus ? JSON.parse(p.founderEmeritus) : undefined,
      author: {
        id: session.user?.id,
        name: session.user?.name || "Developer",
        avatar: (session.user?.name || "D").slice(0, 2).toUpperCase(),
        handle: `@${session.user?.email?.split("@")[0] || "user"}`,
      },
      history: p.timeline.map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        timestamp: e.timestamp.toISOString(),
        type: (["created", "status_change", "edited", "note_added"].includes(e.type)
          ? e.type
          : "note_added") as "created" | "status_change" | "edited" | "note_added",
      })),
    }));

    return NextResponse.json({ projects: formatted });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// POST /api/projects - Creates a new project owned by the authenticated user
export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const data = await req.json();

    const generatedSlug = data.name
      ? `${data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Date.now().toString(36)}`
      : undefined;

    const created = await prisma.project.create({
      data: {
        userId: session.user.id,
        name: data.name || "Untitled Project",
        slug: data.slug || generatedSlug,
        tagline: data.tagline || "",
        description: data.description || "",
        originalProblem: data.originalProblem || "",
        intendedUsers: data.intendedUsers || "",
        techTags: JSON.stringify(data.techTags || ["TypeScript"]),
        repoUrl: data.repoUrl || null,
        demoUrl: data.demoUrl || null,
        status: data.status || "Abandoned",
        lastActiveDate: data.lastActiveDate || new Date().toISOString().split("T")[0],
        worthRevisiting: data.worthRevisiting ?? true,
        completionRate: data.completionRate ?? 70,
        abandonedReason: data.abandonedReason || "Preserved in vault.",
        completedFeatures: JSON.stringify(data.completedFeatures || []),
        unfinishedFeatures: JSON.stringify(data.unfinishedFeatures || []),
        mainBlockers: data.mainBlockers || "",
        lessonsLearned: data.lessonsLearned || "",
        revivalPotential: data.revivalPotential || "Moderate",
        stars: data.stars || 0,
        isPublic: Boolean(data.isPublic),
        collaborationStatus: data.collaborationStatus || "feedback_only",
        skillsNeeded: JSON.stringify(data.skillsNeeded || []),
        memberships: {
          create: [
            {
              userId: session.user.id,
              role: "OWNER",
            },
          ],
        },
        timeline: {
          create: [
            {
              title: "Project Entombed in Vault",
              description: `Preserved by ${session.user.name || "maintainer"} with initial architectural memory.`,
              type: "created",
            },
          ],
        },
      },
      include: {
        timeline: true,
      },
    });

    return NextResponse.json({ project: created }, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
