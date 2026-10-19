import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/projects/[id] - Retrieves project if public OR if user is owner/member
export async function GET(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  const { id } = await params;

  try {
    const project = await prisma.project.findFirst({
      where: {
        OR: [
          { id },
          { slug: id },
        ],
      },
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
        memberships: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                xp: true,
                level: true,
              },
            },
          },
        },
        ratings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        suggestions: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            votes: true,
            comments: {
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  },
                },
              },
              orderBy: {
                createdAt: "asc",
              },
            },
          },
          orderBy: {
            upvotesCount: "desc",
          },
        },
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        timeline: {
          orderBy: {
            timestamp: "desc",
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Boundary check: If private, require authenticated owner or member
    const isOwner = session?.user?.id === project.userId;
    const isMember = session?.user?.id
      ? project.memberships.some((m) => m.userId === session.user?.id)
      : false;

    if (!project.isPublic && !isOwner && !isMember) {
      return NextResponse.json(
        { error: "Forbidden: This project is stored in a private vault" },
        { status: 403 }
      );
    }

    const currentUserId = session?.user?.id;

    // Format suggestions with hasVoted flag
    const formattedSuggestions = project.suggestions.map((s) => ({
      id: s.id,
      projectId: s.projectId,
      authorId: s.authorId,
      title: s.title,
      description: s.description,
      category: s.category,
      expectedImpact: s.expectedImpact,
      estimatedEffort: s.estimatedEffort,
      status: s.status,
      upvotesCount: s.upvotesCount,
      hasVoted: currentUserId ? s.votes.some((v) => v.userId === currentUserId) : false,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
      author: s.author,
      comments: s.comments.map((c) => ({
        id: c.id,
        suggestionId: c.suggestionId,
        authorId: c.authorId,
        content: c.content,
        createdAt: c.createdAt.toISOString(),
        author: c.author,
      })),
    }));

    const formatted = {
      id: project.id,
      name: project.name,
      slug: project.slug,
      tagline: project.tagline,
      description: project.description,
      originalProblem: project.originalProblem,
      intendedUsers: project.intendedUsers,
      techTags: JSON.parse(project.techTags || "[]"),
      repoUrl: project.repoUrl || undefined,
      demoUrl: project.demoUrl || undefined,
      status: project.status,
      lastActiveDate: project.lastActiveDate,
      lastUpdated: project.updatedAt.toISOString().split("T")[0],
      createdAt: project.createdAt.toISOString().split("T")[0],
      worthRevisiting: project.worthRevisiting,
      completionRate: project.completionRate,
      abandonedReason: project.abandonedReason,
      completedFeatures: JSON.parse(project.completedFeatures || "[]"),
      unfinishedFeatures: JSON.parse(project.unfinishedFeatures || "[]"),
      mainBlockers: project.mainBlockers,
      lessonsLearned: project.lessonsLearned,
      revivalPotential: project.revivalPotential,
      stars: project.stars,
      isPublic: project.isPublic,
      collaborationStatus: project.collaborationStatus,
      skillsNeeded: JSON.parse(project.skillsNeeded || "[]"),
      ratingsCount: project.ratingsCount,
      ratingAverage: project.ratingAverage,
      autopsy: project.autopsyData ? JSON.parse(project.autopsyData) : undefined,
      autopsyRunAt: project.autopsyRunAt?.toISOString(),
      harvestGems: JSON.parse(project.harvestGems || "[]"),
      adoptionProtocol: project.adoptionProtocol ? JSON.parse(project.adoptionProtocol) : undefined,
      founderEmeritus: project.founderEmeritus ? JSON.parse(project.founderEmeritus) : undefined,
      author: {
        id: project.user.id,
        name: project.user.name || "Developer",
        avatar: (project.user.name || "D").slice(0, 2).toUpperCase(),
        handle: `@${project.user.email?.split("@")[0] || "user"}`,
        image: project.user.image || undefined,
      },
      members: project.memberships.map((m) => ({
        id: m.id,
        userId: m.userId,
        role: m.role,
        joinedAt: m.joinedAt.toISOString(),
        user: m.user,
      })),
      ratings: project.ratings.map((r) => ({
        id: r.id,
        userId: r.userId,
        clarity: r.clarity,
        documentation: r.documentation,
        potential: r.potential,
        onboarding: r.onboarding,
        reusability: r.reusability,
        feedback: r.feedback,
        createdAt: r.createdAt.toISOString(),
        user: r.user,
      })),
      suggestions: formattedSuggestions,
      tasks: project.tasks.map((t) => ({
        id: t.id,
        projectId: t.projectId,
        title: t.title,
        description: t.description,
        type: t.type,
        priority: t.priority,
        status: t.status,
        requiredSkills: JSON.parse(t.requiredSkills || "[]"),
        assigneeId: t.assigneeId,
        assignee: t.assignee,
        githubIssueUrl: t.githubIssueUrl,
        githubPrUrl: t.githubPrUrl,
        completedAt: t.completedAt?.toISOString() || null,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      })),
      history: project.timeline.map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        timestamp: e.timestamp.toISOString(),
        type: (["created", "status_change", "edited", "note_added"].includes(e.type)
          ? e.type
          : "note_added") as "created" | "status_change" | "edited" | "note_added",
      })),
    };

    return NextResponse.json({ project: formatted });
  } catch (error) {
    console.error("Error retrieving project:", error);
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}

