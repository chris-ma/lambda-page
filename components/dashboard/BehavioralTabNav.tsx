"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Tag } from "@/components/ui/Tag";

const TABS = [
  { slug: "analytics", label: "Analytics" },
  { slug: "heatmap", label: "Heatmap" },
  { slug: "funnel", label: "Funnel" },
] as const;

export function BehavioralTabNav({ pageId, isDemo }: { pageId: string; isDemo: boolean }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap items-center gap-3 border-b-2 border-ink pb-3">
      {TABS.map((t) => {
        const href = `/dashboard/pages/${pageId}/behavioral/${t.slug}`;
        const active = pathname === href;
        return (
          <Link
            key={t.slug}
            href={href}
            className={cn(
              "border-2 border-ink px-4 py-2 font-mono text-[11px] uppercase tracking-wide",
              active ? "hatch-fill bg-mustard text-ink" : "bg-paper text-ink-soft hover:text-ink",
            )}
          >
            {t.label}
          </Link>
        );
      })}
      {isDemo && <Tag status="INFO" label="Demo data" size="sm" className="ml-auto" />}
    </div>
  );
}
