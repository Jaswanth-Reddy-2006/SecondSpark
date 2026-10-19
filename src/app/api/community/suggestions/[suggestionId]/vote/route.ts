import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { XP_REWARDS } from "@/types/community";

interface RouteParams {
  params: Promise<{ suggestionId: string }>;
}

// POST /api/community/suggestions/[suggestionId]/vote - Toggles upvote on a suggestion
export async function POST(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  const { suggestionId } = await params;

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Authentication required to vote on suggestions" },
      { status: 401 }
    );
  }

  const userId = session.user.id;

  try {
    const suggestion = await prisma.suggestion.findUnique({
      where: { id: suggestionId },
      include: { project: true },
    });

    if (!suggestion) {
      return NextResponse.json({ error: "Suggestion not found" }, { status: 404 });
    }

    // Check existing vote
    const existingVote = await prisma.suggestionVote.findUnique({
      where: {
        suggestionId_userId: {
          suggestionId,
          userId,
        },
      },
    });

    if (existingVote) {
      // Toggle off / unvote
      await prisma.$transaction([
        prisma.suggestionVote.delete({
          where: { id: existingVote.id },
        }),
        prisma.suggestion.update({
          where: { id: suggestionId },
          data: {
            upvotesCount: { decrement: 1 },
          },
        }),
      ]);

      const updated = await prisma.suggestion.findUnique({
        where: { id: suggestionId },
        select: { upvotesCount: true },
      });

      return NextResponse.json({
        success: true,
        upvoted: false,
        upvotesCount: Math.max(0, updated?.upvotesCount || 0),
      });
    } else {
      // Add upvote + award 5 XP
      await prisma.$transaction([
        prisma.suggestionVote.create({
          data: {
            suggestionId,
            userId,
          },
        }),
        prisma.suggestion.update({
          where: { id: suggestionId },
          data: {
            upvotesCount: { increment: 1 },
          },
        }),
        prisma.experienceLedger.create({
          data: {
            userId,
            action: "vote_suggestion",
            sourceId: suggestionId,
            points: XP_REWARDS.UPVOTE_SUGGESTION,
            description: `Upvoted suggestion on "${suggestion.project.name}"`,
          },
        }),
        prisma.user.update({
          where: { id: userId },
          data: {
            xp: { increment: XP_REWARDS.UPVOTE_SUGGESTION },
          },
        }),
      ]);

      const updated = await prisma.suggestion.findUnique({
        where: { id: suggestionId },
        select: { upvotesCount: true },
      });

      return NextResponse.json({
        success: true,
        upvoted: true,
        upvotesCount: updated?.upvotesCount || 1,
        xpAwarded: XP_REWARDS.UPVOTE_SUGGESTION,
      });
    }
  } catch (error: unknown) {
    console.error("Error toggling vote:", error);
    return NextResponse.json({ error: "Failed to toggle vote" }, { status: 500 });
  }
}
