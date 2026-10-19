import React from "react";
import { Terminal, Shield, GitBranch, Search, Zap, Code2 } from "lucide-react";

export function FeatureHighlights() {
  const features = [
    {
      icon: <Terminal className="w-4 h-4 text-[#1F883D]" />,
      title: "Context-Preserving Tombstones",
      description:
        "Capture environment variables, runtime flags, architecture trade-offs, and why you stepped away before mental context decays.",
    },
    {
      icon: <Search className="w-4 h-4 text-[#1F883D]" />,
      title: "Archaeological Code Search",
      description:
        "Search through archived projects for hard-to-find implementations: bespoke WebGL shaders, niche CLI parsers, or WebAuthn flows.",
    },
    {
      icon: <GitBranch className="w-4 h-4 text-[#1F883D]" />,
      title: "Revival Compass",
      description:
        "Rule-based evaluation of maintenance status, code completion ratios, and migration paths to contemporary language targets.",
    },
    {
      icon: <Zap className="w-4 h-4 text-[#1F883D]" />,
      title: "Adopt-a-Project Transfer",
      description:
        "Hand off orphaned repositories to passionate builders with explicit licenses, contributor guidelines, and verified ownership transfers.",
    },
    {
      icon: <Shield className="w-4 h-4 text-[#1F883D]" />,
      title: "Private Vaults and Open Catalogs",
      description:
        "Keep proprietary side projects and business experiments private while surfacing generic utilities and components to the public community.",
    },
    {
      icon: <Code2 className="w-4 h-4 text-[#1F883D]" />,
      title: "Developer Workflow",
      description:
        "Engineered for developers who despise corporate bloatware. Clean keyboard shortcuts, markdown notes, and fast client-side navigation.",
    },
  ];

  return (
    <section id="features" className="py-16 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mb-12">
        <span className="text-xs font-mono uppercase tracking-wider text-[#1F883D] font-semibold">
          Engineered for Builders
        </span>
        <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#1F2328]">
          Everything needed to preserve and resurrect dormant code
        </h2>
        <p className="mt-2.5 text-sm text-[#59636E]">
          Stop letting good code die in hidden directories. Treat unfinished software as an asset, not a regret.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className="p-5 rounded-lg border border-[#D1D9E0] bg-white hover:border-[#AFB8C1] shadow-2xs transition-all"
          >
            <div className="w-8 h-8 rounded-md bg-[#F6F8FA] border border-[#D1D9E0] flex items-center justify-center mb-3.5">
              {feature.icon}
            </div>
            <h3 className="text-sm font-semibold text-[#1F2328] tracking-tight mb-1.5">
              {feature.title}
            </h3>
            <p className="text-xs text-[#59636E] leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
