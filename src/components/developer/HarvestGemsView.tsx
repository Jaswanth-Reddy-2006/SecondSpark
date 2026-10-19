"use client";

import React, { useState } from "react";
import { Project, HarvestGem } from "@/types/project";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Package,
  Plus,
  CheckCircle2,
  Circle,
  FileCode,
  Tag,
  ExternalLink,
  Trash2,
  Sparkles,
  Layers,
  ArrowUpRight,
} from "lucide-react";

interface HarvestGemsViewProps {
  project: Project;
  onGemsUpdated?: (gems: HarvestGem[]) => void;
}

export function HarvestGemsView({ project, onGemsUpdated }: HarvestGemsViewProps) {
  const [gems, setGems] = useState<HarvestGem[]>(project.harvestGems || []);
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [path, setPath] = useState("");
  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("Utility, TypeScript");
  const [exportTarget, setExportTarget] = useState<"gist" | "npm" | "internal_copy">("npm");
  const [isLoading, setIsLoading] = useState(false);

  const toggleChecklist = async (gemId: string, itemKey: "isolated" | "tested" | "packaged") => {
    const gem = gems.find((g) => g.id === gemId);
    if (!gem) return;

    const newChecklist = {
      ...gem.checklist,
      [itemKey]: !gem.checklist[itemKey],
    };

    // Optimistic update
    const updated = gems.map((g) =>
      g.id === gemId ? { ...g, checklist: newChecklist } : g
    );
    setGems(updated);
    if (onGemsUpdated) onGemsUpdated(updated);

    try {
      await fetch(`/api/projects/${project.id}/harvest`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gemId,
          checklist: newChecklist,
        }),
      });
    } catch (err) {
      console.error("Failed to update gem checklist:", err);
    }
  };

  const handleAddGem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !path.trim()) return;

    setIsLoading(true);
    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch(`/api/projects/${project.id}/harvest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          path: path.trim(),
          description: description.trim(),
          tags,
          exportTarget,
        }),
      });

      const data = await res.json();
      if (res.ok && data.gems) {
        setGems(data.gems);
        if (onGemsUpdated) onGemsUpdated(data.gems);
        setName("");
        setPath("");
        setDescription("");
        setIsAdding(false);
      }
    } catch (err) {
      console.error("Failed to add harvest gem:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGem = async (gemId: string) => {
    const updated = gems.filter((g) => g.id !== gemId);
    setGems(updated);
    if (onGemsUpdated) onGemsUpdated(updated);

    try {
      await fetch(`/api/projects/${project.id}/harvest?gemId=${gemId}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Failed to delete gem:", err);
    }
  };

  return (
    <div className="space-y-4 py-2">
      {/* Intro Header */}
      <div className="p-4 rounded-xl bg-[#F6F8FA] border border-[#D1D9E0] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#DDF4FF] border border-[#54AEFF]/40 text-[#0969DA] flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#1F2328] uppercase font-mono tracking-wider">
              Code Harvest: Component & Subsystem Extractor
            </h4>
            <p className="text-[11px] text-[#59636E]">
              Don&apos;t let brilliant algorithms or custom UI components die with an abandoned app. Catalogue and harvest them for standalone reuse.
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={() => setIsAdding(!isAdding)}
          className="text-xs gap-1.5 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isAdding ? "Cancel" : "Harvest Module"}</span>
        </Button>
      </div>

      {/* Add Module Form */}
      {isAdding && (
        <form
          onSubmit={handleAddGem}
          className="p-4 rounded-xl bg-white border border-[#0969DA]/40 shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-bold text-[#1F2328] font-mono">
              Catalogue Harvestable Module
            </h5>
            <span className="text-[11px] text-[#59636E]">Isolate & Extract</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono text-[#59636E] block mb-1">
                Module / Feature Name *
              </label>
              <Input
                type="text"
                placeholder="e.g. OPFS SQLite VFS Layer"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="text-xs h-8"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-[#59636E] block mb-1">
                Relative File Path *
              </label>
              <Input
                type="text"
                placeholder="e.g. src/lib/vfs/opfs-driver.ts"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                required
                className="text-xs h-8"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono text-[#59636E] block mb-1">
              Description & Reuse Value
            </label>
            <Input
              type="text"
              placeholder="Why is this module valuable on its own? What does it solve?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-xs h-8"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono text-[#59636E] block mb-1">
                Tags (comma separated)
              </label>
              <Input
                type="text"
                placeholder="WASM, SQLite, Storage"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="text-xs h-8"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-[#59636E] block mb-1">
                Target Export Format
              </label>
              <select
                value={exportTarget}
                onChange={(e) => setExportTarget(e.target.value as "gist" | "npm" | "internal_copy")}
                className="w-full h-8 text-xs font-mono rounded-md border border-[#D1D9E0] bg-white px-2 text-[#1F2328]"
              >
                <option value="npm">Standalone NPM Package</option>
                <option value="gist">GitHub Gist / Snippet</option>
                <option value="internal_copy">Direct Project Extraction</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setIsAdding(false)}
              className="text-xs h-8"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              variant="primary"
              disabled={isLoading}
              className="text-xs h-8 gap-1.5"
            >
              <Package className="w-3.5 h-3.5" />
              <span>{isLoading ? "Saving..." : "Catalogue Module"}</span>
            </Button>
          </div>
        </form>
      )}

      {/* Gems List */}
      {gems.length === 0 ? (
        <div className="p-8 text-center bg-white border border-[#D1D9E0] rounded-xl">
          <Layers className="w-8 h-8 text-[#8C959F] mx-auto mb-2 opacity-50" />
          <h5 className="text-xs font-bold text-[#1F2328]">No Harvestable Modules Catalogued</h5>
          <p className="text-[11px] text-[#59636E] max-w-sm mx-auto mt-1">
            Identify valuable algorithms, hooks, or components in this repository that can be extracted into independent npm packages or gists.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {gems.map((gem) => {
            const completedCount =
              (gem.checklist.isolated ? 1 : 0) +
              (gem.checklist.tested ? 1 : 0) +
              (gem.checklist.packaged ? 1 : 0);

            return (
              <div
                key={gem.id}
                className="p-4 rounded-xl bg-white border border-[#D1D9E0] shadow-xs space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="text-xs font-bold text-[#1F2328] font-mono">
                        {gem.name}
                      </h5>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F6F8FA] border border-[#D1D9E0] text-[#59636E]">
                        Target: {gem.exportTarget?.toUpperCase()}
                      </span>
                    </div>
                    <code className="text-[11px] font-mono text-[#0969DA] mt-1 block">
                      {gem.path}
                    </code>
                    {gem.description && (
                      <p className="text-[11px] text-[#59636E] mt-1">
                        {gem.description}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteGem(gem.id)}
                    className="text-[#8C959F] hover:text-[#CF222E] transition-colors p-1"
                    title="Remove gem"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Tags */}
                {gem.tags && gem.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {gem.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F6F8FA] text-[#59636E] border border-[#D1D9E0]/60"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* 3-Point Extraction Checklist */}
                <div className="pt-2 border-t border-[#D1D9E0]/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      onClick={() => toggleChecklist(gem.id, "isolated")}
                      className="flex items-center gap-1.5 cursor-pointer text-[11px] font-mono hover:text-[#0969DA]"
                    >
                      {gem.checklist.isolated ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#1F883D]" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-[#8C959F]" />
                      )}
                      <span className={gem.checklist.isolated ? "text-[#1F2328]" : "text-[#59636E]"}>
                        Zero External State
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleChecklist(gem.id, "tested")}
                      className="flex items-center gap-1.5 cursor-pointer text-[11px] font-mono hover:text-[#0969DA]"
                    >
                      {gem.checklist.tested ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#1F883D]" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-[#8C959F]" />
                      )}
                      <span className={gem.checklist.tested ? "text-[#1F2328]" : "text-[#59636E]"}>
                        Unit Tests Verified
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleChecklist(gem.id, "packaged")}
                      className="flex items-center gap-1.5 cursor-pointer text-[11px] font-mono hover:text-[#0969DA]"
                    >
                      {gem.checklist.packaged ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#1F883D]" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-[#8C959F]" />
                      )}
                      <span className={gem.checklist.packaged ? "text-[#1F2328]" : "text-[#59636E]"}>
                        Published / Exported
                      </span>
                    </button>
                  </div>

                  <span className="text-[10px] font-mono font-bold text-[#59636E]">
                    {completedCount}/3 Ready
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
