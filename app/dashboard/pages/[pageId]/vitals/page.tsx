import { redirect } from "next/navigation";

export default async function VitalsRedirect({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;
  redirect(`/dashboard/pages/${pageId}/seo`);
}
