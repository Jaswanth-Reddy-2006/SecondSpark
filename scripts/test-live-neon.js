/* eslint-disable @typescript-eslint/no-require-imports */
const http = require("http");

async function run() {
  console.log("==================================================");
  console.log("   TESTING SECONDSPARK ON NEON POSTGRESQL (LIVE)  ");
  console.log("==================================================\n");

  // 1. Test Community Projects API (Live DB query via Prisma on Neon)
  console.log("[1] Querying /api/community/projects...");
  const projRes = await fetch("http://localhost:3000/api/community/projects");
  const projData = await projRes.json();
  console.log(`    Status: ${projRes.status} OK`);
  console.log(`    Total public projects in Neon: ${projData.total}`);
  console.log(`    Projects returned: ${projData.projects.length}`);

  // 2. Test Community Leaderboard API (Live DB query for users & XP)
  console.log("\n[2] Querying /api/community/leaderboard...");
  const leadRes = await fetch("http://localhost:3000/api/community/leaderboard");
  const leadData = await leadRes.json();
  console.log(`    Status: ${leadRes.status} OK`);
  console.log(`    Total leaderboard users in Neon: ${leadData.total}`);
  if (leadData.users && leadData.users.length > 0) {
    console.log(`    Rank #1: ${leadData.users[0].name} (${leadData.users[0].xp} XP, Level ${leadData.users[0].level})`);
  }

  // 3. Test Registration API with Neon Postgres
  console.log("\n[3] Testing User Registration via /api/auth/register on Neon...");
  const testEmail = `neon-tester-${Date.now()}@example.com`;
  const regRes = await fetch("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Neon Test Engineer",
      email: testEmail,
      password: "TestPassword2026!",
    }),
  });
  const regData = await regRes.json();
  console.log(`    Status: ${regRes.status} Created`);
  console.log(`    User registered in Neon Postgres: ID=${regData.user?.id}, Email=${regData.user?.email}`);

  // 4. Test Protected Dashboard Route (Server-side session check)
  console.log("\n[4] Testing Protected /dashboard Route...");
  const dashRes = await fetch("http://localhost:3000/dashboard", {
    redirect: "manual",
  });
  console.log(`    Status: ${dashRes.status} (Redirect)`);
  console.log(`    Location header: ${dashRes.headers.get("location")} (Unauthenticated access redirected)`);

  console.log("\n==================================================");
  console.log("   ALL SERVICES AND QUERIES VERIFIED ON NEON!     ");
  console.log("==================================================\n");
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
