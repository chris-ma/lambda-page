import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto bg-cream px-6 py-14 text-center">
      <div className="mx-auto flex max-w-[900px] flex-wrap items-center justify-center gap-8 font-body text-[13px] text-ink-soft">
        <Link href="/dashboard">Product</Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/docs">Docs</Link>
        <Link href="/privacy">Privacy</Link>
      </div>
      <p className="mt-8 font-mono text-[11px] tracking-wide text-ink-soft">
        LAMBDA PAGE — DIAGNOSTIC TOOLKIT
      </p>
    </footer>
  );
}
