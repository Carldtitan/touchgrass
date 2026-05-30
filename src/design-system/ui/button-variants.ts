// button-variants — cva definition kept separate so button.tsx only exports a
// component (fast-refresh clean). Wired to the token theme (Req 9.5, 9.7).
import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-token font-sans font-medium transition-colors duration-token focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-accent text-bg hover:bg-accent-hover",
        outline: "border border-border bg-bg text-text hover:bg-surface",
        ghost: "bg-transparent text-text hover:bg-surface",
      },
      size: {
        md: "h-10 px-4 text-base",
        sm: "h-8 px-3 text-sm",
        lg: "h-12 px-6 text-lg",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);
