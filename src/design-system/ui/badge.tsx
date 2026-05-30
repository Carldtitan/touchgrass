// Badge — shadcn/ui primitive wired to the token theme (Req 9.5).
import * as React from "react";
import { cn } from "../cn";

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement>;

export function Badge({ className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-token bg-accent px-2 py-1 text-sm font-medium text-bg",
        className,
      )}
      {...props}
    />
  );
}
