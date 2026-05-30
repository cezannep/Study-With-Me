import React, { forwardRef } from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "white" | "zinc";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", children, ...props }, ref) => {
    let variantClass = "";
    if (variant === "primary") variantClass = "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md font-semibold";
    else if (variant === "secondary") variantClass = "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-md font-semibold";
    else if (variant === "danger") variantClass = "bg-red-600 hover:bg-red-500 text-white font-bold";
    else if (variant === "ghost") variantClass = "bg-transparent text-foreground hover:bg-muted";
    else if (variant === "white") variantClass = "bg-white text-zinc-950 font-bold hover:bg-zinc-100";
    else if (variant === "zinc") variantClass = "bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white";

    let sizeClass = "";
    if (size === "sm") sizeClass = "px-3 py-1.5 text-xs";
    else if (size === "md") sizeClass = "px-4 py-2 text-sm";
    else if (size === "lg") sizeClass = "px-5 py-3 text-base";

    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variantClass} ${sizeClass} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
