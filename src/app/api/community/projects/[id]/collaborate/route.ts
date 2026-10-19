import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/community/projects/[id]/collaborate - Lists applications for this project (owner/maintainer only)
export async function GET(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
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
        { error: "Only project maintainers can review collaboration applications" },
        { status: 403 }
      );
    }

    const requests = await prisma.collaborationRequest.findMany({
      where: { projectId: project.id },
      include: {
        applicant: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            xp: true,
            level: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const parsed = requests.map((r) => {
      let skills: string[] = [];
      try {
        skills = JSON.parse(r.skills || "[]");
      } catch {
        skills = [];
      }

      return {
        id: r.id,
        projectId: r.projectId,
        applicantId: r.applicantId,
        motivation: r.motivation,
        skills,
        proposedContribution: r.proposedContribution,
        status: r.status,
        responseNote: r.responseNote,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
        applicant: r.applicant,
      };
    });

    return NextResponse.json({
      projectId: project.id,
      requests: parsed,
    });
  } catch (error: unknown) {
    console.error("Error fetching collaboration requests:", error);
    return NextResponse.json({ error: "Failed to fetch collaboration requests" }, { status: 500 });
  }
}

// POST /api/community/projects/[id]/collaborate - Submit application to revive / adopt a project
export async function POST(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Authentication required to apply for collaboration" },
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

    if (project.collaborationStatus === "closed") {
      return NextResponse.json(
        { error: "This project is closed to external collaborators at this time" },
        { status: 400 }
      );
    }

    // Anti-Abuse: Cannot apply to collaborate on your own project or if already a member
    if (project.userId === userId) {
      return NextResponse.json(
        { error: "You are already the owner of this project" },
        { status: 400 }
      );
    }

    const existingMember = project.memberships.find((m) => m.userId === userId);
    if (existingMember) {
      return NextResponse.json(
        { error: `You are already a member of this project (${existingMember.role})` },
        { status: 400 }
      );
    }

    // Check if user already has a pending application
    const existingPending = await prisma.collaborationRequest.findFirst({
      where: {
        projectId: project.id,
        applicantId: userId,
        status: "pending",
      },
    });

    if (existingPending) {
      return NextResponse.json(
        { error: "You already have a pending application for this project. Please await maintainer review." },
        { status: 409 }
      );
    }

    const body = await req.json();
    const motivation = String(body.motivation || "").trim();
    const proposedContribution = String(body.proposedContribution || "").trim();

    let skills: string[] = [];
    if (Array.isArray(body.skills)) {
      skills = (body.skills as unknown[]).map(String).map((s: string) => s.trim()).filter(Boolean);
    }

    if (!motivation) {
      return NextResponse.json(
        { error: "Please provide a brief statement of motivation" },
        { status: 400 }
      );
    }

    const request = await prisma.collaborationRequest.create({
      data: {
        projectId: project.id,
        applicantId: userId,
        motivation,
        proposedContribution: proposedContribution || "Contributor / Revival Engineer",
        skills: JSON.stringify(skills),
        status: "pending",
      },
    });

    // Notify the project owner
    await prisma.notification.create({
      data: {
        userId: project.userId,
        title: "New Collaboration Application! 🤝",
        message: `${session.user.name || "A developer"} applied to revive/collaborate on "${project.name}"`,
        link: `/community`,
        type: "invite",
      },
    });

    return NextResponse.json({
      success: true,
      request: {
        ...request,
        skills,
      },
    });
  } catch (error: unknown) {
    console.error("Error creating collaboration request:", error);
    return NextResponse.json({ error: "Failed to submit collaboration request" }, { status: 500 });
  }
}
