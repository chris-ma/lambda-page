import Link from "next/link";
import { listFiveSecondTests } from "@/lib/db/five-second";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function FiveSecondHub() {
  const tests = await listFiveSecondTests();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <EyebrowLabel>Pillar 03 — User Testing</EyebrowLabel>
          <h1 className="mt-3 font-display text-[28px] font-semibold text-ink">5-Second Test</h1>
          <p className="mt-2 max-w-[620px] text-[13.5px] text-ink-soft">
            First-impression recall — upload a screenshot, write your questions, and see what
            people remember after a five-second glance.
          </p>
        </div>
        <Button href="/dashboard/five-second/new">New test</Button>
      </div>

      {tests.length === 0 ? (
        <Card hover={false} className="mt-10 border-dashed p-10 text-center">
          <div className="font-display text-[16px] font-semibold text-ink">No 5-second tests yet</div>
          <p className="mx-auto mt-2 max-w-none text-[13.5px] text-ink-soft">
            Upload a screenshot and a few questions to get a shareable participant link.
          </p>
        </Card>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tests.map((t) => (
            <Link key={t.id} href={`/dashboard/five-second/${t.id}`}>
              <Card className="h-full p-5">
                <span className="font-display text-[15px] font-semibold text-ink">{t.name}</span>
                <p className="mt-2 font-mono text-[10px] text-ink-soft">{new Date(t.created_at).toLocaleString()}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
