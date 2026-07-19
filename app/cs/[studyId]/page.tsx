import { getStudy, getCardsForStudy, getCategoriesForStudy } from "@/lib/db/sorting";
import { CardSortRunner } from "@/components/public/CardSortRunner";

export const dynamic = "force-dynamic";

export default async function CardSortParticipantPage({ params }: { params: Promise<{ studyId: string }> }) {
  const { studyId } = await params;

  let study;
  try {
    study = await getStudy(studyId);
  } catch {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream px-6 text-center">
        <p className="max-w-[420px] text-[14px] text-ink-soft">This study doesn&rsquo;t exist, or the link is invalid.</p>
      </div>
    );
  }
  if (study.type !== "card_sort") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream px-6 text-center">
        <p className="max-w-[420px] text-[14px] text-ink-soft">This link is for a different kind of study.</p>
      </div>
    );
  }

  const [cards, categories] = await Promise.all([getCardsForStudy(studyId), getCategoriesForStudy(studyId)]);

  return (
    <CardSortRunner
      studyId={study.id}
      instructions={study.instructions ?? ""}
      sortMode={(study.sort_mode as "open" | "closed") ?? "open"}
      cards={cards.map((c) => ({ id: c.id, label: c.label }))}
      categories={categories.map((c) => ({ id: c.id, parent_id: c.parent_id, label: c.label, position: c.position }))}
    />
  );
}
