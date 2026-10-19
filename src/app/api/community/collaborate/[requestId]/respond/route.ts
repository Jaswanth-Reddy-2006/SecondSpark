import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { XP_REWARDS } from "@/types/community";

interface RouteParams {
  params: Promise<{ requestId: string }>;
}

// PATCH /api/community/collaborate/[requestId]/respond - Owner accepts or declines collaboration request
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  const { requestId } = await params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const request = await prisma.collaborationRequest.findUnique({
      where: { id: requestId },
      include: {
        project: {
          include: {
            memberships: true,
          },
        },
        applicant: true,
      },
    });

    if (!request) {
      return NextResponse.json({ error: "Collaboration request not found" }, { status: 404 });
    }

    const isOwner = request.project.userId === userId;
    const isMaintainer = request.project.memberships.some(
      (m) => m.userId === userId && (m.role === "OWNER" || m.role === "MAINTAINER")
    );

    if (!isOwner && !isMaintainer) {
      return NextResponse.json(
        { error: "Only project maintainers can respond to collaboration applications" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const action = body.status; // "accepted" | "declined"
    const responseNote = body.responseNote ? String(body.responseNote).trim() : null;
    const assignedRole = body.role === "MAINTAINER" ? "MAINTAINER" : "CONTRIBUTOR";

    if (action !== "accepted" && action !== "declined") {
      return NextResponse.json(
        { error: "Invalid status response. Must be 'accepted' or 'declined'." },
        { status: 400 }
      );
    }

    let xpAwarded = 0;

    if (action === "accepted") {
      xpAwarded = XP_REWARDS.ACCEPT_COLLABORATOR; // 30 XP

      await prisma.$transaction([
        // Update request status
        prisma.collaborationRequest.update({
          where: { id: requestId },
          data: {
            status: "accepted",
            responseNote,
          },
        }),
        // Add applicant as ProjectMember
        prisma.projectMembership.upsert({
          where: {
            projectId_userId: {
              projectId: request.projectId,
              userId: request.applicantId,
            },
          },
          create: {
            projectId: request.projectId,
            userId: request.applicantId,
            role: assignedRole,
          },
          update: {
            role: assignedRole,
          },
        }),
        // Award XP to applicant
        prisma.experienceLedger.create({
          data: {
            userId: request.applicantId,
            action: "join_team",
            sourceId: requestId,
            points: xpAwarded,
            description: `Accepted as ${assignedRole} on "${request.project.name}"`,
          },
        }),
        prisma.user.update({
          where: { id: request.applicantId },
          data: {
            xp: { increment: xpAwarded },
          },
        }),
        // Notify applicant
        prisma.notification.create({
          data: {
            userId: request.applicantId,
            title: "Application Accepted! 🎉",
            message: `Congratulations! You've joined the revival team for "${request.project.name}" as a ${assignedRole}! (+${xpAwarded} XP)`,
            link: `/community`,
            type: "invite",
          },
        }),
      ]);
    } else {
      await prisma.$transaction([
        prisma.collaborationRequest.update({
          where: { id: requestId },
          data: {
            status: "declined",
            responseNote,
          },
        }),
        prisma.notification.create({
          data: {
            userId: request.applicantId,
            title: "Application Update",
            message: `The maintainer has reviewed your application for "${request.project.name}".`,
            link: `/community`,
            type: "info",
          },
        }),
      ]);
    }

    return NextResponse.json({
      success: true,
      status: action,
      xpAwarded,
      role: assignedRole,
    });
  } catch (error: unknown) {
    console.error("Error responding to collaboration request:", error);
    return NextResponse.json({ error: "Failed to process application response" }, { status: 500 });
  }
}
