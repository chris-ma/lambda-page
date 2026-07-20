import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  hover = true,
  ...props
}: ComponentPropsWithoutRef<"div"> & { hover?: boolean }) {
  return (
    <div
      className={cn("texture sheen border-2 border-ink bg-paper", hover ? "depth" : "shadow-depth-md", className)}
      {...props}
    />
  );
}
