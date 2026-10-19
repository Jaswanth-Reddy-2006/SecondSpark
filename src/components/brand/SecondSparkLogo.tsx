import React from "react";
import { cn } from "@/lib/utils";

export interface SecondSparkLogoProps extends React.SVGProps<SVGSVGElement> {
  variant?: "icon" | "wordmark" | "monogram";
  size?: number;
  className?: string;
  theme?: "default" | "monochrome" | "light" | "dark";
  withTagline?: boolean;
}

/**
 * SecondSparkLogo - The official brand emblem for SecondSpark: The Project Graveyard.
 *
 * Geometric Concept:
 * An open repository / archive vault silhouette with a four-point resurgence spark
 * ascending from the center, symbolizing dormant code re-ignited into active development.
 * Designed to render with crisp clarity at 16px, 24px, 32px, and 48px+.
 */
export function SecondSparkLogo({
  variant = "wordmark",
  size,
  className,
  theme = "default",
  withTagline = false,
  ...props
}: SecondSparkLogoProps) {
  const iconSize = size || (variant === "icon" ? 24 : variant === "monogram" ? 28 : 26);

  // SVG Mark (Icon)
  const renderIcon = (s: number = iconSize) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
      aria-label="SecondSpark Mark"
      {...props}
    >
      {/* Repository / Vault Base Container */}
      <path
        d="M5 12C5 10.8954 5.89543 10 7 10H11L13 12H25C26.1046 12 27 12.8954 27 14V24C27 25.1046 26.1046 26 25 26H7C5.89543 26 5 25.1046 5 24V12Z"
        fill={theme === "monochrome" ? "currentColor" : "#F6F8FA"}
        stroke={theme === "monochrome" ? "currentColor" : "#1F883D"}
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Vault Code Notch / Repository Flap Opening */}
      <path
        d="M8 17H24M12 21H20"
        stroke={theme === "monochrome" ? "currentColor" : "#D1D9E0"}
        strokeWidth="1.75"
        strokeLinecap="round"
      />

      {/* Resurgence Spark: 4-Point Ascending Beacon */}
      <path
        d="M16 2L17.8 7.2L23 9L17.8 10.8L16 16L14.2 10.8L9 9L14.2 7.2L16 2Z"
        fill={theme === "monochrome" ? "currentColor" : "#1F883D"}
      />

      {/* Core Energy Nexus */}
      <circle
        cx="16"
        cy="9"
        r="1.25"
        fill={theme === "monochrome" ? "none" : "#FFFFFF"}
      />

      {/* Orbiting Resurgence Embers */}
      <circle
        cx="24.5"
        cy="5.5"
        r="1"
        fill={theme === "monochrome" ? "currentColor" : "#2DA44E"}
      />
      <circle
        cx="7.5"
        cy="6.5"
        r="0.8"
        fill={theme === "monochrome" ? "currentColor" : "#2DA44E"}
      />
    </svg>
  );

  if (variant === "icon") {
    return (
      <div className={cn("inline-flex items-center justify-center", className)}>
        {renderIcon()}
      </div>
    );
  }

  if (variant === "monogram") {
    return (
      <div
        className={cn(
          "inline-flex items-center justify-center rounded-md border border-[#D1D9E0] bg-[#F6F8FA] p-1.5 shadow-2xs hover:border-[#1F883D] transition-colors",
          className
        )}
        title="SecondSpark"
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle outer shield */}
          <rect
            x="2"
            y="2"
            width="28"
            height="28"
            rx="6"
            fill="#FFFFFF"
            stroke="#D1D9E0"
            strokeWidth="1.5"
          />
          {/* Central SS Glyphs with Spark Integration */}
          <path
            d="M9 11C9 9.89543 9.89543 9 11 9H14C15.1046 9 16 9.89543 16 11V12.5C16 13.6046 15.1046 14.5 14 14.5H11C9.89543 14.5 9 15.3954 9 16.5V18C9 19.1046 9.89543 20 11 20H15"
            stroke="#1F2328"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M17 12H21C22.1046 12 23 12.8954 23 14V15.5C23 16.6046 22.1046 17.5 21 17.5H18C16.8954 17.5 16 18.3954 16 19.5V21C16 22.1046 16.8954 23 18 23H22"
            stroke="#1F883D"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Monogram Spark */}
          <path
            d="M23 5L24 7.5L26.5 8.5L24 9.5L23 12L22 9.5L19.5 8.5L22 7.5L23 5Z"
            fill="#1F883D"
          />
        </svg>
      </div>
    );
  }

  // Horizontal Wordmark
  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      <div className="flex items-center justify-center p-1 rounded-md border border-[#D1D9E0] bg-[#FFFFFF] shadow-2xs hover:border-[#1F883D] transition-colors">
        {renderIcon(iconSize)}
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className="font-semibold text-[15px] tracking-tight text-[#1F2328]">
            Second<span className="text-[#1F883D]">Spark</span>
          </span>
          <span className="text-[10px] font-mono uppercase tracking-wider font-medium px-1.5 py-0.5 rounded border border-[#D1D9E0] bg-[#F6F8FA] text-[#59636E]">
            Graveyard
          </span>
        </div>

        {withTagline && (
          <span className="text-[11px] font-mono text-[#59636E] mt-0.5">
            The Project Graveyard
          </span>
        )}
      </div>
    </div>
  );
}

export default SecondSparkLogo;
