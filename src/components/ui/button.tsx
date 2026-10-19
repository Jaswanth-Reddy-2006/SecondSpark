import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-md transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0969DA]/30 focus-visible:border-[#0969DA] disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer";

    const variantStyles = {
      // GitHub Action Green
      primary:
        "bg-[#1F883D] hover:bg-[#1A7F37] active:bg-[#156C2E] text-white shadow-2xs border border-[#1B7C35] hover:border-[#156C2E]",
      // GitHub Standard Subdued Button
      secondary:
        "bg-[#F6F8FA] hover:bg-[#EFF2F5] active:bg-[#E6EBF0] text-[#1F2328] border border-[#D1D9E0] hover:border-[#AFB8C1] shadow-2xs",
      // White Outline
      outline:
        "border border-[#D1D9E0] hover:border-[#AFB8C1] bg-white hover:bg-[#F6F8FA] text-[#1F2328] shadow-2xs",
      // Ghost / Subdued Text Button
      ghost:
        "bg-transparent hover:bg-[#F6F8FA] text-[#59636E] hover:text-[#1F2328]",
      // Primer Destructive Action
      danger:
        "bg-[#FFEBE9] hover:bg-[#FFE3E0] active:bg-[#FCD8D4] text-[#D1242F] border border-[#FF8182]/50 hover:border-[#D1242F] shadow-2xs",
    };

    const sizeStyles = {
      sm: "text-xs px-2.5 py-1.5 gap-1.5 leading-none",
      md: "text-sm px-3.5 py-1.5 gap-2 leading-tight",
      lg: "text-sm px-4 py-2 gap-2 font-medium leading-normal",
      icon: "p-1.5 w-8 h-8",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
