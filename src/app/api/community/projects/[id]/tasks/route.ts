import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const VALID_TYPES = ["bug", "feature", "documentation", "test", "chore"] as const;
const VALID_PRIORITIES = ["critical", "high", "medium", "low"] as const;

// GET /api/community/projects/[id]/tasks - Lists revival tasks for a public project
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;

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

    const tasks = await prisma.projectTask.findMany({
      where: { projectId: project.id },
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
      orderBy: [
        { status: "asc" },
        { createdAt: "desc" },
      ],
    });

    const parsedTasks = tasks.map((t) => {
      let requiredSkills: string[] = [];
      try {
        requiredSkills = JSON.parse(t.requiredSkills || "[]");
      } catch {
        requiredSkills = [];
      }

      return {
        id: t.id,
        projectId: t.projectId,
        title: t.title,
        description: t.description,
        type: t.type,
        priority: t.priority,
        status: t.status,
        requiredSkills,
        assigneeId: t.assigneeId,
        assignee: t.assignee
          ? {
              id: t.assignee.id,
              name: t.assignee.name || "Contributor",
              image: t.assignee.image,
              xp: t.assignee.xp,
              level: t.assignee.level,
            }
          : null,
        githubIssueUrl: t.githubIssueUrl,
        githubPrUrl: t.githubPrUrl,
        completedAt: t.completedAt ? t.completedAt.toISOString() : null,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      };
    });

    return NextResponse.json({
      projectId: project.id,
      tasks: parsedTasks,
      stats: {
        total: tasks.length,
        open: tasks.filter((t) => t.status === "open").length,
        inProgress: tasks.filter((t) => t.status === "in_progress").length,
        completed: tasks.filter((t) => t.status === "completed").length,
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching project tasks:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

// POST /api/community/projects/[id]/tasks - Project maintainer creates a resurrection task
export async function POST(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Authentication required" },
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
      include: {
        memberships: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Public project not found" }, { status: 404 });
    }

    const isOwner = project.userId === userId;
    const isMaintainer = project.memberships.some(
      (m) => m.userId === userId && (m.role === "OWNER" || m.role === "MAINTAINER")
    );

    if (!isOwner && !isMaintainer) {
      return NextResponse.json(
        { error: "Only project maintainers can create resurrection tasks" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const title = String(body.title || "").trim();
    const description = String(body.description || "").trim();
    const type = VALID_TYPES.includes(body.type) ? body.type : "feature";
    const priority = VALID_PRIORITIES.includes(body.priority) ? body.priority : "medium";
    const githubIssueUrl = body.githubIssueUrl ? String(body.githubIssueUrl).trim() : null;

    let requiredSkills: string[] = [];
    if (Array.isArray(body.requiredSkills)) {
      requiredSkills = (body.requiredSkills as unknown[]).map(String).map((s: string) => s.trim()).filter(Boolean);
    }

    if (!title) {
      return NextResponse.json({ error: "Task title is required" }, { status: 400 });
    }

    const task = await prisma.projectTask.create({
      data: {
        projectId: project.id,
        title,
        description,
        type,
        priority,
        status: "open",
        requiredSkills: JSON.stringify(requiredSkills),
        githubIssueUrl,
      },
    });

    return NextResponse.json({
      success: true,
      task: {
        ...task,
        requiredSkills,
        assignee: null,
      },
    });
  } catch (error: unknown) {
    console.error("Error creating project task:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
