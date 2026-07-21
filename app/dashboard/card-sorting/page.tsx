import Link from "next/link";
import { listStudies } from "@/lib/db/sorting";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { ToolExplainer } from "@/components/ui/ToolExplainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";

export const dynamic = "force-dynamic";

export default async function CardSortingHub() {
  const studies = await listStudies();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <EyebrowLabel>Pillar 03 — User Testing</EyebrowLabel>
          <h1 className="mt-3 font-display text-[28px] font-semibold text-ink">Card Sorting & Tree Testing</h1>
          <p className="mt-2 max-w-[640px] text-[13.5px] text-ink-soft">
            Card sorting finds the mental model people already have for your content. Tree testing
            checks whether a proposed navigation actually works — run the sort first if you&rsquo;re
            designing from scratch, or start with a tree test if you&rsquo;re fixing an existing site.
          </p>
        </div>
        <div className="flex gap-3">
          <Button href="/dashboard/card-sorting/sort/new">New card sort</Button>
          <Button href="/dashboard/card-sorting/tree/new" variant="ghost">
            New tree test
          </Button>
        </div>
      </div>

      <ToolExplainer
        what="Card sorting surfaces the mental model people already have for your content; tree testing checks whether a proposed navigation structure actually lets them find things."
        problem="Navigation and content grouping decisions are usually made by whoever's building the site, based on how they think about the product — which is rarely how a new visitor actually categorizes the same content."
        insight="Card sorting asks people to group real content with no menu system imposed on them yet, revealing their natural mental model; tree testing then validates a specific proposed structure against real find-it tasks, so the right check runs depending on whether you're designing from scratch or fixing something live."
      />

      {studies.length === 0 ? (
        <Card hover={false} className="mt-10 border-dashed p-10 text-center">
          <div className="font-display text-[16px] font-semibold text-ink">No studies yet</div>
          <p className="mx-auto mt-2 max-w-none text-[13.5px] text-ink-soft">
            Create a card sort or tree test to get a participant link.
          </p>
        </Card>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {studies.map((s) => (
            <Link key={s.id} href={`/dashboard/card-sorting/${s.id}`}>
              <Card className="h-full p-5">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-display text-[15px] font-semibold text-ink">{s.name}</span>
                  <Tag status="INFO" label={s.type === "card_sort" ? "Card sort" : "Tree test"} size="sm" />
                </div>
                <p className="mt-2 font-mono text-[10px] text-ink-soft">{new Date(s.created_at).toLocaleString()}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
