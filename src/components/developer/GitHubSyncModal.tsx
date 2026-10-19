"use client";

import React, { useState } from "react";
import { Project } from "@/types/project";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Copy, Check, GitPullRequest, Activity, Sparkles, Radio, ExternalLink } from "lucide-react";

interface GitHubSyncModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onHeartbeatFired?: () => void;
}

export function GitHubSyncModal({
  project,
  isOpen,
  onClose,
  onHeartbeatFired,
}: GitHubSyncModalProps) {
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const origin = typeof window !== "undefined" ? window.location.origin : "https://secondspark.dev";
  const webhookUrl = `${origin}/api/webhooks/github`;

  const copyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const triggerTestWebhook = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch(`/api/webhooks/github?test=true`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-github-event": "push",
        },
        body: JSON.stringify({
          test: true,
          projectId: project.id,
          repository: {
            full_name: project.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
          },
          commits: [{ message: "fix: reconcile outdated dependencies & refresh runtime" }],
          pusher: { name: "Developer via SecondSpark Sync" },
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setTestResult("Heartbeat signal verified! Last active timestamp and timeline updated.");
        if (onHeartbeatFired) onHeartbeatFired();
      } else {
        setTestResult(`Webhook test failed: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Test webhook failed:", err);
      setTestResult("Network error testing webhook.");
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="GitHub Bi-Directional Webhooks"
      description={`Connect ${project.name}'s GitHub repository to synchronize commit heartbeats and auto-close revival tasks when PRs merge.`}
      className="max-w-xl"
    >
      <div className="space-y-4 py-2">
        {/* Payload URL Card */}
        <div className="p-4 rounded-xl bg-white border border-[#D1D9E0] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#1F2328]">
              GitHub Webhook Payload URL
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={copyWebhook}
              className="h-7 text-xs gap-1.5"
            >
              {copiedWebhook ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#1F883D]" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy URL</span>
                </>
              )}
            </Button>
          </div>
          <code className="p-2.5 rounded-md bg-[#F6F8FA] border border-[#D1D9E0]/80 text-[11px] font-mono text-[#0969DA] block break-all">
            {webhookUrl}
          </code>
        </div>

        {/* Setup Instructions */}
        <div className="p-4 rounded-xl bg-[#F6F8FA] border border-[#D1D9E0] space-y-2">
          <h4 className="text-xs font-bold text-[#1F2328] font-mono uppercase tracking-wider">
            Quick 2-Step GitHub Setup
          </h4>
          <ol className="text-xs text-[#59636E] space-y-1.5 list-decimal list-inside leading-relaxed">
            <li>
              In your GitHub repo, navigate to <strong>Settings &rarr; Webhooks &rarr; Add webhook</strong>.
            </li>
            <li>
              Paste the Payload URL above, set Content type to <code className="font-mono text-[#1F2328]">application/json</code>, and select <strong>Pushes</strong> and <strong>Pull requests</strong>.
            </li>
          </ol>
        </div>

        {/* Live Test Trigger */}
        <div className="p-4 rounded-xl bg-white border border-[#D1D9E0] shadow-xs space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#0969DA]" />
                <h4 className="text-xs font-bold text-[#1F2328]">
                  Heartbeat Sensor Verification
                </h4>
              </div>
              <p className="text-[11px] text-[#59636E] mt-1">
                Simulate a commit event from GitHub to test the webhook and verify project activity synchronization.
              </p>
            </div>

            <Button
              size="sm"
              variant="primary"
              onClick={triggerTestWebhook}
              disabled={isTesting}
              className="text-xs gap-1.5 shrink-0"
            >
              <Radio className={`w-3.5 h-3.5 ${isTesting ? "animate-pulse text-yellow-300" : ""}`} />
              <span>{isTesting ? "Pinging..." : "Test Heartbeat"}</span>
            </Button>
          </div>

          {testResult && (
            <div className="p-2.5 rounded-lg bg-[#DAFBE8] border border-[#1F883D]/30 text-xs text-[#1F883D] flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{testResult}</span>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
