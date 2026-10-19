"use client";

import React, { useState } from "react";
import { Project } from "@/types/project";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Copy, Check, Shield, Code, Sparkles, ExternalLink } from "lucide-react";

interface DynamicBadgeModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

export function DynamicBadgeModal({ project, isOpen, onClose }: DynamicBadgeModalProps) {
  const [badgeType, setBadgeType] = useState<"status" | "rating" | "tasks" | "rot">("status");
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  // In browser, window.location.origin provides the current host
  const origin = typeof window !== "undefined" ? window.location.origin : "https://secondspark.dev";
  const badgeUrl = `${origin}/api/badge/${project.slug || project.id}?type=${badgeType}`;
  const targetUrl = `${origin}/community?search=${encodeURIComponent(project.name)}`;

  const markdownSnippet = `[![SecondSpark](${badgeUrl})](${targetUrl})`;
  const htmlSnippet = `<a href="${targetUrl}"><img src="${badgeUrl}" alt="SecondSpark Status" /></a>`;

  const copyToClipboard = (text: string, format: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Dynamic README Badge"
      description={`Embed real-time project revival status into ${project.name}'s GitHub README.`}
      className="max-w-xl"
    >
      <div className="space-y-4 py-2">
        {/* Style Selector Tabs */}
        <div>
          <label className="text-xs font-mono text-[#59636E] uppercase tracking-wider font-semibold block mb-2">
            Select Badge Metric
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: "status" as const, label: "Status" },
              { id: "rating" as const, label: "Community Rating" },
              { id: "tasks" as const, label: "Revival Tasks" },
              { id: "rot" as const, label: "Bit-Rot Index" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setBadgeType(item.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium border text-center transition-colors cursor-pointer ${
                  badgeType === item.id
                    ? "bg-[#DDF4FF] text-[#0969DA] border-[#54AEFF]"
                    : "bg-white text-[#59636E] border-[#D1D9E0] hover:bg-[#F6F8FA]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live SVG Badge Preview */}
        <div className="p-6 rounded-xl bg-[#F6F8FA] border border-[#D1D9E0] text-center">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#59636E] font-semibold block mb-3">
            Live SVG Render
          </span>
          <div className="inline-block p-2 bg-white rounded-lg border border-[#D1D9E0]/80 shadow-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={badgeUrl}
              alt="SecondSpark Live Badge"
              className="h-5"
            />
          </div>
          <p className="text-[11px] text-[#59636E] mt-3">
            This SVG dynamically reflects live database updates (status changes, review scores, or closed tasks) with zero manual edits.
          </p>
        </div>

        {/* Markdown Snippet */}
        <div className="p-3.5 rounded-xl bg-white border border-[#D1D9E0] shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-mono font-bold text-[#1F2328]">
              GitHub Markdown (README.md)
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(markdownSnippet, "markdown")}
              className="h-7 text-xs gap-1.5"
            >
              {copiedFormat === "markdown" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#1F883D]" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Markdown</span>
                </>
              )}
            </Button>
          </div>
          <pre className="p-2.5 rounded-md bg-[#F6F8FA] border border-[#D1D9E0]/80 text-[11px] font-mono text-[#1F2328] overflow-x-auto select-all">
            {markdownSnippet}
          </pre>
        </div>

        {/* HTML Tag */}
        <div className="p-3.5 rounded-xl bg-white border border-[#D1D9E0] shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-mono font-bold text-[#1F2328]">
              HTML Embed Tag
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(htmlSnippet, "html")}
              className="h-7 text-xs gap-1.5"
            >
              {copiedFormat === "html" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#1F883D]" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy HTML</span>
                </>
              )}
            </Button>
          </div>
          <pre className="p-2.5 rounded-md bg-[#F6F8FA] border border-[#D1D9E0]/80 text-[11px] font-mono text-[#1F2328] overflow-x-auto select-all">
            {htmlSnippet}
          </pre>
        </div>
      </div>
    </Modal>
  );
}
