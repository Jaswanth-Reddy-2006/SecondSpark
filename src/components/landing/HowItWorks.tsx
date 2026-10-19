import React from "react";
import { Archive, Cpu, Sparkles } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Preserve",
      heading: "Archive code with architectural memory",
      description:
        "Don't let valuable code rot in a forgotten local directory. Document the original vision, tech stack choices, blockers, and an honest post-mortem of why development stopped.",
      icon: <Archive className="w-5 h-5 text-[#1F883D]" />,
      tag: "Tombstone Vault",
    },
    {
      number: "02",
      title: "Evaluate",
      heading: "Diagnose tech debt & revival viability",
      description:
        "Evaluate code completion rates, dependency staleness, and architectural completeness. Determine exactly what is needed to bring the prototype back to life.",
      icon: <Cpu className="w-5 h-5 text-[#1F883D]" />,
      tag: "Revival Compass",
    },
    {
      number: "03",
      title: "Revive",
      heading: "Resurrect or pass the torch",
      description:
        "Jump back in with preserved context, hand off maintainership to eager contributors, or release your groundwork under open licenses for another developer to finish.",
      icon: <Sparkles className="w-5 h-5 text-[#1F883D]" />,
      tag: "Second Spark",
    },
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-20 border-b border-[#D1D9E0] bg-[#F6F8FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-mono uppercase tracking-wider text-[#1F883D] font-semibold">
            The Three-Step Lifecycle
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#1F2328]">
            From buried repo to second spark
          </h2>
          <p className="mt-2.5 text-sm text-[#59636E] leading-relaxed">
            A structured engineering framework designed to save high-value software prototypes from eternal oblivion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative rounded-lg border border-[#D1D9E0] bg-white p-6 transition-all duration-150 hover:border-[#AFB8C1] shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-md bg-[#F6F8FA] border border-[#D1D9E0] flex items-center justify-center">
                    {step.icon}
                  </div>
                  <span className="text-2xl font-mono font-bold text-[#D1D9E0]">
                    {step.number}
                  </span>
                </div>

                <div className="inline-block px-2 py-0.5 rounded text-[11px] font-mono bg-[#F6F8FA] text-[#1F2328] border border-[#D1D9E0] mb-2.5 font-medium">
                  {step.tag}
                </div>

                <h3 className="text-base font-semibold text-[#1F2328] tracking-tight mb-1">
                  {step.title}
                </h3>
                <h4 className="text-xs font-medium text-[#59636E] mb-2.5">
                  {step.heading}
                </h4>
                <p className="text-xs text-[#59636E] leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-[#D1D9E0]/50 flex items-center text-[11px] font-mono text-[#59636E]">
                <span>Phase {step.number} of Resurgence</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
