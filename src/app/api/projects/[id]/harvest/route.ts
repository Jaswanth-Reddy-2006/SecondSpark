import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { HarvestGem } from "@/types/project";

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
      select: {
        id: true,
        harvestGems: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const gems: HarvestGem[] = JSON.parse(project.harvestGems || "[]");
    return NextResponse.json({ gems });
  } catch (error) {
    console.error("Error fetching harvest gems:", error);
    return NextResponse.json({ error: "Failed to fetch harvest gems" }, { status: 500 });
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
        memberships: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const isOwner = project.userId === session.user.id;
    const isMember = project.memberships.some((m) => m.userId === session.user?.id);

    if (!isOwner && !isMember) {
      return NextResponse.json({ error: "Forbidden: Not a collaborator" }, { status: 403 });
    }

    const body = await req.json();
    if (!body.name || !body.path) {
      return NextResponse.json({ error: "Name and path are required" }, { status: 400 });
    }

    const existingGems: HarvestGem[] = JSON.parse(project.harvestGems || "[]");
    const newGem: HarvestGem = {
      id: `gem-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      name: body.name.trim(),
      path: body.path.trim(),
      description: body.description?.trim() || "",
      tags: Array.isArray(body.tags) ? body.tags : ["Component"],
      checklist: {
        isolated: Boolean(body.checklist?.isolated),
        tested: Boolean(body.checklist?.tested),
        packaged: Boolean(body.checklist?.packaged),
      },
      exportTarget: body.exportTarget || "gist",
      createdAt: new Date().toISOString(),
    };

    const updatedGems = [newGem, ...existingGems];

    await prisma.project.update({
      where: { id: project.id },
      data: {
        harvestGems: JSON.stringify(updatedGems),
        timeline: {
          create: [
            {
              title: "Harvestable Gem Catalogued",
              description: `Module "${newGem.name}" (${newGem.path}) catalogued for extraction and reuse.`,
              type: "note_added",
            },
          ],
        },
      },
    });

    return NextResponse.json({ gem: newGem, gems: updatedGems }, { status: 201 });
  } catch (error) {
    console.error("Error creating harvest gem:", error);
    return NextResponse.json({ error: "Failed to create harvest gem" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
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
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const body = await req.json();
    const { gemId, checklist, exportTarget, name, description } = body;

    const existingGems: HarvestGem[] = JSON.parse(project.harvestGems || "[]");
    const gemIndex = existingGems.findIndex((g) => g.id === gemId);

    if (gemIndex === -1) {
      return NextResponse.json({ error: "Gem not found" }, { status: 404 });
    }

    const current = existingGems[gemIndex];
    existingGems[gemIndex] = {
      ...current,
      name: name ?? current.name,
      description: description ?? current.description,
      exportTarget: exportTarget ?? current.exportTarget,
      checklist: checklist
        ? {
            ...current.checklist,
            ...checklist,
          }
        : current.checklist,
    };

    await prisma.project.update({
      where: { id: project.id },
      data: {
        harvestGems: JSON.stringify(existingGems),
      },
    });

    return NextResponse.json({ gems: existingGems });
  } catch (error) {
    console.error("Error updating harvest gem:", error);
    return NextResponse.json({ error: "Failed to update harvest gem" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
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
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const gemId = searchParams.get("gemId");

    if (!gemId) {
      return NextResponse.json({ error: "gemId parameter required" }, { status: 400 });
    }

    const existingGems: HarvestGem[] = JSON.parse(project.harvestGems || "[]");
    const filtered = existingGems.filter((g) => g.id !== gemId);

    await prisma.project.update({
      where: { id: project.id },
      data: {
        harvestGems: JSON.stringify(filtered),
      },
    });

    return NextResponse.json({ gems: filtered });
  } catch (error) {
    console.error("Error deleting harvest gem:", error);
    return NextResponse.json({ error: "Failed to delete harvest gem" }, { status: 500 });
  }
}
