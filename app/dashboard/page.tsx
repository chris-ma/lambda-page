import Link from "next/link";
import { listPages } from "@/lib/db/pages";
import { AddPageForm } from "@/components/dashboard/AddPageForm";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const pages = await listPages();

  return (
    <div>
      <div className="atlas-annot">diagnostic workspace</div>
      <h1 className="mt-3 text-[28px]" style={{ fontWeight: 560 }}>
        Connect a page
      </h1>
      <p className="mt-2 max-w-[560px] text-[14px]" style={{ color: "var(--atlas-ink-soft)" }}>
        Paste a URL. No code changes required to get a first read — structural checks run
        immediately.
      </p>
      <div className="mt-6 max-w-[720px]">
        <AddPageForm />
      </div>

      <h2 className="mt-14 text-[18px]" style={{ fontWeight: 540 }}>
        Tracked pages
      </h2>

      {pages.length === 0 ? (
        <div className="mt-4 p-10 text-center" style={{ border: "1px dashed var(--atlas-line-strong)" }}>
          <div className="text-[15px]" style={{ fontWeight: 540 }}>
            No pages tracked yet
          </div>
          <p className="mx-auto mt-2 max-w-none text-[13.5px]" style={{ color: "var(--atlas-ink-soft)" }}>
            Add a landing page above to run the first diagnostic.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid gap-px sm:grid-cols-2 lg:grid-cols-3" style={{ background: "var(--atlas-line)" }}>
          {pages.map((p) => (
            <Link key={p.id} href={`/dashboard/pages/${p.id}`} className="atlas-focusable p-5" style={{ background: "var(--atlas-bg)" }}>
              <div className="truncate text-[14.5px]" style={{ fontWeight: 540 }}>
                {p.url}
              </div>
              <p className="atlas-annot mt-2">Connected {new Date(p.created_at).toLocaleDateString()}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
