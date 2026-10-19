"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SecondSparkLogo } from "@/components/brand/SecondSparkLogo";

// GitHub Brand Icon for external repository links
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

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#D1D9E0] bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group focus:outline-none">
            <SecondSparkLogo variant="wordmark" size={24} />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#59636E]">
            <Link
              href="#preview"
              className="hover:text-[#1F2328] transition-colors"
            >
              Product
            </Link>
            <Link
              href="#how-it-works"
              className="hover:text-[#1F2328] transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/community"
              className="text-[#0969DA] font-semibold hover:underline transition-colors"
            >
              Community Graveyard
            </Link>
            <Link
              href="/dashboard"
              className="hover:text-[#1F2328] transition-colors"
            >
              Personal Vault
            </Link>
            <Link
              href="#features"
              className="hover:text-[#1F2328] transition-colors"
            >
              Features
            </Link>
          </nav>

          {/* Right Action Controls */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-[#59636E] hover:text-[#1F2328] hover:bg-[#F6F8FA] rounded-md transition-colors"
              aria-label="GitHub Repository"
            >
              <GitHubIcon className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-[#1F2328] hover:text-[#0969DA] px-2.5 py-1.5 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium text-[#59636E] hover:text-[#1F2328] px-2.5 py-1.5 transition-colors"
            >
              Create Account
            </Link>
            <Link href="/dashboard">
              <Button size="sm" variant="primary" className="font-medium shadow-2xs gap-1.5">
                <span>Explore the Graveyard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-[#59636E] hover:text-[#1F2328] hover:bg-[#F6F8FA] focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#D1D9E0] bg-white px-4 pt-3 pb-5 space-y-2 shadow-sm">
          <Link
            href="#preview"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-[#1F2328] hover:bg-[#F6F8FA]"
          >
            Product
          </Link>
          <Link
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-[#1F2328] hover:bg-[#F6F8FA]"
          >
            How It Works
          </Link>
          <Link
            href="/community"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-semibold text-[#0969DA] bg-[#DDF4FF]/40 hover:bg-[#DDF4FF]"
          >
            Community Graveyard
          </Link>
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-[#1F2328] hover:bg-[#F6F8FA]"
          >
            Personal Vault
          </Link>
          <Link
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-[#1F2328] hover:bg-[#F6F8FA]"
          >
            Features
          </Link>
          <div className="pt-2 border-t border-[#D1D9E0]/60 space-y-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-[#1F2328] hover:bg-[#F6F8FA]"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-[#59636E] hover:bg-[#F6F8FA]"
            >
              Create Account
            </Link>
            <div className="pt-1">
              <Link href="/dashboard" className="w-full">
                <Button size="md" variant="primary" className="w-full">
                  Explore the Graveyard
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
