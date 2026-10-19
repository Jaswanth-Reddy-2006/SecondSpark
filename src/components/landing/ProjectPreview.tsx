"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ArrowRight, BookMarked, Star, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178C6",
  JavaScript: "#F7DF1E",
  Python: "#3572A5",
  Rust: "#DEA584",
  Go: "#00ADD8",
  WebAssembly: "#654FF0",
  SQLite: "#003B57",
  Tailwind: "#38BDF8",
  React: "#61DAFB",
  Default: "#8C959F",
};

interface PreviewProjectItem {
  id: string;
  name: string;
  tagline: string;
  description: string;
  status: "Abandoned" | "Under Review" | "Revived" | "Archived";
  lastUpdated: string;
  completionRate: number;
  techTags: string[];
  stars?: number;
  completedFeatures: string[];
}

export function ProjectPreview() {
  const [projects, setProjects] = useState<PreviewProjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function fetchPublicProjects() {
      try {
        const res = await fetch("/api/community/projects");
        if (res.ok && !ignore) {
          const data = await res.json();
          setProjects((data.projects || []).slice(0, 3));
        }
      } catch (err) {
        console.error("Failed to fetch preview projects:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchPublicProjects();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <section id="preview" className="py-16 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-[#D1D9E0]">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#1F883D] mb-1.5 font-semibold">
            <span>Repository Graveyard Catalog</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1F2328]">
            Freshly entombed. Ready for resurgence.
          </h2>
          <p className="mt-2 text-sm text-[#59636E] max-w-xl">
            A curated glimpse of high-completion prototypes preserved with architectural post-mortems, waiting for new maintainers.
          </p>
        </div>
        <Link href="/community">
          <Button variant="outline" size="sm" className="group gap-1.5">
            <span>Explore Community Graveyard</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </Link>
      </div>

      {/* Repository Cards Grid / Empty State */}
      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-[#59636E] bg-white rounded-lg border border-[#D1D9E0]">
          Loading graveyard catalog...
        </div>
      ) : projects.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-lg border border-[#D1D9E0] space-y-3">
          <div className="w-10 h-10 rounded-full bg-[#DAFBE8] border border-[#1F883D]/30 flex items-center justify-center mx-auto text-[#1F883D]">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-[#1F2328]">The Graveyard is Ready</h3>
          <p className="text-xs text-[#59636E] max-w-md mx-auto">
            No public projects have been entombed yet. Be the first to preserve an abandoned repository or import from GitHub.
          </p>
          <div className="pt-2">
            <Link href="/dashboard">
              <Button variant="primary" size="sm">
                Entomb a Project
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map((project) => {
            const primaryLanguage = project.techTags[0] || "TypeScript";
            const langColor = LANGUAGE_COLORS[primaryLanguage] || LANGUAGE_COLORS.Default;

            return (
              <Card key={project.id} hoverEffect className="flex flex-col justify-between">
                <div>
                  <CardHeader className="p-4 sm:p-5 pb-2">
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <Badge status={project.status} withIcon />
                      <span className="text-[11px] font-mono text-[#59636E]">
                        Updated {project.lastUpdated}
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-[#0969DA] tracking-tight hover:underline flex items-center gap-2">
                      <BookMarked className="w-4 h-4 text-[#59636E] shrink-0" />
                      <span>{project.name}</span>
                    </h3>

                    <p className="text-xs text-[#59636E] font-mono mt-1 font-normal line-clamp-1">
                      {project.tagline}
                    </p>
                  </CardHeader>

                  <CardContent className="p-4 sm:p-5 pt-1 space-y-4">
                    <p className="text-xs text-[#59636E] leading-relaxed line-clamp-3">
                      {project.description}
                    </p>

                    {/* Completion Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-mono text-[#59636E]">
                        <span>Codebase Maturity</span>
                        <span className="text-[#1F2328] font-semibold">{project.completionRate}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[#D1D9E0]/50 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#1F883D] transition-all duration-300"
                          style={{ width: `${project.completionRate}%` }}
                        />
                      </div>
                    </div>

                    {/* Tech Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {project.techTags.slice(0, 4).map((tech) => (
                        <Badge key={tech} variant="tech">
                          {tech}
                        </Badge>
                      ))}
                      {project.techTags.length > 4 && (
                        <span className="text-[10px] text-[#59636E] font-mono self-center">
                          +{project.techTags.length - 4}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </div>

                <CardFooter className="justify-between text-xs text-[#59636E] font-mono border-t border-[#D1D9E0]/50 pt-3">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: langColor }}
                    />
                    <span>{primaryLanguage}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {project.stars !== undefined && (
                      <span className="flex items-center gap-1 text-[#59636E]">
                        <Star className="w-3.5 h-3.5 text-[#59636E]" />
                        {project.stars}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-[#1A7F37] font-medium">
                      <CheckCircle2 className="w-3 h-3 text-[#1F883D]" />
                      {project.completedFeatures?.length || 0} ready
                    </span>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
