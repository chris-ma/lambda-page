import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  hover = true,
  ...props
}: ComponentPropsWithoutRef<"div"> & { hover?: boolean }) {
  return (
    <div
      className={cn("border-2 border-ink bg-paper transition-colors duration-150", hover && "hover:bg-cream", className)}
      {...props}
    />
  );
}
