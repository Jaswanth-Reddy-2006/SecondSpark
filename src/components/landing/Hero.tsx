"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Star,
  GitFork,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Calendar,
  Sparkles,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  const [activeTab, setActiveTab] = useState<"code" | "tombstone">("code");

  // Commit activity heatmap visualization: 20 weeks of 7 days
  // Demonstrates burst of activity fading into dormancy
  const heatmapWeeks = Array.from({ length: 20 }, (_, wIdx) => {
    return Array.from({ length: 7 }, (_, dIdx) => {
      // Activity concentrated in earlier weeks (weeks 0-12), dormant in recent weeks (weeks 13-19)
      if (wIdx > 13) return 0;
      const seed = (wIdx * 7 + dIdx) % 11;
      if (seed > 7) return 3;
      if (seed > 4) return 2;
      if (seed > 1) return 1;
      return 0;
    });
  });

  const getHeatmapColor = (level: number) => {
    switch (level) {
      case 3:
        return "bg-[#1F883D]"; // Active
      case 2:
        return "bg-[#39D353]";
      case 1:
        return "bg-[#9BE9A8]";
      default:
        return "bg-[#EBEDF0]"; // Inactive / Dormant
    }
  };

  return (
    <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 border-b border-[#D1D9E0] bg-[#FFFFFF] overflow-hidden">
      {/* Subtle background canvas */}
      <div className="absolute inset-0 bg-radial-[at_top] from-[#F6F8FA] via-transparent to-transparent pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Release / Announcement Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#D1D9E0] bg-[#F6F8FA] text-[#1F2328] text-xs font-mono mb-6 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#1F883D]" />
          <span className="font-medium">The Project Graveyard for Developers</span>
          <span className="text-[#59636E]">•</span>
          <span className="text-[#59636E]">Open Catalog</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#1F2328] max-w-4xl mx-auto leading-[1.12]">
          Your unfinished projects deserve a{" "}
          <span className="text-[#1F883D] underline decoration-[#1F883D]/30 underline-offset-8">
            second spark.
          </span>
        </h1>

        {/* Supporting Description */}
        <p className="mt-5 text-sm sm:text-base md:text-lg text-[#59636E] max-w-2xl mx-auto leading-relaxed">
          Preserve abandoned repositories, understand what went wrong, and turn forgotten code into your next breakthrough.
        </p>

        {/* Primary Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button size="lg" variant="primary" className="w-full sm:w-auto font-medium gap-2">
              <span>Explore the Graveyard</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="#how-it-works" className="w-full sm:w-auto">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              How It Works
            </Button>
          </Link>
        </div>

        {/* Live Repository-Style Interface Preview (Real React Component) */}
        <div className="mt-12 max-w-4xl mx-auto text-left">
          <div className="rounded-lg border border-[#D1D9E0] bg-[#FFFFFF] shadow-md overflow-hidden">
            {/* Repository Header Bar */}
            <div className="p-4 sm:p-5 border-b border-[#D1D9E0] bg-[#F6F8FA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <FileCode className="w-4 h-4 text-[#59636E]" />
                <span className="text-sm font-mono text-[#0969DA] font-semibold hover:underline cursor-pointer">
                  spark-labs
                </span>
                <span className="text-[#59636E] font-mono">/</span>
                <span className="text-sm font-mono text-[#0969DA] font-semibold hover:underline cursor-pointer">
                  docupulse
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-medium border border-[#D1D9E0] text-[#59636E] bg-white">
                  Vault Entombed
                </span>
                <Badge status="Abandoned" withIcon />
              </div>

              {/* Action Buttons & Star Badges */}
              <div className="flex items-center gap-2">
                <div className="inline-flex rounded-md border border-[#D1D9E0] bg-white text-xs font-mono text-[#1F2328] shadow-2xs">
                  <span className="flex items-center gap-1 px-2.5 py-1 border-r border-[#D1D9E0]">
                    <Star className="w-3.5 h-3.5 text-[#59636E]" /> Star
                  </span>
                  <span className="px-2 py-1 font-semibold text-[#59636E] bg-[#F6F8FA]">
                    342
                  </span>
                </div>
                <div className="inline-flex rounded-md border border-[#D1D9E0] bg-white text-xs font-mono text-[#1F2328] shadow-2xs">
                  <span className="flex items-center gap-1 px-2.5 py-1 border-r border-[#D1D9E0]">
                    <GitFork className="w-3.5 h-3.5 text-[#59636E]" /> Fork
                  </span>
                  <span className="px-2 py-1 font-semibold text-[#59636E] bg-[#F6F8FA]">
                    29
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="px-4 border-b border-[#D1D9E0] bg-[#FFFFFF] flex items-center gap-4 text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveTab("code")}
                className={`py-3 px-1 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === "code"
                    ? "border-[#1F883D] text-[#1F2328] font-semibold"
                    : "border-transparent text-[#59636E] hover:text-[#1F2328]"
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Codebase &amp; Health</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("tombstone")}
                className={`py-3 px-1 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === "tombstone"
                    ? "border-[#1F883D] text-[#1F2328] font-semibold"
                    : "border-transparent text-[#59636E] hover:text-[#1F2328]"
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Tombstone Post-Mortem</span>
              </button>
            </div>

            {/* Preview Body Content */}
            <div className="p-5 sm:p-6 space-y-6 bg-white">
              {activeTab === "code" ? (
                <>
                  {/* Tagline & Commit status */}
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-[#1F2328]">
                      Instant headless documentation generator from OpenAPI 3.1 schemas
                    </p>
                    <p className="text-xs text-[#59636E]">
                      Fast edge-rendered viewer compiled with WebAssembly AST parser. Paused when team pivoted.
                    </p>
                  </div>

                  {/* Codebase Maturity Progress Bar */}
                  <div className="p-3.5 rounded-md border border-[#D1D9E0] bg-[#F6F8FA] space-y-2">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-[#59636E] font-medium flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#1F883D]" />
                        Architectural Completion
                      </span>
                      <span className="font-semibold text-[#1F2328]">78% Mature</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#D1D9E0]/50 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#1F883D] transition-all duration-300"
                        style={{ width: "78%" }}
                      />
                    </div>
                  </div>

                  {/* Language Breakdown Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs text-[#59636E]">
                      <span className="font-medium">Languages</span>
                      <span className="font-mono text-[11px]">Primary: TypeScript</span>
                    </div>
                    {/* Multi-language segment bar */}
                    <div className="h-2 w-full rounded-full flex overflow-hidden">
                      <div className="bg-[#3178C6] h-full" style={{ width: "68%" }} title="TypeScript 68%" />
                      <div className="bg-[#DEA584] h-full" style={{ width: "22%" }} title="Rust 22%" />
                      <div className="bg-[#654FF0] h-full" style={{ width: "10%" }} title="WebAssembly 10%" />
                    </div>
                    {/* Language legend */}
                    <div className="flex items-center gap-4 text-xs font-mono text-[#59636E] pt-0.5">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#3178C6]" />
                        TypeScript 68%
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#DEA584]" />
                        Rust 22%
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#654FF0]" />
                        WebAssembly 10%
                      </span>
                    </div>
                  </div>

                  {/* Activity Heatmap Preview */}
                  <div className="pt-2 border-t border-[#D1D9E0]/60 space-y-2">
                    <div className="flex items-center justify-between text-xs text-[#59636E]">
                      <span className="font-mono flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        Activity Timeline (Bursts followed by dormancy)
                      </span>
                      <span className="text-[11px] font-mono text-[#59636E]">Commit Heatmap</span>
                    </div>

                    {/* Heatmap Grid */}
                    <div className="overflow-x-auto pb-1">
                      <div className="flex gap-1 items-center">
                        {heatmapWeeks.map((week, wIdx) => (
                          <div key={wIdx} className="flex flex-col gap-1">
                            {week.map((level, dIdx) => (
                              <div
                                key={dIdx}
                                className={`w-2.5 h-2.5 rounded-xs ${getHeatmapColor(level)}`}
                                title={`Week ${wIdx + 1}, Day ${dIdx + 1}`}
                              />
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Tombstone Context View */
                <div className="space-y-4">
                  <div className="p-3.5 rounded-md border border-[#D4A72C]/40 bg-[#FFF8C5] text-xs text-[#9A6700] space-y-1">
                    <p className="font-semibold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-[#9A6700]" />
                      Preserved Abandonment Reason
                    </p>
                    <p className="leading-relaxed">
                      &quot;Lost developer momentum after core parser was finished; needs community auth &amp; hosting layer.&quot;
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-md border border-[#D1D9E0] bg-[#F6F8FA] space-y-1">
                      <p className="font-semibold text-[#1F2328]">Main Technical Blocker</p>
                      <p className="text-[#59636E] leading-relaxed">
                        Lack of serverless persistence for state storage and high compilation overhead of custom WebAssembly AST bindings.
                      </p>
                    </div>

                    <div className="p-3 rounded-md border border-[#D1D9E0] bg-[#F6F8FA] space-y-1">
                      <p className="font-semibold text-[#1F2328]">Lessons Learned</p>
                      <p className="text-[#59636E] leading-relaxed">
                        Edge runtimes require strict binary size boundaries. Starting with a heavy Rust AST parser added unnecessary overhead.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Footer Callout */}
            <div className="px-5 py-3 border-t border-[#D1D9E0] bg-[#F6F8FA] flex items-center justify-between text-xs text-[#59636E] font-mono">
              <span className="flex items-center gap-1.5 text-[#1F883D] font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                Revival Viability: High (Ready for fork or transfer)
              </span>
              <span>Last active: 2024-03-14</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
