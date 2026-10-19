import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanMockData() {
  console.log("🧹 Cleaning all mock and dummy projects from SQLite database...");

  // Delete all projects and their cascading relations
  const deletedProjects = await prisma.project.deleteMany({});
  console.log(`✅ Deleted ${deletedProjects.count} mock/seeded project(s).`);

  // Delete all tasks, suggestions, reviews, memberships, collaboration requests, timeline events
  const deletedTasks = await prisma.projectTask.deleteMany({});
  const deletedSuggestions = await prisma.suggestion.deleteMany({});
  const deletedReviews = await prisma.projectRating.deleteMany({});
  const deletedCollab = await prisma.collaborationRequest.deleteMany({});
  const deletedLedger = await prisma.experienceLedger.deleteMany({});
  const deletedAchievements = await prisma.userAchievement.deleteMany({});
  const deletedNotifications = await prisma.notification.deleteMany({});
  const deletedMemberships = await prisma.projectMembership.deleteMany({});

  console.log(`✅ Cleaned associated tables:
    - Tasks: ${deletedTasks.count}
    - Suggestions: ${deletedSuggestions.count}
    - Reviews: ${deletedReviews.count}
    - Collab Requests: ${deletedCollab.count}
    - XP Ledger: ${deletedLedger.count}
    - Achievements: ${deletedAchievements.count}
    - Notifications: ${deletedNotifications.count}
    - Memberships: ${deletedMemberships.count}
  `);

  // Reset users' XP and level back to clean state (Level 1, 0 XP)
  await prisma.user.updateMany({
    data: {
      xp: 0,
      level: 1,
    },
  });

  // Delete temporary test user 'tester@example.com' if present
  await prisma.user.deleteMany({
    where: {
      email: { in: ["tester@example.com", "test-verifier@secondspark.dev", "owner-test@secondspark.dev", "contributor-test@secondspark.dev"] },
    },
  });

  console.log("✅ Reset user gamification scores to zero and removed temporary test users.");
  console.log("\n🎉 Database is now 100% clean and free of mock/dummy data!\n");
}

cleanMockData()
  .catch((e) => {
    console.error("Clean error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
