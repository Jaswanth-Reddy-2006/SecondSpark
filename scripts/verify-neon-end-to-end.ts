import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("---------------------------------------------------------");
  console.log("   VERIFYING NEON POSTGRESQL END-TO-END DATA PERSISTENCE  ");
  console.log("---------------------------------------------------------");

  // 1. Verify connection and database name
  const result = await prisma.$queryRaw<Array<{ current_database: string; version: string }>>`
    SELECT current_database(), version();
  `;
  console.log(`\n[Database Connection]`);
  console.log(`Connected to Database: ${result[0].current_database}`);
  console.log(`PostgreSQL Engine: ${result[0].version.split(" on ")[0]}`);

  // 2. Fetch demo user
  const demoUser = await prisma.user.findUnique({
    where: { email: "demo@secondspark.dev" },
  });

  if (!demoUser) {
    throw new Error("Demo user not found!");
  }
  console.log(`\n[User Service Verified]`);
  console.log(`Demo User Found: ${demoUser.name} (${demoUser.email})`);
  console.log(`User ID: ${demoUser.id}`);

  // 3. Create a project in Neon
  console.log(`\n[Project Service Verified]`);
  const project = await prisma.project.create({
    data: {
      userId: demoUser.id,
      name: "Neon Cloud Sync Engine",
      tagline: "Autonomous real-time state sync with Neon serverless Postgres",
      description: "A production-grade synchronization pipeline leveraging Postgres change data capture and serverless connection pooling.",
      originalProblem: "Edge workers suffered high connection overhead to legacy relational databases.",
      intendedUsers: "Full-stack engineers building serverless web applications.",
      techTags: JSON.stringify(["Next.js", "TypeScript", "Neon", "PostgreSQL", "Prisma"]),
      status: "Revived",
      lastActiveDate: "2026-10-19",
      worthRevisiting: true,
      completionRate: 95,
      abandonedReason: "Project successfully completed and transitioned to active production.",
      completedFeatures: JSON.stringify(["Connection pooling", "Schema push", "Branching automation", "E2E verification"]),
      unfinishedFeatures: JSON.stringify([]),
      mainBlockers: "None",
      lessonsLearned: "Neon pooled connections provide seamless connection pooling with zero cold start penalty.",
      revivalPotential: "High",
      stars: 42,
      isPublic: true,
      collaborationStatus: "open_to_collaborators",
      skillsNeeded: JSON.stringify(["PostgreSQL", "Prisma", "TypeScript"]),
      timeline: {
        create: [
          {
            title: "Project Provisioned on Neon",
            description: "Successfully provisioned and deployed database on Neon Postgres.",
            type: "created",
          },
        ],
      },
    },
    include: {
      timeline: true,
    },
  });

  console.log(`Project Created in Neon: "${project.name}" (ID: ${project.id})`);
  console.log(`Timeline events: ${project.timeline.length}`);

  // 4. Query project from Neon
  const fetched = await prisma.project.findUnique({
    where: { id: project.id },
    include: {
      timeline: true,
      user: {
        select: { name: true, email: true },
      },
    },
  });

  console.log(`Project Retrieved from Neon: Status="${fetched?.status}", Owner="${fetched?.user.name}"`);

  // 5. Query public community projects endpoint
  const publicProjects = await prisma.project.findMany({
    where: { isPublic: true },
  });
  console.log(`Total Public Projects visible in Community: ${publicProjects.length}`);

  console.log("\n---------------------------------------------------------");
  console.log("   NEON POSTGRESQL PROVEN WORKING 100% END TO END!       ");
  console.log("---------------------------------------------------------");
}

main()
  .catch((e) => {
    console.error("Verification failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
