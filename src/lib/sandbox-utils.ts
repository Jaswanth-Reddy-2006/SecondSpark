import { Project } from "@/types/project";

/**
 * Extracts :owner/:repo from standard GitHub URLs
 */
export function extractGitHubRepoSlug(repoUrl?: string): string | null {
  if (!repoUrl) return null;
  const match = repoUrl.match(/github\.com\/([^/]+\/[^/]+?)(?:\.git|\/)?$/i);
  return match ? match[1] : null;
}

/**
 * Generates direct one-click StackBlitz WebContainer URL
 */
export function getStackBlitzUrl(repoUrl?: string): string | null {
  const slug = extractGitHubRepoSlug(repoUrl);
  if (!slug) return null;
  return `https://stackblitz.com/github/${slug}`;
}

/**
 * Generates direct one-click GitHub Codespaces URL
 */
export function getCodespacesUrl(repoUrl?: string): string | null {
  const slug = extractGitHubRepoSlug(repoUrl);
  if (!slug) return null;
  return `https://github.com/codespaces/new?hide_repo_select=true&ref=main&repo=${slug}`;
}

/**
 * Generates a tailored devcontainer.json configuration based on project tech stack
 */
export function generateDevcontainerJson(project: Project): string {
  const techLower = (project.techTags || []).map((t) => t.toLowerCase());
  const needsNode = techLower.some((t) => t.includes("node") || t.includes("typescript") || t.includes("react") || t.includes("next"));
  const needsRust = techLower.some((t) => t.includes("rust") || t.includes("wasm"));
  const needsPython = techLower.some((t) => t.includes("python") || t.includes("django") || t.includes("fastapi"));

  const extensions = [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
  ];

  if (techLower.some((t) => t.includes("prisma"))) extensions.push("Prisma.prisma");
  if (techLower.some((t) => t.includes("tailwind"))) extensions.push("bradlc.vscode-tailwindcss");
  if (needsRust) extensions.push("rust-lang.rust-analyzer");
  if (needsPython) extensions.push("ms-python.python");

  let baseImage = "mcr.microsoft.com/devcontainers/typescript-node:1-22-bookworm";
  if (needsRust && !needsNode) {
    baseImage = "mcr.microsoft.com/devcontainers/rust:1-1-bookworm";
  } else if (needsPython && !needsNode) {
    baseImage = "mcr.microsoft.com/devcontainers/python:1-3.12-bookworm";
  }

  const config = {
    name: `${project.name} (SecondSpark Revival)`,
    image: baseImage,
    customizations: {
      vscode: {
        extensions,
        settings: {
          "editor.formatOnSave": true,
          "editor.defaultFormatter": "esbenp.prettier-vscode",
        },
      },
    },
    forwardPorts: [3000, 5432],
    postCreateCommand: needsNode ? "npm install" : "echo 'Ready to revive'",
  };

  return JSON.stringify(config, null, 2);
}

/**
 * Generates a ready-to-copy .env.example file
 */
export function generateEnvExample(project: Project, detectedVars?: string[]): string {
  const vars = detectedVars && detectedVars.length > 0
    ? detectedVars
    : ["DATABASE_URL", "NEXTAUTH_URL", "AUTH_SECRET", "NEXT_PUBLIC_APP_URL"];

  const lines = [
    `# Environment Variables for ${project.name}`,
    `# Generated via SecondSpark Revival Engine on ${new Date().toISOString().split("T")[0]}`,
    "",
  ];

  for (const v of vars) {
    if (v === "DATABASE_URL") {
      lines.push(`${v}="postgresql://username:password@localhost:5432/${project.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}?sslmode=require"`);
    } else if (v === "DATABASE_URL_UNPOOLED") {
      lines.push(`${v}="postgresql://username:password@localhost:5432/${project.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}?sslmode=require"`);
    } else if (v === "NEXTAUTH_URL") {
      lines.push(`${v}="http://localhost:3000"`);
    } else if (v === "AUTH_SECRET") {
      lines.push(`${v}="your_secure_random_32_character_secret_here"`);
    } else if (v === "GITHUB_ID") {
      lines.push(`${v}="your_github_oauth_client_id"`);
    } else if (v === "GITHUB_SECRET") {
      lines.push(`${v}="your_github_oauth_client_secret"`);
    } else if (v.includes("STRIPE")) {
      lines.push(`${v}="sk_test_..."`);
    } else if (v.includes("OPENAI")) {
      lines.push(`${v}="sk-..."`);
    } else {
      lines.push(`${v}="your_${v.toLowerCase()}_value"`);
    }
  }

  return lines.join("\n");
}
