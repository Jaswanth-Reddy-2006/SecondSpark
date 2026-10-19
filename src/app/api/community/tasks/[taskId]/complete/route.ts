import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { XP_REWARDS, COMMUNITY_BADGES } from "@/types/community";

interface RouteParams {
  params: Promise<{ taskId: string }>;
}

// POST /api/community/tasks/[taskId]/complete - Mark task as completed with PR link & XP + badge rewards
export async function POST(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  const { taskId } = await params;

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const userId = session.user.id;

  try {
    const task = await prisma.projectTask.findUnique({
      where: { id: taskId },
      include: {
        project: {
          include: {
            memberships: true,
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const isAssignee = task.assigneeId === userId;
    const isOwner = task.project.userId === userId;
    const isMaintainer = task.project.memberships.some(
      (m) => m.userId === userId && (m.role === "OWNER" || m.role === "MAINTAINER")
    );

    if (!isAssignee && !isOwner && !isMaintainer) {
      return NextResponse.json(
        { error: "Only the task assignee or project maintainers can mark this task complete" },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const githubPrUrl = body.githubPrUrl ? String(body.githubPrUrl).trim() : task.githubPrUrl;

    const updatedTask = await prisma.projectTask.update({
      where: { id: taskId },
      data: {
        status: "completed",
        completedAt: new Date(),
        githubPrUrl,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            image: true,
            xp: true,
            level: true,
          },
        },
      },
    });

    const targetUserId = task.assigneeId || userId;
    let xpAwarded = 0;
    let badgeAwarded: string | null = null;

    // Award 100 XP to the developer who completed the task
    const existingLedger = await prisma.experienceLedger.findFirst({
      where: {
        userId: targetUserId,
        action: "complete_task",
        sourceId: taskId,
      },
    });

    if (!existingLedger) {
      xpAwarded = XP_REWARDS.COMPLETE_TASK; // 100 XP

      await prisma.$transaction([
        prisma.experienceLedger.create({
          data: {
            userId: targetUserId,
            action: "complete_task",
            sourceId: taskId,
            points: xpAwarded,
            description: `Completed resurrection task "${task.title}" on "${task.project.name}"`,
          },
        }),
        prisma.user.update({
          where: { id: targetUserId },
          data: {
            xp: { increment: xpAwarded },
          },
        }),
        prisma.notification.create({
          data: {
            userId: targetUserId,
            title: "Task Completed! 🚀",
            message: `Task "${task.title}" completed! You've been awarded +${xpAwarded} XP.`,
            link: `/community`,
            type: "task",
          },
        }),
      ]);

      // Check for "task_finisher" (Blocker Smasher) badge: 3 completed resurrection tasks
      const completedCount = await prisma.projectTask.count({
        where: {
          assigneeId: targetUserId,
          status: "completed",
        },
      });

      if (completedCount >= 3) {
        const existingBadge = await prisma.userAchievement.findUnique({
          where: {
            userId_badgeId: {
              userId: targetUserId,
              badgeId: "task_finisher",
            },
          },
        });

        if (!existingBadge) {
          const badgeXp = COMMUNITY_BADGES.task_finisher.xpReward; // 250 XP
          await prisma.$transaction([
            prisma.userAchievement.create({
              data: {
                userId: targetUserId,
                badgeId: "task_finisher",
              },
            }),
            prisma.experienceLedger.create({
              data: {
                userId: targetUserId,
                action: "badge_unlocked",
                sourceId: "task_finisher",
                points: badgeXp,
                description: "Unlocked Blocker Smasher Badge!",
              },
            }),
            prisma.user.update({
              where: { id: targetUserId },
              data: {
                xp: { increment: badgeXp },
              },
            }),
            prisma.notification.create({
              data: {
                userId: targetUserId,
                title: "Achievement Unlocked: Blocker Smasher! 🛡️",
                message: "You've resolved 3 critical resurrection tasks across community projects! (+250 XP)",
                link: `/community`,
                type: "achievement",
              },
            }),
          ]);
          badgeAwarded = "task_finisher";
        }
      }
    }

    // Notify project owner if someone else completed it
    if (task.project.userId !== userId) {
      await prisma.notification.create({
        data: {
          userId: task.project.userId,
          title: "Resurrection Task Resolved! 🎉",
          message: `${session.user.name || "A contributor"} completed the task "${task.title}" on "${task.project.name}"`,
          link: `/community`,
          type: "task",
        },
      });
    }

    let requiredSkills: string[] = [];
    try {
      requiredSkills = JSON.parse(updatedTask.requiredSkills || "[]");
    } catch {
      requiredSkills = [];
    }

    return NextResponse.json({
      success: true,
      task: {
        ...updatedTask,
        requiredSkills,
      },
      xpAwarded,
      badgeAwarded,
    });
  } catch (error: unknown) {
    console.error("Error completing task:", error);
    return NextResponse.json({ error: "Failed to mark task complete" }, { status: 500 });
  }
}
