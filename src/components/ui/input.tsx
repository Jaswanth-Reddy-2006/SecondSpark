import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {icon && (
          <div className="absolute left-3 flex items-center pointer-events-none text-[#59636E]">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-8 w-full rounded-md border border-[#D1D9E0] bg-white px-3 py-1 text-sm text-[#1F2328] placeholder:text-[#8C959F] shadow-2xs transition-colors",
            "focus-visible:outline-none focus-visible:border-[#0969DA] focus-visible:ring-2 focus-visible:ring-[#0969DA]/20",
            "disabled:cursor-not-allowed disabled:bg-[#F6F8FA] disabled:text-[#8C959F]",
            icon && "pl-8.5",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";
