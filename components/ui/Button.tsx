import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "ink";

const base =
  "sheen texture inline-flex items-center justify-center gap-2 border-2 border-ink px-5 py-3 font-mono text-[12.5px] font-semibold tracking-[0.08em] uppercase shadow-depth-sm transition-[transform,box-shadow] duration-150 ease-out hover:-translate-y-0.5 hover:shadow-depth-md active:translate-y-px active:shadow-depth-press active:duration-75";

const variants: Record<Variant, string> = {
  // Ink text on mustard — brand bible's own demo used paper-on-mustard, which
  // fails WCAG AA (2.09:1). Ink text is the corrected, passing combination.
  primary: "bg-mustard text-ink",
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
