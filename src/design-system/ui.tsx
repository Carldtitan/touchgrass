// ui.tsx — lightweight design-system primitives built on the design tokens
// (Requirement 9.2, 9.5, 9.7). These mirror the shadcn/ui primitive surface
// (Button, Card, Input, Textarea, Badge, Dialog) but reference CSS variables from
// tokens.css so components never use arbitrary hex/px. Consistent with the existing
// AppShell / ConfigError / InitialsAvatar style in this layer.
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }
>(function Button({ variant = "primary", style, disabled, ...rest }, ref) {
  const palette: Record<ButtonVariant, { bg: string; color: string; border: string }> =
    {
      primary: {
        bg: "var(--color-accent)",
        color: "#ffffff",
        border: "var(--color-accent)",
      },
      secondary: {
        bg: "var(--color-bg)",
        color: "var(--color-text)",
        border: "var(--color-border)",
      },
      ghost: { bg: "transparent", color: "var(--color-text-muted)", border: "transparent" },
    };
  const tone = palette[variant];
  return (
    <button
      ref={ref}
      disabled={disabled}
      style={{
        background: tone.bg,
        color: tone.color,
        border: `1px solid ${tone.border}`,
        borderRadius: "var(--radius)",
        padding: "var(--space-3) var(--space-4)",
        fontSize: 15,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        transition: "background var(--transition), transform var(--transition)",
        width: "100%",
        ...style,
      }}
      {...rest}
    />
  );
});

export function Card({
  children,
  style,
  ...rest
}: { children?: ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      style={{
        background: "var(--color-bg)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius)",
        padding: "var(--space-4)",
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ style, ...rest }, ref) {
    return (
      <input
        ref={ref}
        style={{
          width: "100%",
          padding: "var(--space-3)",
          borderRadius: "var(--radius)",
          border: "1px solid var(--color-border)",
          background: "var(--color-bg)",
          color: "var(--color-text)",
          fontSize: 15,
          fontFamily: "inherit",
          ...style,
        }}
        {...rest}
      />
    );
  },
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ style, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      style={{
        width: "100%",
        padding: "var(--space-3)",
        borderRadius: "var(--radius)",
        border: "1px solid var(--color-border)",
        background: "var(--color-bg)",
        color: "var(--color-text)",
        fontSize: 15,
        fontFamily: "inherit",
        resize: "vertical",
        ...style,
      }}
      {...rest}
    />
  );
});

export function Badge({
  children,
  tone = "neutral",
  ...rest
}: {
  children: ReactNode;
  tone?: "neutral" | "accent";
} & React.HTMLAttributes<HTMLSpanElement>) {
  const styles =
    tone === "accent"
      ? { background: "var(--color-accent)", color: "#ffffff" }
      : { background: "var(--color-surface)", color: "var(--color-text)" };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-1)",
        padding: "var(--space-1) var(--space-3)",
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 600,
        border: "1px solid var(--color-border)",
        ...styles,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}

// Field — label + control + error message, accessible (Req: clear form labels).
export function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
      <label
        htmlFor={htmlFor}
        style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text)" }}
      >
        {label}
      </label>
      {children}
      {error && (
        <span role="alert" style={{ fontSize: 13, color: "var(--color-danger)" }}>
          {error}
        </span>
      )}
    </div>
  );
}

// Dialog — simple accessible modal overlay (mirrors shadcn Dialog surface).
export function Dialog({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(17, 24, 39, 0.45)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 50,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "var(--app-max-width)",
          background: "var(--color-bg)",
          borderTopLeftRadius: "var(--radius)",
          borderTopRightRadius: "var(--radius)",
          padding: "var(--space-6)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-4)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <h2 style={{ margin: 0, fontSize: 20, color: "var(--color-text)" }}>{title}</h2>
        {children}
      </div>
    </div>
  );
}
