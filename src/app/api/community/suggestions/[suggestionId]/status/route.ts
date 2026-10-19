import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { XP_REWARDS, COMMUNITY_BADGES } from "@/types/community";

interface RouteParams {
  params: Promise<{ suggestionId: string }>;
}

const VALID_STATUSES = ["open", "accepted", "planned", "completed", "rejected"] as const;

// PATCH /api/community/suggestions/[suggestionId]/status - Maintainer accepts, plans, or resolves suggestion
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  const { suggestionId } = await params;

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const userId = session.user.id;

  try {
    const suggestion = await prisma.suggestion.findUnique({
      where: { id: suggestionId },
      include: {
        project: {
          include: {
            memberships: true,
          },
        },
      },
    });

    if (!suggestion) {
      return NextResponse.json({ error: "Suggestion not found" }, { status: 404 });
    }

    // Verify user is project owner or maintainer
    const isOwner = suggestion.project.userId === userId;
    const isMaintainer = suggestion.project.memberships.some(
      (m) => m.userId === userId && (m.role === "OWNER" || m.role === "MAINTAINER")
    );

    if (!isOwner && !isMaintainer) {
      return NextResponse.json(
        { error: "Only project maintainers can update suggestion status" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const newStatus = body.status;

    if (!VALID_STATUSES.includes(newStatus)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const previousStatus = suggestion.status;

    // Update status
    const updated = await prisma.suggestion.update({
      where: { id: suggestionId },
      data: { status: newStatus },
    });

    let xpAwardedToAuthor = 0;
    let badgeAwarded: string | null = null;

    // If accepted for the first time, award XP to suggestion author
    if (newStatus === "accepted" && previousStatus !== "accepted") {
      const existingLedger = await prisma.experienceLedger.findFirst({
        where: {
          userId: suggestion.authorId,
          action: "suggestion_accepted",
          sourceId: suggestion.id,
        },
      });

      if (!existingLedger) {
        xpAwardedToAuthor = XP_REWARDS.SUGGESTION_ACCEPTED; // 50 XP

        await prisma.$transaction([
          prisma.experienceLedger.create({
            data: {
              userId: suggestion.authorId,
              action: "suggestion_accepted",
              sourceId: suggestion.id,
              points: xpAwardedToAuthor,
              description: `Architectural suggestion accepted for "${suggestion.project.name}"`,
            },
          }),
          prisma.user.update({
            where: { id: suggestion.authorId },
            data: {
              xp: { increment: xpAwardedToAuthor },
            },
          }),
          prisma.notification.create({
            data: {
              userId: suggestion.authorId,
              title: "Suggestion Accepted! 💡",
              message: `Your suggestion "${suggestion.title}" was accepted on "${suggestion.project.name}"! (+50 XP)`,
              link: `/community`,
              type: "suggestion",
            },
          }),
        ]);

        // Check if author qualified for "master_architect" badge (5 accepted suggestions)
        const acceptedCount = await prisma.suggestion.count({
          where: {
            authorId: suggestion.authorId,
            status: "accepted",
          },
        });

        if (acceptedCount >= 5) {
          const existingBadge = await prisma.userAchievement.findUnique({
            where: {
              userId_badgeId: {
                userId: suggestion.authorId,
                badgeId: "master_architect",
              },
            },
          });

          if (!existingBadge) {
            const badgeXp = COMMUNITY_BADGES.master_architect.xpReward;
            await prisma.$transaction([
              prisma.userAchievement.create({
                data: {
                  userId: suggestion.authorId,
                  badgeId: "master_architect",
                },
              }),
              prisma.experienceLedger.create({
                data: {
                  userId: suggestion.authorId,
                  action: "badge_unlocked",
                  sourceId: "master_architect",
                  points: badgeXp,
                  description: "Unlocked Master Architect Badge!",
                },
              }),
              prisma.user.update({
                where: { id: suggestion.authorId },
                data: {
                  xp: { increment: badgeXp },
                },
              }),
              prisma.notification.create({
                data: {
                  userId: suggestion.authorId,
                  title: "Achievement Unlocked: Master Architect! 🏆",
                  message: "5 of your architectural suggestions have been accepted by community maintainers! (+150 XP)",
                  link: `/community`,
                  type: "achievement",
                },
              }),
            ]);
            badgeAwarded = "master_architect";
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      suggestion: updated,
      xpAwardedToAuthor,
      badgeAwarded,
    });
  } catch (error: unknown) {
    console.error("Error updating suggestion status:", error);
    return NextResponse.json({ error: "Failed to update suggestion status" }, { status: 500 });
  }
}
