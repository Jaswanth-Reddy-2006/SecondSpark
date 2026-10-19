import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { XP_REWARDS } from "@/types/community";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/community/projects/[id]/reviews - Returns all community reviews for a public project
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const project = await prisma.project.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        isPublic: true,
      },
      select: { id: true, name: true, ratingsCount: true, ratingAverage: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Public project not found" }, { status: 404 });
    }

    const reviews = await prisma.projectRating.findMany({
      where: { projectId: project.id },
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
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      projectId: project.id,
      ratingsCount: reviews.length,
      ratingAverage: project.ratingAverage,
      reviews: reviews.map((r) => ({
        id: r.id,
        clarity: r.clarity,
        documentation: r.documentation,
        potential: r.potential,
        onboarding: r.onboarding,
        reusability: r.reusability,
        average: Number(
          ((r.clarity + r.documentation + r.potential + r.onboarding + r.reusability) / 5).toFixed(1)
        ),
        feedback: r.feedback,
        createdAt: r.createdAt.toISOString(),
        author: {
          id: r.user.id,
          name: r.user.name || "Community Reviewer",
          avatar: (r.user.name || "CR").slice(0, 2).toUpperCase(),
          image: r.user.image,
          xp: r.user.xp,
          level: r.user.level,
        },
      })),
    });
  } catch (error: unknown) {
    console.error("Error fetching project reviews:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

// POST /api/community/projects/[id]/reviews - Submits a 5D evaluation review with anti-abuse rules & XP award
export async function POST(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Authentication required to review community projects" },
      { status: 401 }
    );
  }

  const userId = session.user.id;

  try {
    // 1. Locate public project
    const project = await prisma.project.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        isPublic: true,
      },
      include: {
        memberships: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Public project not found" }, { status: 404 });
    }

    // 2. Anti-Abuse Rule: Project owners and maintainers cannot rate their own project
    if (project.userId === userId) {
      return NextResponse.json(
        { error: "Anti-abuse violation: You cannot rate your own repository." },
        { status: 400 }
      );
    }

    const isTeamMember = project.memberships.some(
      (m) => m.userId === userId && (m.role === "OWNER" || m.role === "MAINTAINER")
    );
    if (isTeamMember) {
      return NextResponse.json(
        { error: "Anti-abuse violation: Project maintainers cannot submit self-reviews." },
        { status: 400 }
      );
    }

    const body = await req.json();

    const clamp = (val: unknown) => Math.max(1, Math.min(5, Number(val) || 3));
    const clarity = clamp(body.clarity);
    const documentation = clamp(body.documentation);
    const potential = clamp(body.potential);
    const onboarding = clamp(body.onboarding);
    const reusability = clamp(body.reusability);
    const feedback = String(body.feedback || "").trim();

    // 3. Upsert Rating record (enforces 1 rating per user per project)
    const rating = await prisma.projectRating.upsert({
      where: {
        projectId_userId: {
          projectId: project.id,
          userId,
        },
      },
      create: {
        projectId: project.id,
        userId,
        clarity,
        documentation,
        potential,
        onboarding,
        reusability,
        feedback,
      },
      update: {
        clarity,
        documentation,
        potential,
        onboarding,
        reusability,
        feedback,
      },
    });

    // 4. Recalculate and update aggregate scores on Project
    const allRatings = await prisma.projectRating.findMany({
      where: { projectId: project.id },
      select: {
        clarity: true,
        documentation: true,
        potential: true,
        onboarding: true,
        reusability: true,
      },
    });

    const ratingsCount = allRatings.length;
    const ratingAverage = Number(
      (
        allRatings.reduce(
          (sum, r) =>
            sum + (r.clarity + r.documentation + r.potential + r.onboarding + r.reusability) / 5,
          0
        ) / ratingsCount
      ).toFixed(1)
    );

    await prisma.project.update({
      where: { id: project.id },
      data: {
        ratingsCount,
        ratingAverage,
      },
    });

    // 5. Gamification XP award (Idempotent: 1 XP reward per project evaluation)
    const existingLedger = await prisma.experienceLedger.findFirst({
      where: {
        userId,
        action: "submit_review",
        sourceId: rating.id,
      },
    });

    let xpAwarded = 0;
    if (!existingLedger) {
      xpAwarded = XP_REWARDS.SUBMIT_REVIEW; // 25 XP

      await prisma.$transaction([
        prisma.experienceLedger.create({
          data: {
            userId,
            action: "submit_review",
            sourceId: rating.id,
            points: xpAwarded,
            description: `Submitted structured 5D review for "${project.name}"`,
          },
        }),
        prisma.user.update({
          where: { id: userId },
          data: {
            xp: { increment: xpAwarded },
          },
        }),
        prisma.notification.create({
          data: {
            userId: project.userId,
            title: "New Review Received",
            message: `${session.user.name || "A developer"} reviewed your project "${project.name}" with average rating ${ratingAverage} ★`,
            link: `/community`,
            type: "review",
          },
        }),
      ]);
    }

    return NextResponse.json({
      success: true,
      rating,
      aggregate: {
        ratingsCount,
        ratingAverage,
      },
      xpAwarded,
    });
  } catch (error: unknown) {
    console.error("Error submitting review:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
