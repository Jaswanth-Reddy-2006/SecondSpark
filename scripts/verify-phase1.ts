import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Starting Phase 1 Schema & Visibility Verification...");

  // 1. Verify a user exists to associate with test records
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: "test-verifier@secondspark.dev",
        name: "Phase 1 Verifier",
      },
    });
    console.log("Created temporary verifier user:", user.id);
  } else {
    console.log("Using existing user:", user.email, `(${user.id})`);
  }

  // 2. Create a test Public Project
  const publicProject = await prisma.project.create({
    data: {
      userId: user.id,
      name: "Test-Public-Engine",
      slug: `test-public-engine-${Date.now().toString(36)}`,
      tagline: "High performance streaming compute engine",
      description: "Public test project designed for community discovery verification.",
      originalProblem: "Lack of lightweight streaming runtimes.",
      intendedUsers: "Systems engineers",
      techTags: JSON.stringify(["Rust", "WebAssembly"]),
      status: "Abandoned",
      lastActiveDate: "2024-04-01",
      completionRate: 80,
      abandonedReason: "Maintainer moved to new venture.",
      completedFeatures: JSON.stringify(["Core stream parser"]),
      unfinishedFeatures: JSON.stringify(["HTTP API"]),
      isPublic: true,
      collaborationStatus: "open_to_collaborators",
      skillsNeeded: JSON.stringify(["Rust", "Tokio"]),
      memberships: {
        create: [
          {
            userId: user.id,
            role: "OWNER",
          },
        ],
      },
    },
    include: {
      memberships: true,
    },
  });
  console.log("✅ Created public project:", publicProject.id, "isPublic:", publicProject.isPublic);
  console.log("✅ Verified owner membership created:", publicProject.memberships.length, "role:", publicProject.memberships[0]?.role);

  // 3. Create a test Private Project
  const privateProject = await prisma.project.create({
    data: {
      userId: user.id,
      name: "Test-Private-Vault-Secrets",
      slug: `test-private-vault-${Date.now().toString(36)}`,
      tagline: "Proprietary internal secret manager",
      description: "Private project that must never appear in community feeds.",
      originalProblem: "Confidential credentials",
      intendedUsers: "Internal",
      techTags: JSON.stringify(["Go", "Vault"]),
      status: "Abandoned",
      lastActiveDate: "2024-01-01",
      completionRate: 50,
      abandonedReason: "Internal initiative closed.",
      completedFeatures: JSON.stringify(["Key storage"]),
      unfinishedFeatures: JSON.stringify(["Audit log"]),
      isPublic: false,
      collaborationStatus: "closed",
      skillsNeeded: JSON.stringify([]),
    },
  });
  console.log("✅ Created private project:", privateProject.id, "isPublic:", privateProject.isPublic);

  // 4. Test Public Graveyard Boundary
  const publicFeed = await prisma.project.findMany({
    where: { isPublic: true },
    select: { id: true, name: true, isPublic: true },
  });

  const containsPublic = publicFeed.some((p) => p.id === publicProject.id);
  const containsPrivate = publicFeed.some((p) => p.id === privateProject.id);

  console.log(`✅ Public feed query found ${publicFeed.length} projects`);
  console.log("✅ Public project in public feed?", containsPublic ? "YES (Correct)" : "NO (Failed!)");
  console.log("✅ Private project in public feed?", containsPrivate ? "YES (LEAK!)" : "NO (Protected!)");

  if (!containsPublic || containsPrivate) {
    throw new Error("Visibility boundary check failed!");
  }

  // 5. Clean up test records
  await prisma.project.deleteMany({
    where: {
      id: { in: [publicProject.id, privateProject.id] },
    },
  });
  console.log("✅ Cleaned up test records cleanly.");

  console.log("\n🎉 Phase 1 Database Schema & Visibility Boundary verification SUCCESSFUL!\n");
}

main()
  .catch((e) => {
    console.error("Verification error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
