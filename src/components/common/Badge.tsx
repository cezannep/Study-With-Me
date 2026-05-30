import React from "react";

export interface BadgeProps {
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "amber" | "default";
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = "default", children, className = "" }) => {
  let variantClass = "bg-zinc-850 text-zinc-300 border-zinc-700";
  if (variant === "primary") variantClass = "bg-primary/20 text-primary border-primary/30";
  else if (variant === "secondary") variantClass = "bg-secondary/10 text-secondary border-secondary/20";
  else if (variant === "success") variantClass = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
  else if (variant === "warning") variantClass = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
  else if (variant === "danger") variantClass = "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
  else if (variant === "amber") variantClass = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";

  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${variantClass} ${className}`}>
      {children}
    </span>
  );
};
