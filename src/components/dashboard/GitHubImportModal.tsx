"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  GitBranch,
  Search,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Lock,
  Globe,
  Info,
} from "lucide-react";

// Official GitHub Mark for OAuth tab
function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
    </svg>
  );
}

export interface ImportedRepoData {
  name: string;
  tagline: string;
  description: string;
  techTags: string[];
  repoUrl: string;
  lastActiveDate: string;
  stars?: number;
}

interface GitHubImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: ImportedRepoData) => void;
}

export function GitHubImportModal({
  isOpen,
  onClose,
  onImport,
}: GitHubImportModalProps) {
  const [activeTab, setActiveTab] = useState<"public" | "oauth">("public");
  const [repoInput, setRepoInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<ImportedRepoData | null>(null);

  const parseRepoSlug = (input: string): { owner: string; repo: string } | null => {
    const cleaned = input.trim().replace(/^https?:\/\/github\.com\//, "").replace(/\.git$/, "");
    const parts = cleaned.split("/").filter(Boolean);
    if (parts.length >= 2) {
      return { owner: parts[0], repo: parts[1] };
    }
    return null;
  };

  const handleFetchPublicRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPreviewData(null);

    const parsed = parseRepoSlug(repoInput);
    if (!parsed) {
      setError("Please enter a valid GitHub repository URL or owner/repo path (e.g. spark-labs/docupulse).");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`, {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (res.status === 404) {
        setError(
          `Repository "${parsed.owner}/${parsed.repo}" was not found. If this is a private repository, connect GitHub via OAuth.`
        );
        setIsLoading(false);
        return;
      }

      if (!res.ok) {
        if (res.status === 403) {
          setError("GitHub API rate limit exceeded. Connect GitHub OAuth or configure GITHUB_PERSONAL_ACCESS_TOKEN in .env.local.");
        } else {
          setError(`GitHub API error (${res.status}): ${res.statusText}`);
        }
        setIsLoading(false);
        return;
      }

      const json = await res.json();

      const lastDate = (json.pushed_at || json.updated_at || "").split("T")[0] || "2024-01-01";
      const tags: string[] = [];
      if (json.language) tags.push(json.language);
      if (Array.isArray(json.topics)) {
        json.topics.slice(0, 4).forEach((t: string) => {
          if (!tags.includes(t)) tags.push(t);
        });
      }
      if (tags.length === 0) tags.push("TypeScript");

      const imported: ImportedRepoData = {
        name: json.name || parsed.repo,
        tagline: json.description ? json.description.slice(0, 90) : "Imported from GitHub",
        description:
          json.description ||
          `Open source codebase imported from GitHub repository ${parsed.owner}/${parsed.repo}.`,
        techTags: tags,
        repoUrl: json.html_url || `https://github.com/${parsed.owner}/${parsed.repo}`,
        lastActiveDate: lastDate,
        stars: json.stargazers_count ?? 0,
      };

      setPreviewData(imported);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error fetching repository data.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmImport = () => {
    if (!previewData) return;
    onImport(previewData);
    setPreviewData(null);
    setRepoInput("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Repository from GitHub"
      description="Import existing public or private repositories into SecondSpark with real metadata."
      className="max-w-xl"
    >
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 border-b border-[#D1D9E0] pb-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab("public");
              setError(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer select-none ${
              activeTab === "public"
                ? "bg-[#F6F8FA] text-[#1F2328] border border-[#D1D9E0] font-semibold"
                : "text-[#59636E] hover:text-[#1F2328] hover:bg-[#F6F8FA]"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Public Repository</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("oauth");
              setError(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer select-none ${
              activeTab === "oauth"
                ? "bg-[#F6F8FA] text-[#1F2328] border border-[#D1D9E0] font-semibold"
                : "text-[#59636E] hover:text-[#1F2328] hover:bg-[#F6F8FA]"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Private Repository &amp; OAuth</span>
          </button>
        </div>

        {/* Tab 1: Public Repo Import */}
        {activeTab === "public" && (
          <div className="space-y-4">
            <form onSubmit={handleFetchPublicRepo} className="space-y-2.5">
              <label className="block text-xs font-semibold text-[#1F2328]">
                GitHub Repository URL or Slug
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. spark-labs/docupulse or https://github.com/..."
                  value={repoInput}
                  onChange={(e) => setRepoInput(e.target.value)}
                  icon={<GitBranch className="w-3.5 h-3.5 text-[#59636E]" />}
                  required
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isLoading}
                  className="shrink-0 gap-1.5"
                >
                  <Search className="w-3.5 h-3.5" />
                  {isLoading ? "Fetching..." : "Fetch"}
                </Button>
              </div>
              <p className="text-[11px] text-[#59636E]">
                Fetches real metadata via GitHub REST API (name, description, language, stars, last commit).
              </p>
            </form>

            {error && (
              <div className="p-3 rounded-md bg-[#FFEBE9] border border-[#FF8182]/50 flex items-start gap-2.5 text-xs text-[#D1242F]">
                <AlertCircle className="w-4 h-4 text-[#D1242F] shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {previewData && (
              <div className="p-4 rounded-lg border border-[#D1D9E0] bg-[#F6F8FA] space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#1F883D] font-semibold block mb-0.5">
                      Verified GitHub Repository
                    </span>
                    <h3 className="text-sm font-semibold text-[#1F2328]">
                      {previewData.name}
                    </h3>
                  </div>
                  <a
                    href={previewData.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#0969DA] hover:underline flex items-center gap-1 font-mono"
                  >
                    View <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <p className="text-xs text-[#59636E] leading-relaxed">
                  {previewData.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {previewData.techTags.map((t) => (
                    <Badge key={t} variant="tech">
                      {t}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#D1D9E0]/60 text-xs text-[#59636E] font-mono">
                  <span>Last active: {previewData.lastActiveDate}</span>
                  {previewData.stars !== undefined && (
                    <span>{previewData.stars} stars</span>
                  )}
                </div>

                <div className="pt-2">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleConfirmImport}
                    className="w-full justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Import into Graveyard Form
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: OAuth & Private Repos */}
        {activeTab === "oauth" && (
          <div className="space-y-3.5">
            <div className="p-4 rounded-lg border border-[#D1D9E0] bg-[#F6F8FA] space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-white border border-[#D1D9E0] flex items-center justify-center text-[#1F2328]">
                  <GitHubIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#1F2328]">
                    GitHub OAuth Connection
                  </h4>
                  <p className="text-[11px] text-[#59636E]">
                    Enables reading private repositories and automated commit tracking.
                  </p>
                </div>
              </div>

              <div className="space-y-1 text-xs text-[#59636E] pt-1">
                <p className="font-semibold text-[#1F2328]">Requested Scopes:</p>
                <ul className="list-disc pl-5 space-y-0.5">
                  <li><strong className="text-[#1F2328]">read:user</strong> — Verify developer identity</li>
                  <li><strong className="text-[#1F2328]">user:email</strong> — Secure account association</li>
                </ul>
              </div>
            </div>

            <div className="p-3 rounded-md bg-[#FFF8C5] border border-[#D4A72C]/40 flex items-start gap-2.5 text-xs text-[#9A6700]">
              <Info className="w-4 h-4 text-[#9A6700] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-semibold">Setup Credentials Required</p>
                <p className="leading-relaxed">
                  To connect private repositories via OAuth, specify <code className="bg-[#FFF8C5] px-1 py-0.5 rounded font-mono">GITHUB_CLIENT_ID</code> and <code className="bg-[#FFF8C5] px-1 py-0.5 rounded font-mono">GITHUB_CLIENT_SECRET</code> in your local <code className="bg-[#FFF8C5] px-1 py-0.5 rounded font-mono">.env.local</code> file.
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              className="w-full justify-center gap-2"
              onClick={() => {
                setError(
                  "GitHub OAuth is waiting for GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to be configured in .env.local. Refer to .env.example."
                );
              }}
            >
              <GitHubIcon className="w-4 h-4" />
              <span>Connect GitHub Account</span>
            </Button>

            {error && (
              <div className="p-3 rounded-md bg-[#FFEBE9] border border-[#FF8182]/50 text-xs text-[#D1242F] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#D1242F] shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        )}

        <div className="pt-2 border-t border-[#D1D9E0]/60 flex justify-end">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
