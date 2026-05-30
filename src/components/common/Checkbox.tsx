import React, { forwardRef } from "react";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = "", label, id, ...props }, ref) => {
    const defaultId = id || `checkbox-${Math.random().toString(36).substring(2, 9)}`;
    return (
      <div className="flex items-center gap-1.5">
        <input
          ref={ref}
          type="checkbox"
          id={defaultId}
          className={`w-4 h-4 rounded text-primary border-border bg-background focus:ring-primary ${className}`}
          {...props}
        />
        {label && (
          <label htmlFor={defaultId} className="text-xs text-muted-foreground cursor-pointer select-none">
            {label}
          </label>
        )}
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";
