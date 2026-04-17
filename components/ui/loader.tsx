"use client";
import { cn } from "@/lib/utils";

/**
 * LoaderOne — animated three-dot pulse loader in the chocolate/amber theme.
 * Matches the store's warm palette.
 */
export function LoaderOne({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block w-3 h-3 rounded-full bg-amber-700"
          style={{
            animation: `loaderPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes loaderPulse {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%            { transform: scale(1);   opacity: 1;   }
        }
      `}</style>
    </div>
  );
}

/**
 * Full-screen loader — centres LoaderOne in the viewport.
 * Drop-in replacement for the old LoadingSpinner.
 */
export function FullScreenLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-amber-50 gap-4">
      <LoaderOne />
      <p className="text-amber-700 text-sm font-medium tracking-wide animate-pulse">
        Loading…
      </p>
    </div>
  );
}

/**
 * Inline loader — centres LoaderOne in a padded block (for sections, not full screen).
 */
export function InlineLoader({ className }: { className?: string }) {
  return (
    <div className={cn("flex justify-center items-center py-12", className)}>
      <LoaderOne />
    </div>
  );
}
