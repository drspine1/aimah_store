"use client";
import React from "react";
import Link from "next/link";
import { NoiseBackground } from "@/components/ui/noise-background";
import { cn } from "@/lib/utils";

// Chocolate-themed gradient colours for the noise background
const CHOCOLATE_GRADIENTS = [
  "rgb(146, 64, 14)",   // amber-800
  "rgb(217, 119, 6)",   // amber-600
  "rgb(180, 83, 9)",    // orange-700
];

interface CtaButtonProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  /** Use "primary" for filled chocolate, "outline" for bordered */
  variant?: "primary" | "outline";
  type?: "button" | "submit";
  disabled?: boolean;
}

export function CtaButton({
  href,
  onClick,
  children,
  className,
  variant = "primary",
  type = "button",
  disabled,
}: CtaButtonProps) {
  const inner = (
    <NoiseBackground
      containerClassName="w-full sm:w-fit rounded-xl p-[3px]"
      gradientColors={CHOCOLATE_GRADIENTS}
      noiseIntensity={0.15}
      speed={0.08}
    >
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={cn(
          // Brutal shadow base
          "relative w-full px-8 py-2.5 text-sm font-semibold uppercase tracking-wide transition-all duration-150",
          "border-2 shadow-[2px_2px_rgba(0,0,0),4px_4px_rgba(0,0,0),6px_6px_0px_0px_rgba(0,0,0)]",
          "active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-x-0 disabled:active:translate-y-0",
          variant === "primary"
            ? "bg-amber-800 text-amber-50 border-amber-950 shadow-[2px_2px_rgba(69,26,3),4px_4px_rgba(69,26,3),6px_6px_0px_0px_rgba(69,26,3)] hover:bg-amber-700"
            : "bg-amber-50 text-amber-900 border-amber-900 shadow-[2px_2px_rgba(69,26,3),4px_4px_rgba(69,26,3),6px_6px_0px_0px_rgba(69,26,3)] hover:bg-amber-100",
          className
        )}
      >
        {children}
      </button>
    </NoiseBackground>
  );

  if (href) {
    return <Link href={href} className="w-full sm:w-auto">{inner}</Link>;
  }

  return inner;
}