// PUT /api/projects/[id] - Updates a project with user authorization enforcement
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    // 1. Authorization check: verify project belongs to authenticated user or maintainer
    const existing = await prisma.project.findUnique({
      where: { id },
      include: {
        memberships: true,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const isOwner = existing.userId === session.user.id;
    const isMaintainer = existing.memberships.some(
      (m) => m.userId === session.user?.id && (m.role === "OWNER" || m.role === "MAINTAINER")
    );

    if (!isOwner && !isMaintainer) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to modify this project" },
        { status: 403 }
      );
    }

    const data = await req.json();

    // Prepare updates
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.tagline !== undefined) updateData.tagline = data.tagline;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.originalProblem !== undefined) updateData.originalProblem = data.originalProblem;
    if (data.intendedUsers !== undefined) updateData.intendedUsers = data.intendedUsers;
    if (data.techTags !== undefined) updateData.techTags = JSON.stringify(data.techTags);
    if (data.repoUrl !== undefined) updateData.repoUrl = data.repoUrl;
    if (data.demoUrl !== undefined) updateData.demoUrl = data.demoUrl;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.lastActiveDate !== undefined) updateData.lastActiveDate = data.lastActiveDate;
    if (data.worthRevisiting !== undefined) updateData.worthRevisiting = data.worthRevisiting;
    if (data.completionRate !== undefined) updateData.completionRate = data.completionRate;
    if (data.abandonedReason !== undefined) updateData.abandonedReason = data.abandonedReason;
    if (data.completedFeatures !== undefined) updateData.completedFeatures = JSON.stringify(data.completedFeatures);
    if (data.unfinishedFeatures !== undefined) updateData.unfinishedFeatures = JSON.stringify(data.unfinishedFeatures);
    if (data.mainBlockers !== undefined) updateData.mainBlockers = data.mainBlockers;
    if (data.lessonsLearned !== undefined) updateData.lessonsLearned = data.lessonsLearned;
    if (data.revivalPotential !== undefined) updateData.revivalPotential = data.revivalPotential;
    if (data.isPublic !== undefined) updateData.isPublic = Boolean(data.isPublic);
    if (data.collaborationStatus !== undefined) updateData.collaborationStatus = data.collaborationStatus;
    if (data.skillsNeeded !== undefined) updateData.skillsNeeded = JSON.stringify(data.skillsNeeded);
    if (data.autopsyData !== undefined) updateData.autopsyData = typeof data.autopsyData === "string" ? data.autopsyData : JSON.stringify(data.autopsyData);
    if (data.autopsyRunAt !== undefined) updateData.autopsyRunAt = data.autopsyRunAt ? new Date(data.autopsyRunAt) : null;
    if (data.harvestGems !== undefined) updateData.harvestGems = typeof data.harvestGems === "string" ? data.harvestGems : JSON.stringify(data.harvestGems);
    if (data.adoptionProtocol !== undefined) updateData.adoptionProtocol = typeof data.adoptionProtocol === "string" ? data.adoptionProtocol : JSON.stringify(data.adoptionProtocol);
    if (data.founderEmeritus !== undefined) updateData.founderEmeritus = typeof data.founderEmeritus === "string" ? data.founderEmeritus : JSON.stringify(data.founderEmeritus);

    // Timeline event creation if requested
    let timelineCreate = undefined;
    if (data.timelineNote || (data.status && data.status !== existing.status)) {
      timelineCreate = {
        title:
          data.status && data.status !== existing.status
            ? `Status Changed: ${data.status}`
            : "Project Details Revised",
        description: data.timelineNote || `Updated by ${session.user.name || "maintainer"}`,
        type: data.status && data.status !== existing.status ? "status_change" : "edit",
      };
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...updateData,
        timeline: timelineCreate
          ? {
              create: [timelineCreate],
            }
          : undefined,
      },
      include: {
        timeline: {
          orderBy: {
            timestamp: "desc",
          },
        },
      },
    });

    return NextResponse.json({ project: updated });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

// DELETE /api/projects/[id] - Permanently deletes a project with user authorization enforcement
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    // 1. Authorization check: verify project belongs to authenticated owner
    const existing = await prisma.project.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to delete this project" },
        { status: 403 }
      );
    }

    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
