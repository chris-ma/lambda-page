import { redirect } from "next/navigation";

export default async function BehavioralIndex({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;
  redirect(`/dashboard/pages/${pageId}/behavioral/analytics`);
}
