"use client";

import React, { createContext, useContext, useState } from "react";
import {
  SessionProvider,
  useSession,
  signIn as nextAuthSignIn,
  signOut as nextAuthSignOut,
} from "next-auth/react";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  image?: string;
  provider: "credentials" | "github";
  githubUsername?: string;
}

interface AuthContextType {
  user: UserSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isConfigured: boolean;
  signInWithCredentials: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signUpWithCredentials: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signInWithGitHub: () => Promise<{
    success: boolean;
    requiresConfig?: boolean;
    error?: string;
  }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthConsumer({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [authLoading, setAuthLoading] = useState(false);

  const isAuthenticated = status === "authenticated" && Boolean(session?.user);
  const isLoading = status === "loading" || authLoading;

  const user: UserSession | null = session?.user
    ? {
        id: session.user.id || (session.user.email ? `usr_${session.user.email}` : "usr_unknown"),
        name: session.user.name || session.user.email?.split("@")[0] || "Developer",
        email: session.user.email || "",
        image: session.user.image || undefined,
        avatar: session.user.name
          ? session.user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
          : session.user.email?.[0]?.toUpperCase() || "D",
        provider: "credentials",
      }
    : null;

  const signInWithCredentials = async (email: string, password: string) => {
    setAuthLoading(true);
    try {
      const res = await nextAuthSignIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      setAuthLoading(false);

      if (res?.error) {
        return {
          success: false,
          error: "Invalid email or password. Please verify your credentials and try again.",
        };
      }

      return { success: true };
    } catch (err: unknown) {
      setAuthLoading(false);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Authentication error.",
      };
    }
  };

  const signUpWithCredentials = async (
    name: string,
    email: string,
    password: string
  ) => {
    setAuthLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setAuthLoading(false);
        return {
          success: false,
          error: data.error || "Failed to create account.",
        };
      }

      // Automatically sign in the user after successful registration
      const signinRes = await nextAuthSignIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      setAuthLoading(false);

      if (signinRes?.error) {
        return {
          success: true,
        };
      }

      return { success: true };
    } catch (err: unknown) {
      setAuthLoading(false);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Registration failed.",
      };
    }
  };

  const signInWithGitHub = async () => {
    setAuthLoading(true);
    try {
      // Trigger genuine NextAuth GitHub OAuth flow
      await nextAuthSignIn("github", { callbackUrl: "/dashboard" });
      setAuthLoading(false);
      return { success: true };
    } catch (err: unknown) {
      setAuthLoading(false);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to initiate GitHub sign-in.",
      };
    }
  };

  const signOut = async () => {
    await nextAuthSignOut({ callbackUrl: "/login" });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        isConfigured: true,
        signInWithCredentials,
        signUpWithCredentials,
        signInWithGitHub,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthConsumer>{children}</AuthConsumer>
    </SessionProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
