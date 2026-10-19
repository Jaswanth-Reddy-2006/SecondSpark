"use client";

import React, { useState } from "react";
import { Project } from "@/types/project";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { Download, Check, RotateCcw, GitBranch, AlertCircle } from "lucide-react";

// Official GitHub Mark
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

interface SettingsViewProps {
  projects: Project[];
  onResetSeed?: () => void;
  onOpenGitHubImport?: () => void;
}

export function SettingsView({ projects, onResetSeed, onOpenGitHubImport }: SettingsViewProps) {
  const { user, signInWithGitHub } = useAuth();
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [autoArchive, setAutoArchive] = useState(true);
  const [allowPublicForking, setAllowPublicForking] = useState(true);
  const [oauthError, setOauthError] = useState<string | null>(null);

  const handleExportJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(projects, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `secondspark-graveyard-export-${Date.now()}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handleReset = () => {
    if (
      window.confirm(
        "Are you sure you want to restore the default seed projects? This will replace your current local graveyard list with the initial developer projects."
      )
    ) {
      if (onResetSeed) {
        onResetSeed();
        setResetSuccess(true);
        setTimeout(() => setResetSuccess(false), 3000);
      }
    }
  };

  const handleConnectGitHub = async () => {
    setOauthError(null);
    const result = await signInWithGitHub();
    if (result.requiresConfig) {
      setOauthError(
        "GitHub OAuth credentials (GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET) are not configured in your environment. Public repository imports work without OAuth credentials."
      );
    } else if (!result.success && result.error) {
      setOauthError(result.error);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl animate-in fade-in duration-150">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-[#1F2328] tracking-tight">
          Graveyard Settings &amp; Vault Preferences
        </h2>
        <p className="mt-1 text-xs text-[#59636E]">
          Manage local catalog backups, GitHub connections, and maintainer privacy settings.
        </p>
      </div>

      {/* GitHub Integration Section */}
      <div className="p-5 rounded-lg border border-[#D1D9E0] bg-white shadow-2xs space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-md bg-[#F6F8FA] border border-[#D1D9E0] flex items-center justify-center text-[#1F2328] shrink-0 mt-0.5">
              <GitHubIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-[#1F2328]">
                  GitHub Integration
                </h3>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-mono font-medium bg-[#FFF8C5] text-[#9A6700] border border-[#D4A72C]/40">
                  Ready to Connect
                </span>
              </div>
              <p className="text-xs text-[#59636E] mt-1 max-w-lg leading-relaxed">
                Connect your GitHub account to sync private repositories and automatically populate repository metadata. Public repository imports are available immediately without credentials.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
            {onOpenGitHubImport && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenGitHubImport}
                className="text-xs gap-1.5"
              >
                <GitBranch className="w-3.5 h-3.5 text-[#59636E]" />
                Import Public Repo
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={handleConnectGitHub}
              className="text-xs gap-1.5"
            >
              <GitHubIcon className="w-3.5 h-3.5 text-[#1F2328]" />
              Connect GitHub
            </Button>
          </div>
        </div>

        {oauthError && (
          <div className="p-3 rounded-md bg-[#FFF8C5] border border-[#D4A72C]/40 flex items-start gap-2.5 text-xs text-[#9A6700]">
            <AlertCircle className="w-4 h-4 text-[#9A6700] shrink-0 mt-0.5" />
            <p className="leading-relaxed">{oauthError}</p>
          </div>
        )}
      </div>

      {/* Maintainer Profile Section */}
      <div className="p-5 rounded-lg border border-[#D1D9E0] bg-white shadow-2xs space-y-4">
        <h3 className="text-sm font-semibold text-[#1F2328]">
          Maintainer Profile
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-[#1F2328] mb-1">
              Display Name
            </label>
            <Input
              type="text"
              defaultValue={user?.name || "Developer"}
              readOnly
              className="bg-[#F6F8FA]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#1F2328] mb-1">
              Email Address
            </label>
            <Input
              type="email"
              defaultValue={user?.email || "developer@example.com"}
              readOnly
              className="bg-[#F6F8FA]"
            />
          </div>
        </div>
      </div>

      {/* Catalog & Export Management */}
      <div className="p-5 rounded-lg border border-[#D1D9E0] bg-white shadow-2xs space-y-4">
        <h3 className="text-sm font-semibold text-[#1F2328]">
          Data Portability &amp; Backups
        </h3>
        <p className="text-xs text-[#59636E] leading-relaxed">
          Export your entire tombstone vault including post-mortems, blockers, and tech stacks as raw JSON for local backups.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJSON}
            className="text-xs gap-1.5"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#1F883D]" />
                <span className="text-[#1A7F37]">Export Complete</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-[#59636E]" />
                <span>Export Graveyard ({projects.length} repos)</span>
              </>
            )}
          </Button>

          {onResetSeed && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="text-xs text-[#D1242F] hover:bg-[#FFEBE9] hover:border-[#FF8182]/50 gap-1.5"
            >
              {resetSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#1F883D]" />
                  <span>Restored Initial Repos</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Seed Repositories</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Privacy & Catalog Toggles */}
      <div className="p-5 rounded-lg border border-[#D1D9E0] bg-white shadow-2xs space-y-3.5">
        <h3 className="text-sm font-semibold text-[#1F2328]">
          Catalog Visibility Preferences
        </h3>

        <div className="flex items-start justify-between gap-4 pt-1">
          <div>
            <p className="text-xs font-semibold text-[#1F2328]">
              Automated Archival Tagging
            </p>
            <p className="text-xs text-[#59636E] mt-0.5">
              Flag projects dormant for &gt;180 days with an alert badge to prompt post-mortem review.
            </p>
          </div>
          <input
            type="checkbox"
            checked={autoArchive}
            onChange={(e) => setAutoArchive(e.target.checked)}
            className="w-4 h-4 rounded border-[#D1D9E0] text-[#1F883D] focus:ring-[#1F883D] mt-0.5"
          />
        </div>

        <div className="flex items-start justify-between gap-4 pt-2 border-t border-[#D1D9E0]/50">
          <div>
            <p className="text-xs font-semibold text-[#1F2328]">
              Allow Community Forking &amp; Adoption
            </p>
            <p className="text-xs text-[#59636E] mt-0.5">
              Display an &quot;Adopt This Project&quot; transfer link on public catalog cards.
            </p>
          </div>
          <input
            type="checkbox"
            checked={allowPublicForking}
            onChange={(e) => setAllowPublicForking(e.target.checked)}
            className="w-4 h-4 rounded border-[#D1D9E0] text-[#1F883D] focus:ring-[#1F883D] mt-0.5"
          />
        </div>
      </div>
    </div>
  );
}
