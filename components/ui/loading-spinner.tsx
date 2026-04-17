/**
 * LoadingSpinner — thin wrapper kept for backwards compatibility.
 * Delegates to the new themed loader components.
 */
import { FullScreenLoader, InlineLoader } from "@/components/ui/loader";

interface LoadingSpinnerProps {
  fullScreen?: boolean;
}

export function LoadingSpinner({ fullScreen = true }: LoadingSpinnerProps) {
  return fullScreen ? <FullScreenLoader /> : <InlineLoader />;
}
