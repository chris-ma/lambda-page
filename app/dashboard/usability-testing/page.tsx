import Link from "next/link";
import { listUsabilityTests } from "@/lib/db/usability";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function UsabilityTestingHub() {
  const tests = await listUsabilityTests();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <EyebrowLabel>Pillar 03 — User Testing</EyebrowLabel>
          <h1 className="mt-3 font-display text-[28px] font-semibold text-ink">Usability Testing</h1>
          <p className="mt-2 max-w-[620px] text-[13.5px] text-ink-soft">
            Give a recruited participant a task and a unique link, install a snippet on the site
            under test, and see exactly what that one person did — page by page, click by click.
          </p>
        </div>
        <Button href="/dashboard/usability-testing/new">New test</Button>
      </div>

      {tests.length === 0 ? (
        <Card hover={false} className="mt-10 border-dashed p-10 text-center">
          <div className="font-display text-[16px] font-semibold text-ink">No usability tests yet</div>
          <p className="mx-auto mt-2 max-w-none text-[13.5px] text-ink-soft">
            Define a task and a site, install the snippet, and generate participant links.
          </p>
        </Card>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tests.map((t) => (
            <Link key={t.id} href={`/dashboard/usability-testing/${t.id}`}>
              <Card className="h-full p-5">
                <span className="font-display text-[15px] font-semibold text-ink">{t.name}</span>
                <p className="mt-2 truncate font-mono text-[10.5px] text-ink-soft">{t.target_url}</p>
                <p className="mt-1 font-mono text-[10px] text-ink-soft">{new Date(t.created_at).toLocaleString()}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
