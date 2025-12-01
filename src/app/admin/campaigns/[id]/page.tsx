import { CampaignEditorPage } from "@/components/admin/CampaignEditorPage";

export const dynamic = "force-dynamic";

export default async function AdminCampaignEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CampaignEditorPage campaignId={id} />;
}
