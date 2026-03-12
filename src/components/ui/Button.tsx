"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "relative inline-flex items-center justify-center font-body font-medium tracking-wider uppercase whitespace-nowrap transition-all duration-300 ease-premium focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary:
        "bg-gold text-white hover:bg-gold-dark active:bg-gold-dark shadow-lg shadow-gold/20 hover:shadow-xl hover:shadow-gold/30",
      secondary:
        "bg-charcoal-dark text-off-white hover:bg-charcoal active:bg-charcoal",
      outline:
        "border border-gold text-gold hover:bg-gold hover:text-white active:bg-gold-dark",
      ghost: "text-charcoal hover:text-gold hover:bg-gold/5 active:bg-gold/10",
    };

    const sizes = {
      sm: "px-4 py-2 text-xs rounded",
      md: "px-6 py-3 text-sm rounded-md",
      lg: "px-8 py-4 text-base rounded-md",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              className="opacity-25"
            />
            <path
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              fill="currentColor"
              className="opacity-75"
            />
          </svg>
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
export default Button;
