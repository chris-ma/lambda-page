import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 border-2 border-ink px-5 py-3 font-display text-sm font-semibold shadow-[4px_4px_0_var(--color-ink)] transition-transform duration-150 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--color-ink)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_var(--color-ink)]";

const variants: Record<Variant, string> = {
  // Ink text on mustard — brand bible's own demo used paper-on-mustard, which
  // fails WCAG AA (2.09:1). Ink text is the corrected, passing combination.
  primary: "bg-mustard text-ink",
  ghost: "bg-paper text-ink",
};

export function Button({
  variant = "primary",
  className,
  href,
  ...props
}: ComponentPropsWithoutRef<"button"> & { variant?: Variant; href?: string }) {
  const classes = cn(base, variants[variant], className);
  if (href) {
    return (
      <Link href={href} className={classes}>
        {props.children}
      </Link>
    );
  }
  return <button className={classes} {...props} />;
}
