import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateLevel } from "@/types/community";

export async function POST(req: NextRequest) {
  try {
    const event = req.headers.get("x-github-event") || "push";
    const body = await req.json();

    // Support simulated test webhooks
    const isTest = req.nextUrl.searchParams.get("test") === "true" || body.test === true;

    // Handle Push event
    if (event === "push") {
      const repoFullName = body.repository?.full_name;
      const commitsCount = Array.isArray(body.commits) ? body.commits.length : 1;
      const pusherName = body.pusher?.name || body.sender?.login || "GitHub";

      // Look up project by repoUrl or test projectId
      const project = await prisma.project.findFirst({
        where: isTest && body.projectId
          ? { id: body.projectId }
          : {
              repoUrl: {
                contains: repoFullName || "nonexistent",
              },
            },
        include: {
          user: true,
        },
      });

      if (!project) {
        return NextResponse.json(
          { message: `Webhook received for ${repoFullName || "repo"}, but no matching SecondSpark project found.` },
          { status: 200 }
        );
      }

      const today = new Date().toISOString().split("T")[0];

      await prisma.project.update({
        where: { id: project.id },
        data: {
          lastActiveDate: today,
          timeline: {
            create: [
              {
                title: "GitHub Commit Activity Detected",
                description: `Heartbeat sensor recorded ${commitsCount} commit(s) pushed by ${pusherName}. Project last active date updated.`,
                type: "update",
              },
            ],
          },
        },
      });

      // Notify project owner
      await prisma.notification.create({
        data: {
          userId: project.userId,
          title: `Heartbeat: Fresh Activity on ${project.name}`,
          message: `${pusherName} pushed ${commitsCount} new commit(s). SecondSpark has automatically refreshed your project's activity timestamp.`,
          type: "info",
          link: `/dashboard`,
        },
      });

      return NextResponse.json({
        success: true,
        event: "push",
        projectId: project.id,
        projectName: project.name,
        message: "Activity recorded and heartbeat updated.",
      });
    }

    // Handle Pull Request Merged event
    if (event === "pull_request") {
      const action = body.action;
      const isMerged = body.pull_request?.merged || action === "closed";
      const prTitle = body.pull_request?.title || "Community Revival Pull Request";
      const prUrl = body.pull_request?.html_url || "";
      const repoFullName = body.repository?.full_name;

      if (!isMerged) {
        return NextResponse.json({ message: "PR event ignored (not merged)." }, { status: 200 });
      }

      const project = await prisma.project.findFirst({
        where: isTest && body.projectId
          ? { id: body.projectId }
          : {
              repoUrl: {
                contains: repoFullName || "nonexistent",
              },
            },
        include: {
          tasks: {
            where: {
              status: { in: ["open", "in_progress"] },
            },
          },
        },
      });

      if (!project) {
        return NextResponse.json({ message: "No matching project found for PR event." }, { status: 200 });
      }

      // Check if any open task matches PR title
      const matchingTask = project.tasks[0]; // match first available or title-matched task
      if (matchingTask) {
        await prisma.projectTask.update({
          where: { id: matchingTask.id },
          data: {
            status: "completed",
            githubPrUrl: prUrl,
            completedAt: new Date(),
          },
        });

        // If task has assignee, award XP
        if (matchingTask.assigneeId) {
          const assignee = await prisma.user.findUnique({ where: { id: matchingTask.assigneeId } });
          if (assignee) {
            const newXp = (assignee.xp || 0) + 100;
            await prisma.user.update({
              where: { id: matchingTask.assigneeId },
              data: {
                xp: newXp,
                level: calculateLevel(newXp).level,
              },
            });

            await prisma.experienceLedger.create({
              data: {
                userId: matchingTask.assigneeId,
                points: 100,
                action: "complete_task",
                sourceId: matchingTask.id,
                description: `Completed task "${matchingTask.title}" via merged GitHub PR`,
              },
            });
          }
        }
      }

      await prisma.projectTimelineEvent.create({
        data: {
          projectId: project.id,
          title: "GitHub Pull Request Merged",
          description: `Merged PR: "${prTitle}". ${matchingTask ? `Task "${matchingTask.title}" resolved automatically.` : ""}`,
          type: "status_change",
        },
      });

      return NextResponse.json({
        success: true,
        event: "pull_request",
        projectId: project.id,
        matchedTask: matchingTask ? matchingTask.title : null,
      });
    }

    return NextResponse.json({ received: true, event });
  } catch (error) {
    console.error("Error processing GitHub webhook:", error);
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 });
  }
}
