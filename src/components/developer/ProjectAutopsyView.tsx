"use client";

import React, { useState } from "react";
import { Project, ProjectAutopsy } from "@/types/project";
import { Button } from "@/components/ui/button";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Cpu,
  RefreshCw,
  ShieldAlert,
  Zap,
  ArrowRight,
  Sparkles,
  PackageCheck,
  FileCode,
  Copy,
  Check,
} from "lucide-react";

interface ProjectAutopsyViewProps {
  project: Project;
  onAutopsyUpdated?: (autopsy: ProjectAutopsy) => void;
}

export function ProjectAutopsyView({ project, onAutopsyUpdated }: ProjectAutopsyViewProps) {
  const [autopsy, setAutopsy] = useState<ProjectAutopsy | null>(project.autopsy || null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);

  const runAutopsy = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/autopsy`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.autopsy) {
        setAutopsy(data.autopsy);
        if (onAutopsyUpdated) {
          onAutopsyUpdated(data.autopsy);
        }
      }
    } catch (err) {
      console.error("Failed to run autopsy:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyEnvVars = () => {
    if (!autopsy?.detectedEnvVars) return;
    const text = autopsy.detectedEnvVars.map((v) => `${v}=""`).join("\n");
    navigator.clipboard.writeText(text);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  // If no autopsy has been run yet
  if (!autopsy) {
    return (
      <div className="p-8 text-center bg-[#F6F8FA] border border-[#D1D9E0] rounded-xl my-4">
        <div className="w-12 h-12 rounded-xl bg-[#DDF4FF] border border-[#54AEFF]/40 text-[#0969DA] flex items-center justify-center mx-auto mb-3">
          <Activity className="w-6 h-6 animate-pulse" />
        </div>
        <h3 className="text-base font-bold text-[#1F2328]">Automated Project Autopsy & Bit-Rot Scanner</h3>
        <p className="text-xs text-[#59636E] max-w-md mx-auto mt-1 mb-5">
          Scan this repository to diagnose dependency decay, calculate the Bit-Rot Index, discover CVE security advisories, and get a tailored modernization roadmap.
        </p>
        <Button
          onClick={runAutopsy}
          disabled={isLoading}
          variant="primary"
          className="gap-2 text-xs font-semibold px-4 py-2"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Scanning Repository Dependencies...
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5 text-yellow-300" />
              Execute Project Autopsy
            </>
          )}
        </Button>
      </div>
    );
  }

  const rotColor =
    autopsy.rotSeverity === "healthy"
      ? "text-[#1F883D] bg-[#DAFBE8] border-[#1F883D]/30"
      : autopsy.rotSeverity === "mild"
      ? "text-[#9A6700] bg-[#FFF8C5] border-[#9A6700]/30"
      : "text-[#CF222E] bg-[#FFEBE9] border-[#CF222E]/30";

  const effortBadge =
    autopsy.effortSize === "weekend_hack"
      ? { label: "Weekend Hack (1–2 Days)", color: "text-[#1F883D] bg-[#DAFBE8] border-[#1F883D]/30" }
      : autopsy.effortSize === "sprint"
      ? { label: "Sprint (1–2 Weeks)", color: "text-[#0969DA] bg-[#DDF4FF] border-[#54AEFF]/40" }
      : { label: "Archaeological Dig (1+ Month)", color: "text-[#CF222E] bg-[#FFEBE9] border-[#CF222E]/30" };

  return (
    <div className="space-y-5 py-2">
      {/* Top Banner with Scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Rot Index Card */}
        <div className="p-4 rounded-xl bg-white border border-[#D1D9E0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#59636E] uppercase tracking-wider font-semibold">
              Bit-Rot Index
            </span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${rotColor}`}>
              {autopsy.rotSeverity.toUpperCase()}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-[#1F2328] font-mono">{autopsy.rotIndex}</span>
            <span className="text-xs text-[#59636E] font-mono">/ 100</span>
          </div>
          <div className="w-full bg-[#EAEEF2] h-2 rounded-full mt-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                autopsy.rotSeverity === "healthy"
                  ? "bg-[#1F883D]"
                  : autopsy.rotSeverity === "mild"
                  ? "bg-[#D97706]"
                  : "bg-[#CF222E]"
              }`}
              style={{ width: `${autopsy.rotIndex}%` }}
            />
          </div>
          <p className="text-[11px] text-[#59636E] mt-2">
            {autopsy.rotSeverity === "healthy"
              ? "Codebase dependencies remain actively maintained."
              : autopsy.rotSeverity === "mild"
              ? "Stagnation detected; needs runtime & library updates."
              : "High dependency bit-rot; significant CVE vulnerabilities."}
          </p>
        </div>

        {/* Effort T-Shirt Sizing */}
        <div className="p-4 rounded-xl bg-white border border-[#D1D9E0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#59636E] uppercase tracking-wider font-semibold">
              Revival Sizing
            </span>
            <Clock className="w-3.5 h-3.5 text-[#59636E]" />
          </div>
          <div className="mt-2">
            <span className={`inline-block text-xs font-mono font-bold px-2.5 py-1 rounded-md border ${effortBadge.color}`}>
              {effortBadge.label}
            </span>
          </div>
          <p className="text-[11px] text-[#59636E] mt-2.5 leading-relaxed">
            {autopsy.effortDescription}
          </p>
        </div>

        {/* Runtime Compatibility */}
        <div className="p-4 rounded-xl bg-white border border-[#D1D9E0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#59636E] uppercase tracking-wider font-semibold">
              Runtime Target
            </span>
            <Cpu className="w-3.5 h-3.5 text-[#59636E]" />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#F6F8FA] border border-[#D1D9E0] text-[#59636E] line-through">
              Node {autopsy.runtimeVersion || "14.x"}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-[#59636E]" />
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#DAFBE8] border border-[#1F883D]/30 text-[#1F883D]">
              Node {autopsy.targetRuntimeVersion || "22 LTS"}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[11px] text-[#59636E]">
              Scanned: {new Date(autopsy.analyzedAt).toLocaleDateString()}
            </span>
            <button
              onClick={runAutopsy}
              disabled={isLoading}
              className="text-[11px] font-medium text-[#0969DA] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
              Re-scan
            </button>
          </div>
        </div>
      </div>

      {/* Clinical Diagnosis Summary */}
      <div className="p-4 rounded-xl bg-[#F6F8FA] border border-[#D1D9E0]/80">
        <div className="flex items-start gap-2.5">
          <Activity className="w-4 h-4 text-[#0969DA] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-[#1F2328] uppercase font-mono tracking-wide">
              Clinical Health Summary
            </h4>
            <p className="text-xs text-[#59636E] mt-1 leading-relaxed">
              {autopsy.healthSummary}
            </p>
          </div>
        </div>
      </div>

      {/* Outdated Dependencies Table */}
      <div className="rounded-xl border border-[#D1D9E0] overflow-hidden bg-white shadow-xs">
        <div className="px-4 py-3 bg-[#F6F8FA] border-b border-[#D1D9E0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-4 h-4 text-[#59636E]" />
            <h4 className="text-xs font-bold text-[#1F2328] uppercase font-mono tracking-wider">
              Dependency Reconciliation ({autopsy.outdatedDependencies.length})
            </h4>
          </div>
          <span className="text-[11px] text-[#59636E] font-mono">
            Direct & Transitive Audit
          </span>
        </div>

        <div className="divide-y divide-[#D1D9E0]/60">
          {autopsy.outdatedDependencies.map((dep, idx) => (
            <div key={idx} className="p-3.5 hover:bg-[#F6F8FA]/50 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#1F2328]">
                    {dep.name}
                  </span>
                  <span className="text-[11px] font-mono text-[#59636E] bg-[#F6F8FA] px-1.5 py-0.5 rounded border border-[#D1D9E0]">
                    v{dep.currentVersion}
                  </span>
                  <ArrowRight className="w-3 h-3 text-[#8C959F]" />
                  <span className="text-[11px] font-mono font-bold text-[#1F883D] bg-[#DAFBE8] px-1.5 py-0.5 rounded border border-[#1F883D]/30">
                    v{dep.latestVersion}
                  </span>

                  {dep.isDeprecated && (
                    <span className="text-[10px] font-mono font-bold text-[#CF222E] bg-[#FFEBE9] px-2 py-0.5 rounded-full border border-[#CF222E]/30 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" />
                      Deprecated
                    </span>
                  )}
                </div>

                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#FFF8C5] text-[#9A6700] font-bold border border-[#9A6700]/30">
                  {dep.diff} bump
                </span>
              </div>

              {dep.recommendation && (
                <p className="text-[11px] text-[#59636E] mt-1.5">
                  <strong className="text-[#1F2328]">Action:</strong> {dep.recommendation}
                </p>
              )}

              {dep.cveAdvisory && (
                <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[#CF222E]">
                  <AlertTriangle className="w-3 h-3 shrink-0" />
                  <span>{dep.cveAdvisory}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modernization Roadmap Blueprint */}
      <div className="rounded-xl border border-[#D1D9E0] overflow-hidden bg-white shadow-xs">
        <div className="px-4 py-3 bg-[#F6F8FA] border-b border-[#D1D9E0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#0969DA]" />
            <h4 className="text-xs font-bold text-[#1F2328] uppercase font-mono tracking-wider">
              Step-by-Step Modernization Blueprint
            </h4>
          </div>
          <span className="text-[11px] text-[#0969DA] font-mono font-semibold">
            Minimum Viable Revival (MVR)
          </span>
        </div>

        <div className="divide-y divide-[#D1D9E0]/60">
          {autopsy.modernizationSteps.map((step, idx) => (
            <div key={idx} className="p-3.5 hover:bg-[#F6F8FA]/50 transition-colors">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#DDF4FF] text-[#0969DA] text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-semibold text-[#1F2328]">
                    {step.title}
                  </span>
                </div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#F6F8FA] text-[#59636E] border border-[#D1D9E0] font-medium">
                  {step.category}
                </span>
              </div>
              <p className="text-[11px] text-[#59636E] mt-1 pl-7 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Discovered Environment Variables */}
      <div className="p-4 rounded-xl bg-white border border-[#D1D9E0] shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-[#59636E]" />
            <h4 className="text-xs font-bold text-[#1F2328] uppercase font-mono tracking-wide">
              Required Environment Variables ({autopsy.detectedEnvVars.length})
            </h4>
          </div>
          <button
            onClick={copyEnvVars}
            className="text-xs text-[#0969DA] hover:underline flex items-center gap-1 font-mono cursor-pointer"
          >
            {copiedEnv ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#1F883D]" />
                <span>Copied .env</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy .env Schema</span>
              </>
            )}
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {autopsy.detectedEnvVars.map((envVar, idx) => (
            <code
              key={idx}
              className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#F6F8FA] border border-[#D1D9E0] text-[#1F2328]"
            >
              {envVar}
            </code>
          ))}
        </div>
      </div>
    </div>
  );
}
