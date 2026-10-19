"use client";

import React from "react";
import Link from "next/link";
import {
  Layers,
  Compass,
  Settings,
  X,
  LogOut,
  FolderGit2,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { SecondSparkLogo } from "@/components/brand/SecondSparkLogo";

interface DashboardSidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function DashboardSidebar({
  currentTab,
  onSelectTab,
  mobileOpen = false,
  onCloseMobile,
}: DashboardSidebarProps) {
  const { user, signOut } = useAuth();

  const navItems = [
    { id: "overview", label: "Overview", icon: FolderGit2 },
    { id: "graveyard", label: "My Graveyard", icon: Layers },
    { id: "compass", label: "Revival Compass", icon: Compass },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const handleNavClick = (id: string) => {
    onSelectTab(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#FFFFFF] border-r border-[#D1D9E0] text-[#1F2328]">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-[#D1D9E0] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 focus:outline-none">
          <SecondSparkLogo variant="wordmark" size={22} />
        </Link>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-md text-[#59636E] hover:text-[#1F2328] hover:bg-[#F6F8FA]"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <div className="flex-1 px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-[#59636E] font-medium">
          Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors cursor-pointer text-left select-none",
                isActive
                  ? "bg-[#F6F8FA] text-[#1F2328] font-semibold border-l-3 border-[#1F883D] shadow-2xs"
                  : "text-[#59636E] hover:text-[#1F2328] hover:bg-[#F6F8FA]"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={cn(
                    "w-4 h-4",
                    isActive ? "text-[#1F883D]" : "text-[#59636E]"
                  )}
                />
                <span>{item.label}</span>
              </div>
            </button>
          );
        })}

        <div className="pt-3 mt-3 border-t border-[#D1D9E0]/60 space-y-1">
          <div className="px-3 pb-1 text-[10px] font-mono uppercase tracking-wider text-[#59636E] font-medium">
            Community Ecosystem
          </div>
          <Link
            href="/community"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs sm:text-sm font-medium text-[#0969DA] bg-[#DDF4FF]/40 border border-[#54AEFF]/30 hover:bg-[#DDF4FF] transition-colors"
          >
            <Globe className="w-4 h-4 text-[#0969DA]" />
            <span>Community Graveyard</span>
          </Link>
        </div>
      </div>

      {/* User Info & Real Sign Out */}
      <div className="p-3.5 border-t border-[#D1D9E0] bg-[#F6F8FA] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-white border border-[#D1D9E0] flex items-center justify-center text-xs font-semibold text-[#1F2328] shrink-0">
              {user?.avatar || "DR"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#1F2328] truncate">
                {user?.name || "Developer"}
              </p>
              <p className="text-[11px] font-mono text-[#59636E] truncate">
                {user?.email || "developer@example.com"}
              </p>
            </div>
          </div>

          <button
            onClick={() => signOut()}
            title="Sign out of SecondSpark"
            className="p-1.5 rounded-md text-[#59636E] hover:text-[#D1242F] hover:bg-[#FFEBE9] transition-colors cursor-pointer"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-[#1F2328]/40 backdrop-blur-2xs"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 max-w-[80vw] h-full z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
