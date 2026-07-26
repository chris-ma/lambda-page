import { Nav } from "@/components/marketing/Nav";
import { Footer } from "@/components/marketing/Footer";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { LambdaMark } from "@/components/ui/LambdaMark";
import { atlasSans, atlasMono } from "@/components/atlas/fonts";
import "@/app/atlas.css";

export function PlaceholderPage({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div className={`atlas ${atlasSans.variable} ${atlasMono.variable} flex min-h-screen flex-col`} data-theme="light">
      <Nav themeSwitchable={false} />
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-28 text-center">
        <LambdaMark size={48} />
        <EyebrowLabel className="mt-8 justify-center">{eyebrow}</EyebrowLabel>
        <h1 className="mt-4 font-display text-[32px] font-semibold text-ink">{title}</h1>
        <p className="mx-auto mt-4 max-w-[440px] text-[14.5px] text-ink-soft">{body}</p>
      </main>
      <Footer />
    </div>
  );
}
