import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateProjectAutopsy } from "@/lib/autopsy-engine";
import { Project } from "@/types/project";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const project = await prisma.project.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.autopsyData) {
      const parsed = JSON.parse(project.autopsyData);
      return NextResponse.json({
        autopsy: parsed,
        autopsyRunAt: project.autopsyRunAt?.toISOString() || null,
      });
    }

    // If no autopsy run yet, generate one on the fly
    const projectObj: Project = {
      id: project.id,
      name: project.name,
      tagline: project.tagline,
      description: project.description,
      originalProblem: project.originalProblem,
      intendedUsers: project.intendedUsers,
      techTags: JSON.parse(project.techTags || "[]"),
      repoUrl: project.repoUrl || undefined,
      demoUrl: project.demoUrl || undefined,
      status: project.status as Project["status"],
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
      revivalPotential: project.revivalPotential as Project["revivalPotential"],
      author: {
        name: "Developer",
        avatar: "DV",
        handle: "@developer",
      },
      history: [],
    };

    const autopsy = generateProjectAutopsy(projectObj);
    return NextResponse.json({
      autopsy,
      autopsyRunAt: null,
    });
  } catch (error) {
    console.error("Error retrieving autopsy:", error);
    return NextResponse.json({ error: "Failed to generate autopsy" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  const { id } = await params;

  try {
    const project = await prisma.project.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        memberships: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check authorization: public projects can be inspected by anyone; private require owner/member
    const isOwner = session?.user?.id === project.userId;
    const isMember = session?.user?.id
      ? project.memberships.some((m) => m.userId === session.user?.id)
      : false;

    if (!project.isPublic && !isOwner && !isMember) {
      return NextResponse.json({ error: "Forbidden: Unauthorized access" }, { status: 403 });
    }

    const projectObj: Project = {
      id: project.id,
      name: project.name,
      tagline: project.tagline,
      description: project.description,
      originalProblem: project.originalProblem,
      intendedUsers: project.intendedUsers,
      techTags: JSON.parse(project.techTags || "[]"),
      repoUrl: project.repoUrl || undefined,
      demoUrl: project.demoUrl || undefined,
      status: project.status as Project["status"],
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
      revivalPotential: project.revivalPotential as Project["revivalPotential"],
      author: {
        name: "Developer",
        avatar: "DV",
        handle: "@developer",
      },
      history: [],
    };

    const autopsy = generateProjectAutopsy(projectObj);
    const now = new Date();

    await prisma.project.update({
      where: { id: project.id },
      data: {
        autopsyData: JSON.stringify(autopsy),
        autopsyRunAt: now,
        timeline: {
          create: [
            {
              title: "Project Autopsy Executed",
              description: `Diagnostic health scan completed. Rot Index: ${autopsy.rotIndex}/100 (${autopsy.rotSeverity.toUpperCase()}). Sized as: ${autopsy.effortSize.replace("_", " ").toUpperCase()}.`,
              type: "note_added",
            },
          ],
        },
      },
    });

    return NextResponse.json({
      autopsy,
      autopsyRunAt: now.toISOString(),
      message: "Autopsy completed and persisted to Neon database.",
    });
  } catch (error) {
    console.error("Error executing autopsy:", error);
    return NextResponse.json({ error: "Failed to execute autopsy" }, { status: 500 });
  }
}
