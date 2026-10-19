import { Project, ProjectAutopsy, OutdatedDependency, ModernizationStep, EffortSize, RotSeverity } from "@/types/project";

/**
 * Diagnostic Autopsy Engine for SecondSpark
 * Analyzes repository metadata, tech stack, age, and blockers to produce
 * a comprehensive diagnostic report, Rot Index, and modernization blueprint.
 */

export function generateProjectAutopsy(project: Project): ProjectAutopsy {
  const now = new Date();
  const lastActive = project.lastActiveDate ? new Date(project.lastActiveDate) : new Date(project.lastUpdated || "2024-01-01");
  const monthsInactive = Math.max(0, Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24 * 30)));

  const techLower = (project.techTags || []).map((t) => t.toLowerCase());
  const descriptionLower = (project.description + " " + project.mainBlockers + " " + project.lessonsLearned).toLowerCase();

  // 1. Calculate Rot Index (0 to 100)
  let rotScore = 15; // base score

  // Age factor: +3 points per month inactive, capped at 45
  rotScore += Math.min(45, monthsInactive * 3);

  // Framework factor
  const hasLegacyReact = techLower.some((t) => t.includes("react 16") || t.includes("react 17"));
  const hasWebpack = techLower.some((t) => t.includes("webpack")) || descriptionLower.includes("webpack");
  const hasMoment = descriptionLower.includes("moment") || techLower.some((t) => t.includes("moment"));
  const hasRedux = techLower.some((t) => t.includes("redux") || t.includes("redux-saga"));
  const hasVue2 = techLower.some((t) => t.includes("vue 2") || t.includes("vue2"));

  if (hasLegacyReact) rotScore += 15;
  if (hasWebpack) rotScore += 10;
  if (hasMoment) rotScore += 10;
  if (hasRedux) rotScore += 10;
  if (hasVue2) rotScore += 20;

  // Completion rate offset: higher completion reduces rot difficulty
  const completionOffset = Math.floor((100 - (project.completionRate || 50)) * 0.2);
  rotScore += completionOffset;

  const rotIndex = Math.min(98, Math.max(12, Math.round(rotScore)));

  // Severity
  let rotSeverity: RotSeverity = "healthy";
  if (rotIndex > 65) rotSeverity = "severe";
  else if (rotIndex > 35) rotSeverity = "mild";

  // 2. Effort Sizing (Weekend Hack, Sprint, Archaeological Dig)
  let effortSize: EffortSize = "sprint";
  let effortDescription = "Requires focused framework upgrades and dependency reconciliation (1–2 weeks).";

  if (rotIndex < 40 && (project.completionRate || 0) >= 75) {
    effortSize = "weekend_hack";
    effortDescription = "High maturity and minimal dependency rot. Can be revived and stabilized in 1–2 days.";
  } else if (rotIndex > 70 || (project.completionRate || 0) < 45) {
    effortSize = "archaeological_dig";
    effortDescription = "Significant architectural debt, deprecated runtimes, and incomplete features. Expect a multi-week re-architecture.";
  }

  // 3. Outdated Dependencies Identification
  const outdatedDependencies: OutdatedDependency[] = [];

  // Inspect React / Next.js
  if (techLower.some((t) => t.includes("next") || t.includes("react"))) {
    if (monthsInactive > 12 || hasLegacyReact) {
      outdatedDependencies.push({
        name: "react",
        currentVersion: hasLegacyReact ? "17.0.2" : "18.2.0",
        latestVersion: "19.0.0",
        diff: "major",
        recommendation: "Upgrade to React 19 to leverage Server Components and improved concurrent rendering.",
      });
    }
    if (techLower.some((t) => t.includes("next"))) {
      outdatedDependencies.push({
        name: "next",
        currentVersion: monthsInactive > 24 ? "12.3.4" : monthsInactive > 12 ? "13.5.6" : "14.2.15",
        latestVersion: "16.4.2",
        diff: "major",
        recommendation: "Migrate legacy Pages Router or Next 13 App Router conventions to modern Next.js Turbopack App Router.",
      });
    }
  }

  // Inspect Node runtime
  const nodeCurrent = monthsInactive > 36 ? "14.19.0" : monthsInactive > 18 ? "18.16.0" : "20.11.0";
  outdatedDependencies.push({
    name: "node (runtime)",
    currentVersion: nodeCurrent,
    latestVersion: "22.12.0 LTS",
    diff: "major",
    recommendation: "Update local engines and CI matrix to Node 22 Active LTS. Older Node runtimes have reached End-of-Life.",
    cveAdvisory: monthsInactive > 24 ? "Node 14/16 contain critical OpenSSL and HTTP smuggling CVEs." : undefined,
  });

  // Check utility packages
  if (hasMoment || monthsInactive > 12) {
    outdatedDependencies.push({
      name: "moment",
      currentVersion: "2.29.4",
      latestVersion: "Archived",
      diff: "major",
      isDeprecated: true,
      recommendation: "Moment.js is in maintenance mode and not tree-shakeable. Replace with date-fns or native Temporal API.",
    });
  }

  if (descriptionLower.includes("axios") || monthsInactive > 18) {
    outdatedDependencies.push({
      name: "axios",
      currentVersion: "0.27.2",
      latestVersion: "1.7.9",
      diff: "major",
      recommendation: "Upgrade to Axios 1.x or replace with native Web standard fetch.",
    });
  }

  if (techLower.some((t) => t.includes("tailwind") || t.includes("css"))) {
    outdatedDependencies.push({
      name: "tailwindcss",
      currentVersion: "3.4.1",
      latestVersion: "4.0.0",
      diff: "major",
      recommendation: "Evaluate Tailwind CSS v4 CSS-first engine for faster compilation with zero config file.",
    });
  }

  // 4. Modernization Blueprint
  const modernizationSteps: ModernizationStep[] = [
    {
      title: "Pin Modern Runtime & Containerize",
      category: "framework",
      impact: "high",
      description: "Lock Node.js 22 LTS in `.nvmrc` or `package.json` engines to prevent engine mismatch errors during bootstrap.",
    },
    {
      title: "Dependency Reconciliation & Audit",
      category: "security",
      impact: "high",
      description: "Run `npm audit fix --force` or regenerate lockfile to resolve transitivity vulnerabilities in stale sub-dependencies.",
    },
    {
      title: "Generate Missing Environment Manifest",
      category: "architecture",
      impact: "medium",
      description: "Audit all `process.env` references and establish a strict `.env.example` schema with validation (e.g. Zod or T3 Env).",
    },
    {
      title: "Isolate Minimum Viable Revival (MVR)",
      category: "architecture",
      impact: "high",
      description: `Temporarily deactivate unfinished secondary features (${(project.unfinishedFeatures || []).slice(0, 2).join(", ") || "stale experimental branches"}) and focus on stabilizing the primary value proposition.`,
    },
    {
      title: "Replace Deprecated Libraries",
      category: "dependency",
      impact: "medium",
      description: "Swap legacy unmaintained utility packages for modern tree-shakeable alternatives.",
      replacement: hasMoment ? "Replace Moment.js with date-fns" : "Adopt standard Web Fetch APIs",
    },
  ];

  // 5. Inferred Environment Variables
  const detectedEnvVars: string[] = ["DATABASE_URL", "NEXTAUTH_URL", "AUTH_SECRET"];
  if (techLower.some((t) => t.includes("github") || t.includes("oauth"))) {
    detectedEnvVars.push("GITHUB_ID", "GITHUB_SECRET");
  }
  if (descriptionLower.includes("stripe") || techLower.some((t) => t.includes("stripe"))) {
    detectedEnvVars.push("STRIPE_SECRET_KEY", "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
  }
  if (descriptionLower.includes("openai") || descriptionLower.includes("ai") || techLower.some((t) => t.includes("ai"))) {
    detectedEnvVars.push("OPENAI_API_KEY");
  }
  if (techLower.some((t) => t.includes("neon") || t.includes("postgres"))) {
    detectedEnvVars.push("DATABASE_URL_UNPOOLED");
  }

  // 6. Clinical Health Summary
  const healthSummary =
    rotSeverity === "healthy"
      ? `This repository is in remarkably healthy condition with minimal bit-rot (${rotIndex}/100). The architecture remains current, and revival can likely be accomplished in a weekend hack sprint.`
      : rotSeverity === "mild"
      ? `This repository exhibits moderate dependency stagnation (${rotIndex}/100) after ${monthsInactive} months of dormancy. Upgrading the runtime, replacing deprecated utility libraries, and reconciling breaking framework changes will restore it to full production health.`
      : `This repository exhibits severe archaeological bit-rot (${rotIndex}/100) with ${monthsInactive} months of inactivity. Core frameworks, build tools, and dependencies are significantly out of date. A phased revitalization strategy is recommended.`;

  return {
    rotIndex,
    rotSeverity,
    effortSize,
    effortDescription,
    runtimeVersion: nodeCurrent,
    targetRuntimeVersion: "22.12.0 LTS",
    outdatedDependencies,
    modernizationSteps,
    detectedEnvVars,
    healthSummary,
    analyzedAt: new Date().toISOString(),
  };
}
