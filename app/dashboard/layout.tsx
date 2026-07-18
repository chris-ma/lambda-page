import Link from "next/link";
import { LambdaMark } from "@/components/ui/LambdaMark";

const LINKS = [
  { href: "/dashboard", label: "Pages" },
  { href: "/dashboard/pre-build", label: "Pre-Build (00)" },
  { href: "/dashboard/eye-tracking", label: "Eye Tracking (03)" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <div className="sticky top-0 z-40 border-b-2 border-ink bg-paper">
        <div className="mx-auto flex h-[68px] max-w-[1180px] items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <LambdaMark size={30} />
            <span className="hidden font-mono text-[11px] tracking-wide text-ink sm:inline">LAMBDA PAGE</span>
          </Link>
          <nav className="flex items-center gap-4 overflow-x-auto sm:gap-6">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="shrink-0 whitespace-nowrap font-body text-[13px] text-ink-soft hover:text-ink sm:text-[13.5px]">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      <main className="mx-auto w-full max-w-[1180px] flex-1 px-6 py-10">{children}</main>
    </div>
  );
}
