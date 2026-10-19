import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { XP_REWARDS } from "@/types/community";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/community/projects/[id]/suggestions - Returns suggestions with votes and comments
export async function GET(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  const { id } = await params;
  const currentUserId = session?.user?.id;

  try {
    const project = await prisma.project.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        isPublic: true,
      },
      select: { id: true, name: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Public project not found" }, { status: 404 });
    }

    const suggestions = await prisma.suggestion.findMany({
      where: { projectId: project.id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            xp: true,
            level: true,
          },
        },
        votes: {
          select: {
            userId: true,
          },
        },
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
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { upvotesCount: "desc" },
    });

    const formatted = suggestions.map((s) => ({
      id: s.id,
      projectId: s.projectId,
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
      author: {
        id: s.author.id,
        name: s.author.name || "Contributor",
        avatar: (s.author.name || "C").slice(0, 2).toUpperCase(),
        image: s.author.image,
        xp: s.author.xp,
        level: s.author.level,
      },
      commentsCount: s.comments.length,
      comments: s.comments.map((c) => ({
        id: c.id,
        content: c.content,
        createdAt: c.createdAt.toISOString(),
        author: {
          id: c.author.id,
          name: c.author.name || "User",
          image: c.author.image,
        },
      })),
    }));

    return NextResponse.json({
      projectId: project.id,
      suggestions: formatted,
    });
  } catch (error: unknown) {
    console.error("Error fetching suggestions:", error);
    return NextResponse.json({ error: "Failed to fetch suggestions" }, { status: 500 });
  }
}

// POST /api/community/projects/[id]/suggestions - Posts a new actionable suggestion with XP award
export async function POST(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Authentication required to propose suggestions" },
      { status: 401 }
    );
  }

  const userId = session.user.id;

  try {
    const project = await prisma.project.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        isPublic: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Public project not found" }, { status: 404 });
    }

    const body = await req.json();
    const title = String(body.title || "").trim();
    const description = String(body.description || "").trim();
    const category = String(body.category || "architecture");
    const expectedImpact = String(body.expectedImpact || "medium");
    const estimatedEffort = String(body.estimatedEffort || "medium");

    if (!title) {
      return NextResponse.json({ error: "Suggestion title is required" }, { status: 400 });
    }

    const created = await prisma.suggestion.create({
      data: {
        projectId: project.id,
        authorId: userId,
        title,
        description,
        category,
        expectedImpact,
        estimatedEffort,
        status: "open",
        upvotesCount: 0,
      },
    });

    // Gamification XP award (+20 XP for propose_suggestion)
    await prisma.$transaction([
      prisma.experienceLedger.create({
        data: {
          userId,
          action: "propose_suggestion",
          sourceId: created.id,
          points: XP_REWARDS.PROPOSE_SUGGESTION,
          description: `Proposed suggestion "${title}" on project "${project.name}"`,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          xp: { increment: XP_REWARDS.PROPOSE_SUGGESTION },
        },
      }),
      prisma.notification.create({
        data: {
          userId: project.userId,
          title: "New Suggestion Proposed",
          message: `${session.user.name || "A developer"} proposed "${title}" on "${project.name}"`,
          link: `/community`,
          type: "suggestion",
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      suggestion: created,
      xpAwarded: XP_REWARDS.PROPOSE_SUGGESTION,
    });
  } catch (error: unknown) {
    console.error("Error creating suggestion:", error);
    return NextResponse.json({ error: "Failed to create suggestion" }, { status: 500 });
  }
}
