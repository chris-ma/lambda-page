import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  hover = true,
  ...props
}: ComponentPropsWithoutRef<"div"> & { hover?: boolean }) {
  return (
    <div
      className={cn("border-2 border-ink bg-paper", hover && "depth", !hover && "shadow-[6px_6px_0_rgba(51,42,34,0.16)]", className)}
      {...props}
    />
  );
}
