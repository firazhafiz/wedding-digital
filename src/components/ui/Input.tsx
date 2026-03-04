"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-charcoal-light tracking-wide uppercase font-body"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full px-4 py-3 bg-transparent border border-gold/30 rounded-md text-charcoal font-body",
            "placeholder:text-charcoal-light/50",
            "focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30",
            "transition-all duration-300",
            error &&
              "border-red-400 focus:border-red-400 focus:ring-red-400/30",
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-400 font-body">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
export default Input;
