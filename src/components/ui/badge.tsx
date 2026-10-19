import React from "react";
import { cn } from "@/lib/utils";
import { ProjectStatus } from "@/types/project";
import { AlertCircle, Clock, CheckCircle2, Archive } from "lucide-react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline" | "secondary" | "tech";
  status?: ProjectStatus;
  withIcon?: boolean;
}

export function Badge({
  className,
  variant = "default",
  status,
  withIcon = false,
  children,
  ...props
}: BadgeProps) {
  if (status) {
    const statusConfig: Record<
      ProjectStatus,
      { label: string; styles: string; icon: React.ReactNode }
    > = {
      Abandoned: {
        label: "Abandoned",
        styles: "bg-[#FFF8C5] text-[#9A6700] border-[#D4A72C]/40 hover:border-[#D4A72C]/70",
        icon: <AlertCircle className="w-3 h-3 text-[#9A6700] shrink-0" />,
      },
      "Under Review": {
        label: "Under Review",
        styles: "bg-[#DDF4FF] text-[#0969DA] border-[#54AEFF]/40 hover:border-[#54AEFF]/70",
        icon: <Clock className="w-3 h-3 text-[#0969DA] shrink-0" />,
      },
      Revived: {
        label: "Revived",
        styles: "bg-[#DAFBE1] text-[#1A7F37] border-[#4AC26B]/40 hover:border-[#4AC26B]/70",
        icon: <CheckCircle2 className="w-3 h-3 text-[#1A7F37] shrink-0" />,
      },
      Archived: {
        label: "Archived",
        styles: "bg-[#F6F8FA] text-[#59636E] border-[#D1D9E0] hover:border-[#AFB8C1]",
        icon: <Archive className="w-3 h-3 text-[#59636E] shrink-0" />,
      },
    };

    const config = statusConfig[status];

    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border tracking-tight transition-colors select-none",
          config.styles,
          className
        )}
        {...props}
      >
        {withIcon && config.icon}
        {children || config.label}
      </span>
    );
  }

  const variantStyles = {
    default: "bg-[#F6F8FA] text-[#1F2328] border-[#D1D9E0]",
    secondary: "bg-white text-[#59636E] border-[#D1D9E0]",
    outline: "border-[#D1D9E0] text-[#1F2328] bg-white",
    tech: "bg-[#F6F8FA] text-[#59636E] border-[#D1D9E0] hover:border-[#AFB8C1] font-mono text-[11px]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border transition-colors select-none",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
