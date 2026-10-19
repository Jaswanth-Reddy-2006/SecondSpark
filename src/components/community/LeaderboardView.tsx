"use client";

import React, { useEffect, useState } from "react";
import {
  Trophy,
  Award,
  Sparkles,
  Flame,
  Compass,
  ShieldCheck,
  CheckCircle,
  Crown,
  Zap,
  CheckCircle2,
} from "lucide-react";

interface LeaderboardUser {
  rank: number;
  id: string;
  name: string;
  handle: string;
  avatar: string;
  image?: string | null;
  xp: number;
  level: number;
  progressPercent: number;
  projectsCount: number;
  tasksCompleted: number;
  suggestionsAccepted: number;
  reviewsSubmitted: number;
  badges: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt: string;
  }>;
}

interface LeaderboardData {
  leaderboard: LeaderboardUser[];
  metrics: {
    totalXp: number;
    totalTasksCompleted: number;
    totalSuggestionsAccepted: number;
    totalProjectsRevived: number;
  };
  availableBadges: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    xpReward: number;
  }>;
}

const BADGE_ICONS: Record<string, React.ElementType> = {
  Sparkles,
  Flame,
  Compass,
  ShieldCheck,
  CheckCircle,
  Crown,
  Award,
};

export function LeaderboardView() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch("/api/community/leaderboard");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to load leaderboard:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="inline-block w-6 h-6 border-2 border-[#0969DA] border-t-transparent rounded-full animate-spin mb-2" />
        <p className="text-xs text-[#59636E]">Loading Revival Champions &amp; Gamification Ledger...</p>
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalXp: 0,
    totalTasksCompleted: 0,
    totalSuggestionsAccepted: 0,
    totalProjectsRevived: 0,
  };

  const users = data?.leaderboard || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Metrics Header Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-lg bg-white border border-[#D1D9E0] shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-md bg-[#FFF8C5] border border-[#D4A72C]/30 text-[#9A6700]">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-[#1F2328]">{metrics.totalXp.toLocaleString()}</div>
            <div className="text-[11px] text-[#59636E]">Total Experience (XP)</div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-white border border-[#D1D9E0] shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-md bg-[#DAFBE8] border border-[#1F883D]/30 text-[#1F883D]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-[#1F2328]">{metrics.totalTasksCompleted}</div>
            <div className="text-[11px] text-[#59636E]">Blocker Tasks Smashed</div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-white border border-[#D1D9E0] shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-md bg-[#DDF4FF] border border-[#0969DA]/30 text-[#0969DA]">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-[#1F2328]">{metrics.totalSuggestionsAccepted}</div>
            <div className="text-[11px] text-[#59636E]">Accepted Architecture Pivots</div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-white border border-[#D1D9E0] shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-md bg-[#FFEBE9] border border-[#CF222E]/30 text-[#CF222E]">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-[#1F2328]">{metrics.totalProjectsRevived}</div>
            <div className="text-[11px] text-[#59636E]">Projects Fully Revived</div>
          </div>
        </div>
      </div>

      {/* Main Leaderboard & Badges Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Leaderboard Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#D1D9E0]">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#D4A72C]" />
              <h3 className="font-semibold text-sm text-[#1F2328]">Top Revival Champions</h3>
            </div>
            <span className="text-xs text-[#59636E] font-mono">Ranked by Contribution XP</span>
          </div>

          <div className="rounded-lg border border-[#D1D9E0] bg-white overflow-hidden shadow-sm">
            {users.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#59636E]">
                No community contributions recorded yet. Submit a review or claim a task to top the leaderboard!
              </div>
            ) : (
              <div className="divide-y divide-[#D1D9E0]">
                {users.map((user) => {
                const isTop1 = user.rank === 1;
                const isTop2 = user.rank === 2;
                const isTop3 = user.rank === 3;

                return (
                  <div
                    key={user.id}
                    className={`p-3.5 flex items-center justify-between gap-3 hover:bg-[#F6F8FA] transition-colors ${
                      isTop1 ? "bg-[#FFF8C5]/15" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Rank Indicator */}
                      <div className="w-7 text-center shrink-0">
                        {isTop1 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#FFF8C5] border border-[#D4A72C] text-[#9A6700] text-xs font-bold font-mono">
                            1
                          </span>
                        ) : isTop2 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#F6F8FA] border border-[#D1D9E0] text-[#59636E] text-xs font-bold font-mono">
                            2
                          </span>
                        ) : isTop3 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#FFEBE9] border border-[#D1D9E0] text-[#9A6700] text-xs font-bold font-mono">
                            3
                          </span>
                        ) : (
                          <span className="text-xs font-mono text-[#59636E] font-medium">{user.rank}</span>
                        )}
                      </div>

                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full bg-[#1F2328] text-white flex items-center justify-center text-xs font-mono font-bold shrink-0">
                        {user.avatar}
                      </div>

                      {/* User Info */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-[#1F2328] truncate">{user.name}</span>
                          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-medium bg-[#DDF4FF] text-[#0969DA] border border-[#0969DA]/20">
                            Lvl {user.level}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#59636E] font-mono flex items-center gap-2">
                          <span>{user.handle}</span>
                          <span>•</span>
                          <span>{user.tasksCompleted} tasks</span>
                          <span>•</span>
                          <span>{user.suggestionsAccepted} pivots</span>
                        </div>
                      </div>
                    </div>

                    {/* XP & Badges Unlocked */}
                    <div className="flex items-center gap-3 shrink-0">
                      {user.badges.length > 0 && (
                        <div className="hidden sm:flex items-center gap-1">
                          {user.badges.slice(0, 3).map((b) => {
                            const IconComponent = BADGE_ICONS[b.icon] || Award;
                            return (
                              <div
                                key={b.id}
                                title={`${b.name}: ${b.description}`}
                                className="w-6 h-6 rounded bg-[#F6F8FA] border border-[#D1D9E0] flex items-center justify-center text-[#1F883D]"
                              >
                                <IconComponent className="w-3.5 h-3.5" />
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div className="text-right">
                        <span className="text-sm font-bold font-mono text-[#1F2328] block">
                          {user.xp} <span className="text-[10px] font-normal text-[#59636E]">XP</span>
                        </span>
                        <div className="w-16 h-1 rounded-full bg-[#D1D9E0] overflow-hidden mt-0.5">
                          <div
                            className="h-full bg-[#1F883D] rounded-full"
                            style={{ width: `${user.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        </div>

        {/* Right 1 Col: Community Badges System */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#D1D9E0]">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#1F883D]" />
              <h3 className="font-semibold text-sm text-[#1F2328]">Revival Achievements</h3>
            </div>
            <span className="text-[11px] text-[#59636E]">Unlockable Badges</span>
          </div>

          <div className="space-y-2.5">
            {data?.availableBadges.map((badge) => {
              const IconComp = BADGE_ICONS[badge.icon] || Award;
              return (
                <div
                  key={badge.id}
                  className="p-3 rounded-lg border border-[#D1D9E0] bg-white hover:border-[#0969DA]/40 transition-colors space-y-1.5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-md bg-[#F6F8FA] border border-[#D1D9E0] flex items-center justify-center text-[#1F883D]">
                        <IconComp className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-[#1F2328]">{badge.name}</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-[#1F883D] bg-[#DAFBE8] px-1.5 py-0.5 rounded">
                      +{badge.xpReward} XP
                    </span>
                  </div>
                  <p className="text-[11px] text-[#59636E] leading-relaxed pl-9">
                    {badge.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
