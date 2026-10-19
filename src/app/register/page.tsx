"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SecondSparkLogo } from "@/components/brand/SecondSparkLogo";
import {
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Info,
} from "lucide-react";

// Official GitHub Mark for OAuth button
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

export default function RegisterPage() {
  const router = useRouter();
  const { signUpWithCredentials, signInWithGitHub } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Full name is required.";
    } else if (name.trim().length < 2) {
      newErrors.name = "Full name must be at least 2 characters.";
    }

    if (!email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setOauthError(null);

    if (!validate()) return;

    setIsLoading(true);
    const result = await signUpWithCredentials(name, email, password);
    setIsLoading(false);

    if (result.success) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setErrors({ form: result.error || "Registration failed." });
    }
  };

  const handleGitHubAuth = async () => {
    setOauthError(null);
    setIsLoading(true);
    const result = await signInWithGitHub();
    setIsLoading(false);

    if (result.requiresConfig) {
      setOauthError(
        "GitHub OAuth integration requires GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET configured in .env.local. Refer to .env.example for instructions."
      );
    } else if (!result.success && result.error) {
      setOauthError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8FA] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand & Logo Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 group mb-5 focus:outline-none"
        >
          <SecondSparkLogo variant="icon" size={32} />
        </Link>

        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#1F2328]">
          Create your account
        </h1>
        <p className="mt-1 text-xs text-[#59636E]">
          Join SecondSpark to preserve repositories and uncover revival opportunities.
        </p>
      </div>

      {/* Registration Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-6 px-6 sm:px-7 border border-[#D1D9E0] rounded-md shadow-2xs space-y-5">
          {/* Form Error Notice */}
          {errors.form && (
            <div className="p-3 rounded-md bg-[#FFEBE9] border border-[#FF8182]/50 flex items-start gap-2.5 text-xs text-[#D1242F]">
              <AlertCircle className="w-4 h-4 text-[#D1242F] shrink-0 mt-0.5" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* OAuth Notice */}
          {oauthError && (
            <div className="p-3 rounded-md bg-[#FFF8C5] border border-[#D4A72C]/40 flex items-start gap-2.5 text-xs text-[#9A6700]">
              <Info className="w-4 h-4 text-[#9A6700] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-semibold">OAuth Notice</p>
                <p className="leading-relaxed">{oauthError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-3.5">
            {/* Full Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-semibold text-[#1F2328] mb-1"
              >
                Full name
              </label>
              <Input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Ada Lovelace"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                }}
                className={errors.name ? "border-[#D1242F] focus-visible:border-[#D1242F]" : ""}
                required
              />
              {errors.name && (
                <p className="mt-1 text-xs text-[#D1242F] flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-[#1F2328] mb-1"
              >
                Email address
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="ada@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                }}
                className={errors.email ? "border-[#D1242F] focus-visible:border-[#D1242F]" : ""}
                required
              />
              {errors.email && (
                <p className="mt-1 text-xs text-[#D1242F] flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-[#1F2328] mb-1"
              >
                Password <span className="text-[#59636E] font-normal font-mono">(min. 8 characters)</span>
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password)
                      setErrors((prev) => ({ ...prev, password: "" }));
                  }}
                  className={`pr-9 ${
                    errors.password ? "border-[#D1242F] focus-visible:border-[#D1242F]" : ""
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#59636E] hover:text-[#1F2328]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-[#D1242F] flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold text-[#1F2328] mb-1"
              >
                Confirm password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword)
                      setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                  }}
                  className={`pr-9 ${
                    errors.confirmPassword
                      ? "border-[#D1242F] focus-visible:border-[#D1242F]"
                      : ""
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#59636E] hover:text-[#1F2328]"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-[#D1242F] flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center mt-2"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create Account"}
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#D1D9E0]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2.5 text-[#59636E] font-mono text-[10px]">
                or
              </span>
            </div>
          </div>

          {/* GitHub OAuth Button */}
          <Button
            type="button"
            variant="secondary"
            onClick={handleGitHubAuth}
            disabled={isLoading}
            className="w-full justify-center gap-2"
          >
            <GitHubIcon className="w-4 h-4 text-[#1F2328]" />
            <span>Continue with GitHub</span>
          </Button>

          {/* Sign In Link */}
          <div className="p-3 rounded-md border border-[#D1D9E0] bg-[#F6F8FA] text-center text-xs text-[#59636E]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-[#0969DA] hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
