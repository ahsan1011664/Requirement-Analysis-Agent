import { redirect } from "next/navigation";

type RouteContext = { params: Promise<{ id: string }> };

export default async function ProjectIndexPage(context: RouteContext) {
  const { id } = await context.params;
  redirect(`/projects/${id}/workspace`);
}
