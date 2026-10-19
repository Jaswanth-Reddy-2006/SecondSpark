/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Comprehensive Automated Verification Script for SecondSpark Security & Auth
 * Tests:
 * 1. Server-side route protection (/dashboard redirects unauthenticated users)
 * 2. Server API authorization boundaries (/api/projects returns 401 without auth)
 * 3. Secure registration with Bcrypt hashing (verifying password hash in DB, no plaintext)
 * 4. Duplicate and validation prevention (409 Conflict, 400 Bad Request)
 * 5. Full Auth.js Credentials session flow (CSRF -> sign-in -> session cookie)
 * 6. User isolation (Tenant A cannot view, modify, or delete Tenant B's projects)
 * 7. Browser project migration endpoint (/api/projects/migrate)
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const BASE_URL = "http://localhost:3000";

function log(section, msg, status = "INFO") {
  const symbol = status === "PASS" ? "✅" : status === "FAIL" ? "❌" : "ℹ️";
  console.log(`${symbol} [${section}] ${msg}`);
}

async function run() {
  console.log("\n========================================================");
  console.log("   SecondSpark — Security & Auth Verification Suite     ");
  console.log("========================================================\n");

  let failures = 0;

  try {
    // ---------------------------------------------------------
    // TEST 1: Protected Routes - Unauthenticated Dashboard Check
    // ---------------------------------------------------------
    log("ROUTE_GUARD", "Testing unauthenticated request to /dashboard...");
    const dashRes = await fetch(`${BASE_URL}/dashboard`, {
      redirect: "manual",
    });

    if (dashRes.status === 307 || dashRes.status === 302 || dashRes.status === 308) {
      const location = dashRes.headers.get("location");
      if (location && location.includes("/login")) {
        log("ROUTE_GUARD", `Redirected with HTTP ${dashRes.status} to: ${location}`, "PASS");
      } else {
        log("ROUTE_GUARD", `Redirect status ${dashRes.status} but unexpected location: ${location}`, "FAIL");
        failures++;
      }
    } else {
      // In Next.js Partial Prerendering, check if body streams redirect or status
      const text = await dashRes.text();
      if (text.includes("/login") || text.includes("redirect")) {
        log("ROUTE_GUARD", "Server-streamed authentication redirect verified", "PASS");
      } else {
        log("ROUTE_GUARD", `Unexpected HTTP status ${dashRes.status} on unauthenticated /dashboard`, "FAIL");
        failures++;
      }
    }

    // ---------------------------------------------------------
    // TEST 2: Data Isolation - Unauthenticated API Access (401)
    // ---------------------------------------------------------
    log("API_SECURITY", "Testing unauthenticated access to /api/projects...");
    const apiGet = await fetch(`${BASE_URL}/api/projects`);
    if (apiGet.status === 401) {
      log("API_SECURITY", "GET /api/projects returned 401 Unauthorized", "PASS");
    } else {
      log("API_SECURITY", `GET /api/projects expected 401 but got ${apiGet.status}`, "FAIL");
      failures++;
    }

    const apiPost = await fetch(`${BASE_URL}/api/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Hacker Project" }),
    });
    if (apiPost.status === 401) {
      log("API_SECURITY", "POST /api/projects returned 401 Unauthorized", "PASS");
    } else {
      log("API_SECURITY", `POST /api/projects expected 401 but got ${apiPost.status}`, "FAIL");
      failures++;
    }

    const apiMigrate = await fetch(`${BASE_URL}/api/projects/migrate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projects: [] }),
    });
    if (apiMigrate.status === 401) {
      log("API_SECURITY", "POST /api/projects/migrate returned 401 Unauthorized", "PASS");
    } else {
      log("API_SECURITY", `POST /api/projects/migrate expected 401 but got ${apiMigrate.status}`, "FAIL");
      failures++;
    }

    // ---------------------------------------------------------
    // TEST 3: User Registration & Bcrypt Password Hashing
    // ---------------------------------------------------------
    const testEmail1 = `alice_${Date.now()}@example.com`;
    const testPassword1 = "SuperSecret123!";

    log("REGISTRATION", `Registering user ${testEmail1}...`);
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Alice Engineer",
        email: testEmail1,
        password: testPassword1,
      }),
    });

    if (regRes.status === 201) {
      log("REGISTRATION", "Registration succeeded with HTTP 201 Created", "PASS");
    } else {
      const err = await regRes.text();
      log("REGISTRATION", `Registration failed with status ${regRes.status}: ${err}`, "FAIL");
      failures++;
    }

    // Inspect database record directly to verify Bcrypt hash
    const dbUser1 = await prisma.user.findUnique({
      where: { email: testEmail1 },
    });

    if (dbUser1 && dbUser1.passwordHash) {
      const isBcrypt = dbUser1.passwordHash.startsWith("$2a$") || dbUser1.passwordHash.startsWith("$2b$");
      const isPlaintext = dbUser1.passwordHash === testPassword1;

      if (isBcrypt && !isPlaintext) {
        log("CREDENTIAL_SECURITY", `User password verified securely hashed: ${dbUser1.passwordHash.slice(0, 15)}... (no plaintext)`, "PASS");
      } else {
        log("CREDENTIAL_SECURITY", "User password is NOT properly hashed with Bcrypt!", "FAIL");
        failures++;
      }
    } else {
      log("CREDENTIAL_SECURITY", "Failed to retrieve user from database", "FAIL");
      failures++;
    }

    // Duplicate Registration test
    const dupRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Alice Imposter",
        email: testEmail1,
        password: testPassword1,
      }),
    });
    if (dupRes.status === 409) {
      log("REGISTRATION", "Duplicate registration rejected with HTTP 409 Conflict", "PASS");
    } else {
      log("REGISTRATION", `Duplicate registration expected 409 but got ${dupRes.status}`, "FAIL");
      failures++;
    }

    // Weak password / bad input validation
    const badRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Bad Input",
        email: "not-an-email",
        password: "short",
      }),
    });
    if (badRes.status === 400) {
      log("REGISTRATION", "Invalid input correctly rejected with HTTP 400 Bad Request", "PASS");
    } else {
      log("REGISTRATION", `Invalid input expected 400 but got ${badRes.status}`, "FAIL");
      failures++;
    }

    // ---------------------------------------------------------
    // TEST 4: NextAuth Sign-In & Session Flow
    // ---------------------------------------------------------
    log("AUTH_SESSION", "Initiating Auth.js Credentials login for Alice...");
    
    // Get CSRF Token
    const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
    const csrfData = await csrfRes.json();
    const csrfRawCookies = csrfRes.headers.getSetCookie ? csrfRes.headers.getSetCookie() : [csrfRes.headers.get("set-cookie") || ""];
    const csrfCookieHeader = csrfRawCookies.map((c) => c.split(";")[0]).join("; ");
    const csrfToken = csrfData.csrfToken;

    // Call credentials callback
    const signinRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: csrfCookieHeader,
      },
      body: new URLSearchParams({
        csrfToken: csrfToken,
        email: testEmail1,
        password: testPassword1,
      }),
      redirect: "manual",
    });

    const setCookies = signinRes.headers.getSetCookie ? signinRes.headers.getSetCookie() : [signinRes.headers.get("set-cookie") || ""];
    const sessionCookieHeader = setCookies.map((c) => c.split(";")[0]).join("; ");

    if (sessionCookieHeader.includes("authjs.session-token")) {
      log("AUTH_SESSION", "Auth.js session cookie issued successfully", "PASS");
    } else {
      log("AUTH_SESSION", "Failed to obtain authjs.session-token cookie on sign-in", "FAIL");
      failures++;
    }

    // ---------------------------------------------------------
    // TEST 5: Authenticated Project Operations (User 1)
    // ---------------------------------------------------------
    log("USER_DATA", "Testing authenticated project creation for Alice...");
    const createProjectRes = await fetch(`${BASE_URL}/api/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookieHeader,
      },
      body: JSON.stringify({
        name: "Alice Microservices Vault",
        tagline: "Autonomous orchestrator",
        description: "An abandoned experimental orchestrator for edge containers.",
        techTags: ["Go", "Docker", "gRPC"],
        status: "Abandoned",
        worthRevisiting: true,
        completionRate: 65,
        abandonedReason: "Market shifted towards managed serverless runtimes.",
      }),
    });

    let aliceProjectId = null;
    if (createProjectRes.status === 201) {
      const createdData = await createProjectRes.json();
      aliceProjectId = createdData.project.id;
      log("USER_DATA", `Project created successfully with ID: ${aliceProjectId}`, "PASS");
    } else {
      log("USER_DATA", `Failed to create project: HTTP ${createProjectRes.status}`, "FAIL");
      failures++;
    }

    // Verify GET /api/projects returns Alice's project
    const aliceProjectsRes = await fetch(`${BASE_URL}/api/projects`, {
      headers: { Cookie: sessionCookieHeader },
    });
    const aliceProjectsData = await aliceProjectsRes.json();
    if (aliceProjectsRes.ok && Array.isArray(aliceProjectsData.projects) && aliceProjectsData.projects.length >= 1) {
      log("USER_DATA", `Alice retrieved ${aliceProjectsData.projects.length} project(s) from database`, "PASS");
    } else {
      log("USER_DATA", "Failed to retrieve Alice's projects", "FAIL");
      failures++;
    }

    // ---------------------------------------------------------
    // TEST 6: Multi-Tenant Authorization & Boundary Enforcement
    // ---------------------------------------------------------
    log("MULTI_TENANCY", "Registering second independent user (Bob)...");
    const testEmail2 = `bob_${Date.now()}@example.com`;
    const testPassword2 = "BobPassword789!";

    await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Bob Developer",
        email: testEmail2,
        password: testPassword2,
      }),
    });

    // Authenticate as Bob
    const bobCsrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
    const bobCsrfData = await bobCsrfRes.json();
    const bobRawCookies = bobCsrfRes.headers.getSetCookie ? bobCsrfRes.headers.getSetCookie() : [bobCsrfRes.headers.get("set-cookie") || ""];
    const bobCsrfCookieHeader = bobRawCookies.map((c) => c.split(";")[0]).join("; ");

    const bobSigninRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: bobCsrfCookieHeader,
      },
      body: new URLSearchParams({
        csrfToken: bobCsrfData.csrfToken,
        email: testEmail2,
        password: testPassword2,
      }),
      redirect: "manual",
    });

    const bobSetCookies = bobSigninRes.headers.getSetCookie ? bobSigninRes.headers.getSetCookie() : [bobSigninRes.headers.get("set-cookie") || ""];
    const bobSessionCookie = bobSetCookies.map((c) => c.split(";")[0]).join("; ");

    // Verify Bob's project list does NOT contain Alice's project
    const bobProjectsRes = await fetch(`${BASE_URL}/api/projects`, {
      headers: { Cookie: bobSessionCookie },
    });
    const bobProjectsData = await bobProjectsRes.json();
    const seesAliceProject = bobProjectsData.projects?.some((p) => p.id === aliceProjectId);

    if (!seesAliceProject) {
      log("MULTI_TENANCY", "Bob CANNOT see Alice's private projects (tenant isolation intact)", "PASS");
    } else {
      log("MULTI_TENANCY", "SECURITY BREACH: Bob can view Alice's projects!", "FAIL");
      failures++;
    }

    // Bob attempts to modify Alice's project (Must return 403 Forbidden)
    log("MULTI_TENANCY", "Testing unauthorized mutation (Bob attempts to modify Alice's project)...");
    const unauthorizedPutRes = await fetch(`${BASE_URL}/api/projects/${aliceProjectId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: bobSessionCookie,
      },
      body: JSON.stringify({ name: "Bob Hijacked Alice's Project" }),
    });

    if (unauthorizedPutRes.status === 403) {
      log("MULTI_TENANCY", "Unauthorized PUT returned HTTP 403 Forbidden", "PASS");
    } else {
      log("MULTI_TENANCY", `Unauthorized PUT expected 403 but got ${unauthorizedPutRes.status}`, "FAIL");
      failures++;
    }

    // Bob attempts to delete Alice's project (Must return 403 Forbidden)
    log("MULTI_TENANCY", "Testing unauthorized deletion (Bob attempts to delete Alice's project)...");
    const unauthorizedDeleteRes = await fetch(`${BASE_URL}/api/projects/${aliceProjectId}`, {
      method: "DELETE",
      headers: { Cookie: bobSessionCookie },
    });

    if (unauthorizedDeleteRes.status === 403) {
      log("MULTI_TENANCY", "Unauthorized DELETE returned HTTP 403 Forbidden", "PASS");
    } else {
      log("MULTI_TENANCY", `Unauthorized DELETE expected 403 but got ${unauthorizedDeleteRes.status}`, "FAIL");
      failures++;
    }

    // ---------------------------------------------------------
    // TEST 7: Clean Project Deletion (Owner)
    // ---------------------------------------------------------
    log("DATA_LIFECYCLE", "Alice deletes her own project...");
    const aliceDeleteRes = await fetch(`${BASE_URL}/api/projects/${aliceProjectId}`, {
      method: "DELETE",
      headers: { Cookie: sessionCookieHeader },
    });

    if (aliceDeleteRes.status === 200) {
      log("DATA_LIFECYCLE", "Owner project deletion succeeded with HTTP 200", "PASS");
    } else {
      log("DATA_LIFECYCLE", `Owner project deletion failed with status ${aliceDeleteRes.status}`, "FAIL");
      failures++;
    }

    // Clean up test users
    await prisma.projectTimelineEvent.deleteMany({
      where: { project: { userId: { in: [dbUser1.id] } } },
    });
    await prisma.project.deleteMany({
      where: { userId: { in: [dbUser1.id] } },
    });
    await prisma.user.deleteMany({
      where: { email: { in: [testEmail1, testEmail2] } },
    });
    log("CLEANUP", "Test artifacts removed from SQLite database", "PASS");

  } catch (err) {
    console.error("Test execution exception:", err);
    failures++;
  } finally {
    await prisma.$disconnect();
  }

  console.log("\n========================================================");
  if (failures === 0) {
    console.log("   🎉 ALL VERIFICATION TESTS PASSED SUCCESSFULLY!       ");
  } else {
    console.log(`   ❌ ${failures} TEST(S) FAILED!                       `);
  }
  console.log("========================================================\n");

  process.exit(failures === 0 ? 0 : 1);
}

run();
