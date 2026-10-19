"use client";

import React, { useState } from "react";
import { Project } from "@/types/project";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
  getStackBlitzUrl,
  getCodespacesUrl,
  generateDevcontainerJson,
  generateEnvExample,
  extractGitHubRepoSlug,
} from "@/lib/sandbox-utils";
import {
  ExternalLink,
  Code2,
  Copy,
  Check,
  Terminal,
  FileCode,
  Layers,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

interface CloudSandboxModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

export function CloudSandboxModal({ project, isOpen, onClose }: CloudSandboxModalProps) {
  const [activeTab, setActiveTab] = useState<"launch" | "devcontainer" | "env">("launch");
  const [copiedDevcontainer, setCopiedDevcontainer] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);

  const stackblitzUrl = getStackBlitzUrl(project.repoUrl);
  const codespacesUrl = getCodespacesUrl(project.repoUrl);
  const repoSlug = extractGitHubRepoSlug(project.repoUrl);

  const devcontainerJson = generateDevcontainerJson(project);
  const envExample = generateEnvExample(project, project.autopsy?.detectedEnvVars);

  const copyDevcontainer = () => {
    navigator.clipboard.writeText(devcontainerJson);
    setCopiedDevcontainer(true);
    setTimeout(() => setCopiedDevcontainer(false), 2000);
  };

  const copyEnv = () => {
    navigator.clipboard.writeText(envExample);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Zero-Install Revival Workspace"
      description={`Inspect and run ${project.name} in an isolated browser or cloud sandbox without polluting your local machine.`}
      className="max-w-2xl"
    >
      <div className="space-y-4 py-2">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#D1D9E0] pb-2">
          {[
            { id: "launch" as const, label: "One-Click Launchers", icon: Sparkles },
            { id: "devcontainer" as const, label: "devcontainer.json", icon: Terminal },
            { id: "env" as const, label: ".env.example Generator", icon: FileCode },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                  isActive
                    ? "bg-[#DDF4FF] text-[#0969DA] border border-[#54AEFF]"
                    : "text-[#59636E] hover:bg-[#F6F8FA]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: One-Click Launchers */}
        {activeTab === "launch" && (
          <div className="space-y-3">
            {/* StackBlitz WebContainers */}
            <div className="p-4 rounded-xl border border-[#D1D9E0] bg-white shadow-xs hover:border-[#0969DA]/50 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1389FD]/10 border border-[#1389FD]/30 flex items-center justify-center text-[#1389FD] shrink-0">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1F2328]">
                      StackBlitz WebContainers (Instant In-Browser)
                    </h4>
                    <p className="text-[11px] text-[#59636E] mt-0.5 leading-relaxed">
                      Boots a full WebAssembly-powered Node.js environment directly inside your browser tab in under 5 seconds. Zero Docker, zero local install.
                    </p>
                  </div>
                </div>

                {stackblitzUrl ? (
                  <a
                    href={stackblitzUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1389FD] text-white hover:bg-[#0c70d4] transition-colors shrink-0 shadow-xs"
                  >
                    <span>Launch</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="text-[11px] text-[#8C959F] italic shrink-0">
                    Repo URL required
                  </span>
                )}
              </div>
            </div>

            {/* GitHub Codespaces */}
            <div className="p-4 rounded-xl border border-[#D1D9E0] bg-white shadow-xs hover:border-[#0969DA]/50 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#24292F]/10 border border-[#24292F]/30 flex items-center justify-center text-[#24292F] shrink-0">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1F2328]">
                      GitHub Codespaces (Full Cloud Container)
                    </h4>
                    <p className="text-[11px] text-[#59636E] mt-0.5 leading-relaxed">
                      Spins up a dedicated 2-core Linux VM in GitHub with Docker, database services, and full VS Code desktop or web IDE.
                    </p>
                  </div>
                </div>

                {codespacesUrl ? (
                  <a
                    href={codespacesUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#24292F] text-white hover:bg-[#1a1e22] transition-colors shrink-0 shadow-xs"
                  >
                    <span>Launch</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="text-[11px] text-[#8C959F] italic shrink-0">
                    Repo URL required
                  </span>
                )}
              </div>
            </div>

            {/* Helper tips */}
            <div className="p-3.5 rounded-xl bg-[#F6F8FA] border border-[#D1D9E0] text-[11px] text-[#59636E] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#1F883D] shrink-0" />
              <span>
                All sandboxes run in sandboxed virtual machines or isolated browser WebAssembly contexts. Stale dependencies cannot harm your host operating system.
              </span>
            </div>
          </div>
        )}

        {/* Tab 2: devcontainer.json */}
        {activeTab === "devcontainer" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#59636E]">
                Add this to <code className="font-mono text-[#1F2328]">.devcontainer/devcontainer.json</code> in the project root:
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={copyDevcontainer}
                className="h-7 text-xs gap-1.5"
              >
                {copiedDevcontainer ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#1F883D]" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy JSON</span>
                  </>
                )}
              </Button>
            </div>
            <pre className="p-3 rounded-xl bg-[#F6F8FA] border border-[#D1D9E0] text-[11px] font-mono text-[#1F2328] max-h-72 overflow-y-auto">
              {devcontainerJson}
            </pre>
          </div>
        )}

        {/* Tab 3: .env.example */}
        {activeTab === "env" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#59636E]">
                Auto-generated from scanned project architecture and tech tags:
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={copyEnv}
                className="h-7 text-xs gap-1.5"
              >
                {copiedEnv ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#1F883D]" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy .env.example</span>
                  </>
                )}
              </Button>
            </div>
            <pre className="p-3 rounded-xl bg-[#F6F8FA] border border-[#D1D9E0] text-[11px] font-mono text-[#1F2328] max-h-72 overflow-y-auto">
              {envExample}
            </pre>
          </div>
        )}
      </div>
    </Modal>
  );
}
