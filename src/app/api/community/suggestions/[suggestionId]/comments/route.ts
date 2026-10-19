import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ suggestionId: string }>;
}

// POST /api/community/suggestions/[suggestionId]/comments - Adds a discussion comment to a suggestion
export async function POST(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  const { suggestionId } = await params;

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Authentication required to comment on suggestions" },
      { status: 401 }
    );
  }

  const userId = session.user.id;

  try {
    const suggestion = await prisma.suggestion.findUnique({
      where: { id: suggestionId },
      include: { project: true },
    });

    if (!suggestion) {
      return NextResponse.json({ error: "Suggestion not found" }, { status: 404 });
    }

    const body = await req.json();
    const content = String(body.content || "").trim();

    if (!content) {
      return NextResponse.json({ error: "Comment content cannot be empty" }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: {
        suggestionId,
        authorId: userId,
        content,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Notify suggestion author if different user
    if (suggestion.authorId !== userId) {
      await prisma.notification.create({
        data: {
          userId: suggestion.authorId,
          title: "New Comment on Suggestion",
          message: `${session.user.name || "A developer"} replied to your suggestion "${suggestion.title}"`,
          link: `/community`,
          type: "suggestion",
        },
      });
    }

    return NextResponse.json({
      success: true,
      comment: {
        id: comment.id,
        suggestionId: comment.suggestionId,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        author: comment.author,
      },
    });
  } catch (error: unknown) {
    console.error("Error creating comment:", error);
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
  }
}
