import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost";

const base =
  "sheen texture inline-flex items-center justify-center gap-2 border-2 border-ink px-5 py-3 font-display text-sm font-semibold shadow-depth-sm transition-[transform,box-shadow] duration-150 ease-out hover:-translate-y-0.5 hover:shadow-depth-md active:translate-y-px active:shadow-depth-press active:duration-75";

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
