import Link from "next/link";
import { LambdaMark } from "@/components/ui/LambdaMark";

const LINKS = [
  { href: "/dashboard", label: "Pages" },
  { href: "/dashboard/pre-build", label: "Pre-Build (00)" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <div className="sticky top-0 z-40 border-b-2 border-ink bg-paper">
        <div className="mx-auto flex h-[68px] max-w-[1180px] items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <LambdaMark size={30} />
            <span className="font-mono text-[11px] tracking-wide text-ink">LAMBDA PAGE</span>
          </Link>
          <nav className="flex items-center gap-6">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="font-body text-[13.5px] text-ink-soft hover:text-ink">
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
