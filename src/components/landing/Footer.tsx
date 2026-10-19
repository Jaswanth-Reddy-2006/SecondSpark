"use client";

import React from "react";
import Link from "next/link";
import { SecondSparkLogo } from "@/components/brand/SecondSparkLogo";

// GitHub Brand Icon
function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-[#D1D9E0] bg-[#F6F8FA] py-12 text-[#59636E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Logo & Mission */}
          <div className="space-y-3">
            <Link href="/" className="inline-block focus:outline-none">
              <SecondSparkLogo variant="wordmark" size={22} withTagline />
            </Link>
            <p className="text-xs text-[#59636E] leading-relaxed max-w-xs">
              Preserving abandoned software repositories, diagnosing viability, and creating opportunities for code resurgence.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-xs font-mono uppercase text-[#1F2328] font-semibold mb-3 tracking-wider">
              Product
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/dashboard" className="text-[#59636E] hover:text-[#0969DA] transition-colors">
                  Graveyard Dashboard
                </Link>
              </li>
              <li>
                <Link href="#preview" className="text-[#59636E] hover:text-[#0969DA] transition-colors">
                  Repository Catalog
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="text-[#59636E] hover:text-[#0969DA] transition-colors">
                  Three-Step Lifecycle
                </Link>
              </li>
              <li>
                <Link href="#features" className="text-[#59636E] hover:text-[#0969DA] transition-colors">
                  Key Features
                </Link>
              </li>
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h4 className="text-xs font-mono uppercase text-[#1F2328] font-semibold mb-3 tracking-wider">
              Account
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/login" className="text-[#59636E] hover:text-[#0969DA] transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-[#59636E] hover:text-[#0969DA] transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-[#59636E] hover:text-[#0969DA] transition-colors">
                  My Graveyard
                </Link>
              </li>
            </ul>
          </div>

          {/* Source & Developer Note */}
          <div>
            <h4 className="text-xs font-mono uppercase text-[#1F2328] font-semibold mb-3 tracking-wider">
              Ecosystem
            </h4>
            <div className="flex items-center gap-3 mb-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-md bg-white border border-[#D1D9E0] flex items-center justify-center text-[#59636E] hover:text-[#1F2328] hover:border-[#AFB8C1] transition-colors shadow-2xs"
                aria-label="GitHub Repository"
              >
                <GitHubIcon className="w-4 h-4" />
              </a>
            </div>
            <p className="text-[11px] text-[#59636E] font-mono leading-relaxed">
              Designed for developers who turn prototypes into reality.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-[#D1D9E0]/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#59636E]">
          <p>&copy; 2026 SecondSpark — The Project Graveyard. All rights reserved.</p>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>Next.js App Router</span>
            <span>•</span>
            <span>TypeScript</span>
            <span>•</span>
            <span>Tailwind CSS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
