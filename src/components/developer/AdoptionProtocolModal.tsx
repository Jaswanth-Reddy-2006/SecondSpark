"use client";

import React, { useState } from "react";
import { Project, AdoptionProtocol } from "@/types/project";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShieldCheck,
  GitFork,
  Key,
  Award,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  AlertCircle,
} from "lucide-react";

interface AdoptionProtocolModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onAdoptionCompleted?: (protocol: AdoptionProtocol) => void;
}

export function AdoptionProtocolModal({
  project,
  isOpen,
  onClose,
  onAdoptionCompleted,
}: AdoptionProtocolModalProps) {
  const existingProtocol = project.adoptionProtocol;
  const [step, setStep] = useState<1 | 2 | 3 | 4>(
    (existingProtocol?.currentStep as 1 | 2 | 3 | 4) || 1
  );

  const [spdxLicense, setSpdxLicense] = useState(
    existingProtocol?.license?.spdx || "MIT"
  );
  const [licenseVerified, setLicenseVerified] = useState(
    existingProtocol?.license?.verified ?? false
  );
  const [handoverType, setHandoverType] = useState<"org_transfer" | "canonical_fork">(
    existingProtocol?.handoverType || "canonical_fork"
  );
  const [targetRepoUrl, setTargetRepoUrl] = useState(
    existingProtocol?.targetRepoUrl || ""
  );

  const [npmTransferred, setNpmTransferred] = useState(
    existingProtocol?.credentialsChecklist?.npmTransferred ?? false
  );
  const [domainTransferred, setDomainTransferred] = useState(
    existingProtocol?.credentialsChecklist?.domainTransferred ?? false
  );
  const [hostingTransferred, setHostingTransferred] = useState(
    existingProtocol?.credentialsChecklist?.hostingTransferred ?? false
  );
  const [notes, setNotes] = useState(
    existingProtocol?.credentialsChecklist?.notes || ""
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSuccess, setCompletedSuccess] = useState(false);

  const handleNext = async () => {
    if (step < 4) {
      const nextStep = (step + 1) as 1 | 2 | 3 | 4;
      setStep(nextStep);
      // Save intermediate progress
      try {
        await fetch(`/api/projects/${project.id}/adopt`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            step: nextStep,
            license: { spdx: spdxLicense, verified: licenseVerified },
            handoverType,
            targetRepoUrl,
            credentialsChecklist: {
              npmTransferred,
              domainTransferred,
              hostingTransferred,
              notes,
            },
          }),
        });
      } catch (err) {
        console.error("Failed to save adoption step:", err);
      }
    }
  };

  const handleFinalize = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/adopt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          complete: true,
          license: { spdx: spdxLicense, verified: licenseVerified },
          handoverType,
          targetRepoUrl,
          credentialsChecklist: {
            npmTransferred,
            domainTransferred,
            hostingTransferred,
            notes,
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.protocol) {
        setCompletedSuccess(true);
        if (onAdoptionCompleted) onAdoptionCompleted(data.protocol);
      }
    } catch (err) {
      console.error("Failed to complete adoption:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Maintainer Handover & Adoption Protocol"
      description={`Formally adopt ${project.name} to establish active maintainership and revive the repository.`}
      className="max-w-2xl"
    >
      <div className="space-y-4 py-2">
        {/* Step Indicator Bar */}
        <div className="grid grid-cols-4 gap-2 border-b border-[#D1D9E0] pb-3 text-center">
          {[
            { stepNum: 1, label: "1. License", icon: ShieldCheck },
            { stepNum: 2, label: "2. Repository", icon: GitFork },
            { stepNum: 3, label: "3. Credentials", icon: Key },
            { stepNum: 4, label: "4. Emeritus", icon: Award },
          ].map((item) => {
            const Icon = item.icon;
            const isCurrent = step === item.stepNum;
            const isDone = step > item.stepNum || completedSuccess;
            return (
              <div
                key={item.stepNum}
                className={`flex flex-col items-center gap-1 text-[11px] font-mono ${
                  isCurrent
                    ? "text-[#0969DA] font-bold"
                    : isDone
                    ? "text-[#1F883D] font-medium"
                    : "text-[#8C959F]"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center border ${
                    isCurrent
                      ? "bg-[#DDF4FF] border-[#54AEFF]"
                      : isDone
                      ? "bg-[#DAFBE8] border-[#1F883D]/40"
                      : "bg-[#F6F8FA] border-[#D1D9E0]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>

        {/* Success View */}
        {completedSuccess ? (
          <div className="p-8 text-center space-y-3 bg-[#DAFBE8]/30 rounded-xl border border-[#1F883D]/30">
            <div className="w-14 h-14 rounded-full bg-[#DAFBE8] border border-[#1F883D]/40 text-[#1F883D] flex items-center justify-center mx-auto shadow-xs">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-[#1F2328]">
              Repository Formally Adopted & Revived!
            </h3>
            <p className="text-xs text-[#59636E] max-w-md mx-auto leading-relaxed">
              Congratulations! You are now an official Maintainer of <strong>{project.name}</strong>. The project status has officially advanced from Abandoned to <strong>Revived</strong> in the SecondSpark network.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DAFBE8] text-[#1F883D] font-mono text-xs font-bold border border-[#1F883D]/30">
              <Award className="w-4 h-4" />
              <span>+500 XP Earned &bull; &ldquo;Torchbearer&rdquo; Badge Unlocked</span>
            </div>
            <div className="pt-3">
              <Button onClick={onClose} variant="primary" className="text-xs">
                View Revived Repository
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Step 1: License Verification */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-[#F6F8FA] border border-[#D1D9E0] text-xs text-[#59636E] leading-relaxed">
                  Before adopting an abandoned project, ensure it carries an open-source license permitting modification, redistribution, and commercial derivative works.
                </div>

                <div>
                  <label className="text-xs font-mono text-[#59636E] block mb-1 font-semibold">
                    Open Source License (SPDX Identifier)
                  </label>
                  <select
                    value={spdxLicense}
                    onChange={(e) => setSpdxLicense(e.target.value)}
                    className="w-full h-9 text-xs font-mono rounded-lg border border-[#D1D9E0] bg-white px-3 text-[#1F2328]"
                  >
                    <option value="MIT">MIT License (Permissive)</option>
                    <option value="Apache-2.0">Apache 2.0 (Permissive with patent grant)</option>
                    <option value="BSD-3-Clause">BSD 3-Clause</option>
                    <option value="MPL-2.0">Mozilla Public License 2.0 (Weak copyleft)</option>
                    <option value="GPL-3.0">GNU General Public License v3</option>
                  </select>
                </div>

                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-[#D1D9E0] bg-white cursor-pointer hover:bg-[#F6F8FA]">
                  <input
                    type="checkbox"
                    checked={licenseVerified}
                    onChange={(e) => setLicenseVerified(e.target.checked)}
                    className="mt-0.5 rounded border-[#D1D9E0] text-[#0969DA] focus:ring-[#0969DA]"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-[#1F2328] block">
                      I have verified the repository license
                    </span>
                    <span className="text-[#59636E] text-[11px]">
                      The source code contains a valid LICENSE file granting the right to fork, maintain, and publish updates.
                    </span>
                  </div>
                </label>
              </div>
            )}

            {/* Step 2: Repository Handover Type */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setHandoverType("canonical_fork")}
                    className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer ${
                      handoverType === "canonical_fork"
                        ? "bg-[#DDF4FF]/40 border-[#0969DA] shadow-xs"
                        : "bg-white border-[#D1D9E0] hover:bg-[#F6F8FA]"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <GitFork className="w-4 h-4 text-[#0969DA]" />
                      <span className="text-xs font-bold font-mono text-[#1F2328]">
                        Canonical Fork
                      </span>
                    </div>
                    <p className="text-[11px] text-[#59636E] leading-relaxed">
                      Original repo remains archived; you establish a new active community fork as upstream.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHandoverType("org_transfer")}
                    className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer ${
                      handoverType === "org_transfer"
                        ? "bg-[#DDF4FF]/40 border-[#0969DA] shadow-xs"
                        : "bg-white border-[#D1D9E0] hover:bg-[#F6F8FA]"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <ShieldCheck className="w-4 h-4 text-[#1F883D]" />
                      <span className="text-xs font-bold font-mono text-[#1F2328]">
                        GitHub Org Transfer
                      </span>
                    </div>
                    <p className="text-[11px] text-[#59636E] leading-relaxed">
                      Original owner transfers repository admin rights directly to your GitHub organization.
                    </p>
                  </button>
                </div>

                <div>
                  <label className="text-xs font-mono text-[#59636E] block mb-1 font-semibold">
                    New Active Repository / Fork URL
                  </label>
                  <Input
                    type="url"
                    placeholder="https://github.com/my-org/revived-repo"
                    value={targetRepoUrl}
                    onChange={(e) => setTargetRepoUrl(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Package & Credential Transfer */}
            {step === 3 && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-[#F6F8FA] border border-[#D1D9E0] text-xs text-[#59636E]">
                  Coordinate with the original author to transfer external namespaces and hosting handles:
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 p-3 rounded-lg border border-[#D1D9E0] bg-white cursor-pointer hover:bg-[#F6F8FA]">
                    <input
                      type="checkbox"
                      checked={npmTransferred}
                      onChange={(e) => setNpmTransferred(e.target.checked)}
                      className="rounded border-[#D1D9E0] text-[#0969DA]"
                    />
                    <span className="text-xs text-[#1F2328]">
                      NPM / PyPI Package Ownership Transferred (or new scope declared)
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-lg border border-[#D1D9E0] bg-white cursor-pointer hover:bg-[#F6F8FA]">
                    <input
                      type="checkbox"
                      checked={domainTransferred}
                      onChange={(e) => setDomainTransferred(e.target.checked)}
                      className="rounded border-[#D1D9E0] text-[#0969DA]"
                    />
                    <span className="text-xs text-[#1F2328]">
                      Domain DNS / CNAME Pointers Updated (or new domain assigned)
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-lg border border-[#D1D9E0] bg-white cursor-pointer hover:bg-[#F6F8FA]">
                    <input
                      type="checkbox"
                      checked={hostingTransferred}
                      onChange={(e) => setHostingTransferred(e.target.checked)}
                      className="rounded border-[#D1D9E0] text-[#0969DA]"
                    />
                    <span className="text-xs text-[#1F2328]">
                      Hosting & Secrets (Vercel / Cloudflare / Neon) re-keyed
                    </span>
                  </label>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-[#59636E] block mb-1">
                    Transfer Handover Notes (optional)
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Forked as @secondspark-community/driver with fresh npm publish tokens"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="text-xs h-8"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Founder Emeritus Acknowledgement */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-[#D1D9E0] bg-[#FFF8C5]/40 text-xs text-[#1F2328] space-y-2">
                  <div className="flex items-center gap-2 font-bold font-mono text-[#9A6700]">
                    <Award className="w-4 h-4" />
                    <span>Founder Emeritus Covenant</span>
                  </div>
                  <p className="text-[11px] text-[#59636E] leading-relaxed">
                    By completing this protocol, you pledge to preserve permanent attribution to the original author (<strong>{project.author?.name || "Original Creator"}</strong>). Their name will be forever enshrined as <em>Founder Emeritus</em> on SecondSpark.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-[#D1D9E0] bg-white space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#59636E]">Original Founder:</span>
                    <span className="font-bold font-mono text-[#1F2328]">{project.author?.name || "Creator"}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#59636E]">New Lead Maintainer:</span>
                    <span className="font-bold font-mono text-[#0969DA]">You (Adopting Maintainer)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#59636E]">New Status:</span>
                    <span className="font-bold font-mono text-[#1F883D]">Revived & Active</span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-[#D1D9E0]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStep((Math.max(1, step - 1) as 1 | 2 | 3 | 4))}
                disabled={step === 1 || isSubmitting}
                className="text-xs gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </Button>

              {step < 4 ? (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleNext}
                  disabled={step === 1 && !licenseVerified}
                  className="text-xs gap-1.5"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleFinalize}
                  disabled={isSubmitting}
                  className="text-xs gap-1.5 bg-[#1F883D] hover:bg-[#1a7f37] border-[#1F883D]"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? "Finalizing Handover..." : "Finalize Adoption & Revive"}</span>
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
