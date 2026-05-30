import React from "react";

export interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = "md", className = "" }) => {
  let sizeClass = "w-6 h-6 border-2";
  if (size === "sm") sizeClass = "w-4 h-4 border-2";
  else if (size === "lg") sizeClass = "w-12 h-12 border-4";

  return (
    <div className={`border-primary/20 border-t-primary animate-spin rounded-full ${sizeClass} ${className}`} />
  );
};
