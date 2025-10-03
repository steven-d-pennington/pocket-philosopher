import * as React from "react";

import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-base md:text-sm ring-offset-background",
          "placeholder:text-muted-foreground/60 placeholder:italic focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-all duration-200 hover:border-primary/20",
          "touch-manipulation", // Improve touch interaction
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";
