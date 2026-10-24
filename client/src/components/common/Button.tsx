import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
};

export function Button({ variant = "primary", className = "", ...props }: Props) {
  const styles = {
    primary: "bg-ink text-paper hover:bg-pine",
    ghost: "bg-white/70 text-ink border border-ink/10 hover:bg-white",
    danger: "bg-clay text-paper hover:bg-clay/90",
  }[variant];

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${styles} ${className}`}
      {...props}
    />
  );
}
