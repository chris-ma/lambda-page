import Link from "next/link";
import { getStudy } from "@/lib/db/sorting";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { Tag } from "@/components/ui/Tag";
import { ShareLink } from "@/components/dashboard/ShareLink";
import { CardSortResults } from "@/components/dashboard/CardSortResults";
import { TreeTestResults } from "@/components/dashboard/TreeTestResults";

export const dynamic = "force-dynamic";

export default async function StudyDetail({ params }: { params: Promise<{ studyId: string }> }) {
  const { studyId } = await params;
  const study = await getStudy(studyId);
  const isCardSort = study.type === "card_sort";

  return (
    <div>
      <Link href="/dashboard/card-sorting" className="font-mono text-[11px] text-ink-soft">
        ← Card Sorting & Tree Testing
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <EyebrowLabel>Pillar 03 — User Testing</EyebrowLabel>
        <Tag status="INFO" label={isCardSort ? "Card sort" : "Tree test"} size="sm" />
      </div>
      <h1 className="mt-2 font-display text-[26px] font-semibold text-ink">{study.name}</h1>
      {study.instructions && <p className="mt-2 max-w-[620px] text-[13.5px] text-ink-soft">&ldquo;{study.instructions}&rdquo;</p>}

      <div className="mt-6">
        <ShareLink path={isCardSort ? `/cs/${study.id}` : `/tree/${study.id}`} />
      </div>

      {isCardSort ? <CardSortResults studyId={study.id} /> : <TreeTestResults studyId={study.id} />}
    </div>
  );
}
