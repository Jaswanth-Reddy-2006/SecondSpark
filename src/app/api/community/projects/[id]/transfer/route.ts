import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { XP_REWARDS, COMMUNITY_BADGES } from "@/types/community";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/community/projects/[id]/transfer - Transfer project maintainership to a collaborator / adopter
export async function POST(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const currentUserId = session.user.id;

  try {
    const project = await prisma.project.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.userId !== currentUserId) {
      return NextResponse.json(
        { error: "Only the primary project owner can transfer maintainership" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const newOwnerUserId = String(body.newOwnerUserId || "").trim();
    const transferNote = String(body.note || "").trim();

    if (!newOwnerUserId) {
      return NextResponse.json({ error: "newOwnerUserId is required" }, { status: 400 });
    }

    if (newOwnerUserId === currentUserId) {
      return NextResponse.json({ error: "You are already the owner of this project" }, { status: 400 });
    }

    const newOwner = await prisma.user.findUnique({
      where: { id: newOwnerUserId },
      select: { id: true, name: true, email: true },
    });

    if (!newOwner) {
      return NextResponse.json({ error: "Target new owner user not found" }, { status: 404 });
    }

    const transferXp = XP_REWARDS.TRANSFER_MAINTAINERSHIP; // 150 XP
    const badgeXp = COMMUNITY_BADGES.torchbearer.xpReward; // 400 XP

    await prisma.$transaction([
      // 1. Update project owner
      prisma.project.update({
        where: { id: project.id },
        data: {
          userId: newOwnerUserId,
        },
      }),
      // 2. Set new owner's membership
      prisma.projectMembership.upsert({
        where: {
          projectId_userId: {
            projectId: project.id,
            userId: newOwnerUserId,
          },
        },
        create: {
          projectId: project.id,
          userId: newOwnerUserId,
          role: "OWNER",
        },
        update: {
          role: "OWNER",
        },
      }),
      // 3. Demote old owner to MAINTAINER
      prisma.projectMembership.upsert({
        where: {
          projectId_userId: {
            projectId: project.id,
            userId: currentUserId,
          },
        },
        create: {
          projectId: project.id,
          userId: currentUserId,
          role: "MAINTAINER",
        },
        update: {
          role: "MAINTAINER",
        },
      }),
      // 4. Record timeline event
      prisma.projectTimelineEvent.create({
        data: {
          projectId: project.id,
          type: "transfer",
          title: "Maintainership Transferred 👑",
          description: transferNote || `Maintainership transferred from previous owner to ${newOwner.name || "new maintainer"}.`,
        },
      }),
      // 5. Award XP to new owner
      prisma.experienceLedger.create({
        data: {
          userId: newOwnerUserId,
          action: "transfer_maintainership",
          sourceId: project.id,
          points: transferXp,
          description: `Assumed stewardship and maintainership of "${project.name}"`,
        },
      }),
      prisma.user.update({
        where: { id: newOwnerUserId },
        data: {
          xp: { increment: transferXp },
        },
      }),
      // 6. Award "Torchbearer" badge to new owner
      prisma.userAchievement.upsert({
        where: {
          userId_badgeId: {
            userId: newOwnerUserId,
            badgeId: "torchbearer",
          },
        },
        create: {
          userId: newOwnerUserId,
          badgeId: "torchbearer",
        },
        update: {},
      }),
      prisma.experienceLedger.create({
        data: {
          userId: newOwnerUserId,
          action: "badge_unlocked",
          sourceId: "torchbearer",
          points: badgeXp,
          description: "Unlocked Torchbearer Badge!",
        },
      }),
      prisma.user.update({
        where: { id: newOwnerUserId },
        data: {
          xp: { increment: badgeXp },
        },
      }),
      // 7. Notifications
      prisma.notification.create({
        data: {
          userId: newOwnerUserId,
          title: "You are now Lead Maintainer! 👑",
          message: `Stewardship of "${project.name}" has been transferred to you! You've unlocked the Torchbearer badge (+${transferXp + badgeXp} XP total).`,
          link: `/community`,
          type: "achievement",
        },
      }),
      prisma.notification.create({
        data: {
          userId: currentUserId,
          title: "Maintainership Transferred",
          message: `Maintainership of "${project.name}" has successfully been transferred to ${newOwner.name || newOwner.email}.`,
          link: `/dashboard`,
          type: "info",
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `Maintainership of "${project.name}" successfully transferred to ${newOwner.name || newOwner.email}`,
      newOwnerId: newOwnerUserId,
      totalXpAwarded: transferXp + badgeXp,
    });
  } catch (error: unknown) {
    console.error("Error transferring maintainership:", error);
    return NextResponse.json({ error: "Failed to transfer project maintainership" }, { status: 500 });
  }
}
