import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "ink";

const base =
  "inline-flex items-center justify-center gap-2 border-2 border-ink px-5 py-3 font-mono text-[12.5px] font-semibold tracking-[0.08em] uppercase transition-opacity duration-150 hover:opacity-80 active:opacity-70";

const variants: Record<Variant, string> = {
  // Ink text on terracotta — white text only reaches ~4.2:1 here, just under
  // WCAG AA for text this size, so ink stays the corrected, passing choice.
  primary: "bg-terracotta text-ink",
  ghost: "bg-paper text-ink",
  // Solid ink fill — the highest-contrast CTA, reserved for the single most
  // important action on a page (the hero's primary diagnostic run).
  ink: "bg-ink text-paper",
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
