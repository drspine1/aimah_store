"use client";
import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  /** Current rating value (0–5) */
  value: number;
  /** Called when user clicks a star */
  onChange?: (rating: number) => void;
  /** Read-only display mode */
  readOnly?: boolean;
  size?: number;
  className?: string;
}

export function StarRating({
  value,
  onChange,
  readOnly = false,
  size = 20,
  className,
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0);

  const display = hovered || value;

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          className={cn(
            "transition-transform",
            !readOnly && "hover:scale-110 cursor-pointer",
            readOnly && "cursor-default"
          )}
          aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
        >
          <Star
            size={size}
            className={
              star <= display
                ? "fill-amber-400 text-amber-400"
                : "text-stone-200 fill-stone-100"
            }
          />
        </button>
      ))}
    </div>
  );
}
