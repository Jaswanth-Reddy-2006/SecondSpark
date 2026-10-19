import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { XP_REWARDS } from "@/types/community";

interface RouteParams {
  params: Promise<{ taskId: string }>;
}

// POST /api/community/tasks/[taskId]/claim - Authenticated developer claims an open resurrection task
export async function POST(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  const { taskId } = await params;

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Authentication required to claim tasks" },
      { status: 401 }
    );
  }

  const userId = session.user.id;

  try {
    const task = await prisma.projectTask.findUnique({
      where: { id: taskId },
      include: {
        project: true,
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (task.status !== "open" && task.assigneeId) {
      return NextResponse.json(
        { error: "This task has already been claimed or is completed" },
        { status: 409 }
      );
    }

    const xpAwarded = XP_REWARDS.CLAIM_TASK; // 10 XP

    // Atomic transaction: claim task + award XP + notify project owner
    const [updatedTask] = await prisma.$transaction([
      prisma.projectTask.update({
        where: { id: taskId },
        data: {
          status: "in_progress",
          assigneeId: userId,
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
      }),
      prisma.experienceLedger.create({
        data: {
          userId,
          action: "claim_task",
          sourceId: taskId,
          points: xpAwarded,
          description: `Claimed resurrection task "${task.title}" on "${task.project.name}"`,
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
          userId: task.project.userId,
          title: "Task Claimed! 🛠️",
          message: `${session.user.name || "A developer"} claimed the task "${task.title}" on your project "${task.project.name}"`,
          link: `/community`,
          type: "task",
        },
      }),
    ]);

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
    });
  } catch (error: unknown) {
    console.error("Error claiming task:", error);
    return NextResponse.json({ error: "Failed to claim task" }, { status: 500 });
  }
}
