import { Nav } from "@/components/marketing/Nav";
import { atlasSans, atlasMono } from "@/components/atlas/fonts";
import "@/app/atlas.css";

// Forced to paper mode for now, rather than the instrument-dark default:
// most dashboard pages haven't been migrated off the old ink-on-paper
// tokens yet, and those read as near-black text that would go illegible on
// an instrument-dark background. Drop this once every dashboard page has
// been converted and the theme toggle can safely default to dark here too.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`atlas ${atlasSans.variable} ${atlasMono.variable} flex min-h-screen min-w-0 flex-col`}
      data-theme="light"
      style={{ background: "var(--atlas-surface)" }}
    >
      <Nav themeSwitchable={false} />
      <main className="mx-auto w-full min-w-0 max-w-[1180px] flex-1 px-6 py-10">{children}</main>
    </div>
  );
}
