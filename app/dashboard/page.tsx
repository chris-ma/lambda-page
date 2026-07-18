import Link from "next/link";
import { listPages } from "@/lib/db/pages";
import { AddPageForm } from "@/components/dashboard/AddPageForm";
import { Card } from "@/components/ui/Card";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const pages = await listPages();

  return (
    <div>
      <EyebrowLabel>Diagnostic Workspace</EyebrowLabel>
      <h1 className="mt-3 font-display text-[30px] font-semibold text-ink">Connect a page</h1>
      <p className="mt-2 max-w-[560px] text-[14px] text-ink-soft">
        Paste a URL. No code changes required to get a first read — structural checks run
        immediately.
      </p>
      <div className="mt-6 max-w-[720px]">
        <AddPageForm />
      </div>

      <h2 className="mt-14 font-display text-[19px] font-semibold text-ink">Tracked pages</h2>

      {pages.length === 0 ? (
        <Card hover={false} className="mt-4 border-dashed p-10 text-center">
          <div className="font-display text-[16px] font-semibold text-ink">No pages tracked yet</div>
          <p className="mx-auto mt-2 max-w-none text-[13.5px] text-ink-soft">
            Add a landing page above to run the first diagnostic.
          </p>
        </Card>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pages.map((p) => (
            <Link key={p.id} href={`/dashboard/pages/${p.id}`}>
              <Card className="h-full p-5">
                <div className="truncate font-display text-[15px] font-semibold text-ink">{p.url}</div>
                <p className="mt-2 font-mono text-[10.5px] text-ink-soft">
                  Connected {new Date(p.created_at).toLocaleDateString()}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
