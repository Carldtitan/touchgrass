// Input — shadcn/ui primitive wired to the token theme (Req 9.5).
import * as React from "react";
import { cn } from "../cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-token border border-border bg-bg px-3 py-2 text-base text-text transition-colors duration-token placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";
