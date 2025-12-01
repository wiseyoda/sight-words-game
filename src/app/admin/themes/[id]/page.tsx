import { ThemeEditorPage } from "@/components/admin/ThemeEditorPage";

export const dynamic = "force-dynamic";

export default async function AdminThemeEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ThemeEditorPage themeId={id} />;
}
