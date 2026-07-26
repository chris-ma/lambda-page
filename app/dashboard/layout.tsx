import { Nav } from "@/components/marketing/Nav";
import { atlasSans, atlasMono } from "@/components/atlas/fonts";
import "@/app/atlas.css";

// The theme toggle switches the whole dashboard now, not just pages that
// have been individually converted: atlas.css redefines the old --color-ink/
// paper/cream/line/status custom properties for instrument (dark) mode, so
// every component still built on the original ink-on-paper Tailwind classes
// (text-ink, bg-paper, text-teal-deep, ...) re-themes automatically since
// those utilities compile straight to var(--color-x). Paper mode needs no
// override — the originals already are that look.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`atlas ${atlasSans.variable} ${atlasMono.variable} flex min-h-screen min-w-0 flex-col`}
      style={{ background: "var(--atlas-surface)" }}
    >
      <Nav />
      <main className="mx-auto w-full min-w-0 max-w-[1180px] flex-1 px-6 py-10">{children}</main>
    </div>
  );
}
