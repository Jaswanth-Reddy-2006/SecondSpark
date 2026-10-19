import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AdoptionProtocol } from "@/types/project";
import { calculateLevel } from "@/types/community";

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
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    let protocol: AdoptionProtocol;
    if (project.adoptionProtocol) {
      protocol = JSON.parse(project.adoptionProtocol);
    } else {
      protocol = {
        status: "not_started",
        currentStep: 1,
        license: {
          spdx: "MIT",
          verified: false,
        },
        handoverType: "canonical_fork",
        targetRepoUrl: "",
        credentialsChecklist: {
          npmTransferred: false,
          domainTransferred: false,
          hostingTransferred: false,
          notes: "",
        },
        founderEmeritus: {
          name: project.user.name || "Original Creator",
          userId: project.user.id,
          acknowledged: false,
        },
      };
    }

    return NextResponse.json({ protocol, projectTitle: project.name });
  } catch (error) {
    console.error("Error retrieving adoption protocol:", error);
    return NextResponse.json({ error: "Failed to retrieve adoption protocol" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const project = await prisma.project.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        user: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const body = await req.json();
    const { step, license, handoverType, targetRepoUrl, credentialsChecklist, complete } = body;

    let currentProtocol: AdoptionProtocol;
    if (project.adoptionProtocol) {
      currentProtocol = JSON.parse(project.adoptionProtocol);
    } else {
      currentProtocol = {
        status: "in_progress",
        currentStep: 1,
        license: { spdx: "MIT", verified: false },
        handoverType: "canonical_fork",
        credentialsChecklist: {},
        founderEmeritus: {
          name: project.user.name || "Original Creator",
          userId: project.user.id,
          acknowledged: false,
        },
      };
    }

    if (step) currentProtocol.currentStep = step;
    if (license) currentProtocol.license = license;
    if (handoverType) currentProtocol.handoverType = handoverType;
    if (targetRepoUrl !== undefined) currentProtocol.targetRepoUrl = targetRepoUrl;
    if (credentialsChecklist) currentProtocol.credentialsChecklist = credentialsChecklist;

    // If final completion step requested
    if (complete) {
      currentProtocol.status = "completed";
      currentProtocol.currentStep = 4;
      currentProtocol.completedAt = new Date().toISOString();
      currentProtocol.founderEmeritus = {
        name: project.user.name || "Original Creator",
        userId: project.user.id,
        acknowledged: true,
        handoverDate: new Date().toISOString().split("T")[0],
      };

      const adopterId = session.user.id;

      // Update or create adopter membership as MAINTAINER
      await prisma.projectMembership.upsert({
        where: {
          projectId_userId: {
            projectId: project.id,
            userId: adopterId,
          },
        },
        create: {
          projectId: project.id,
          userId: adopterId,
          role: "MAINTAINER",
        },
        update: {
          role: "MAINTAINER",
        },
      });

      // Award adopter XP and Torchbearer badge
      const adopterUser = await prisma.user.findUnique({ where: { id: adopterId } });
      const currentXp = adopterUser?.xp || 0;
      const newXp = currentXp + 500;

      await prisma.user.update({
        where: { id: adopterId },
        data: {
          xp: newXp,
          level: calculateLevel(newXp).level,
        },
      });

      await prisma.experienceLedger.create({
        data: {
          userId: adopterId,
          points: 500,
          action: "project_revived",
          sourceId: project.id,
          description: `Formally adopted and revived graveyard repository: ${project.name}`,
        },
      });

      await prisma.userAchievement.upsert({
        where: {
          userId_badgeId: {
            userId: adopterId,
            badgeId: "torchbearer",
          },
        },
        create: {
          userId: adopterId,
          badgeId: "torchbearer",
        },
        update: {},
      });

      // Update project status to Revived and save protocol
      await prisma.project.update({
        where: { id: project.id },
        data: {
          status: "Revived",
          collaborationStatus: "open_to_collaborators",
          adoptionProtocol: JSON.stringify(currentProtocol),
          founderEmeritus: JSON.stringify(currentProtocol.founderEmeritus),
          timeline: {
            create: [
              {
                title: "Official Adoption Protocol Finalized",
                description: `Project formally adopted by ${session.user.name || "Adopter"} via ${currentProtocol.handoverType === "org_transfer" ? "organization transfer" : "canonical revival fork"}. Founder Emeritus honors assigned to ${project.user.name || "Founder"}.`,
                type: "status_change",
              },
            ],
          },
        },
      });

      return NextResponse.json({
        success: true,
        protocol: currentProtocol,
        message: "Repository successfully adopted and revived! +500 XP and Torchbearer badge awarded.",
      });
    }

    // Intermediate step update
    await prisma.project.update({
      where: { id: project.id },
      data: {
        adoptionProtocol: JSON.stringify(currentProtocol),
      },
    });

    return NextResponse.json({
      success: true,
      protocol: currentProtocol,
    });
  } catch (error) {
    console.error("Error updating adoption protocol:", error);
    return NextResponse.json({ error: "Failed to update adoption protocol" }, { status: 500 });
  }
}
