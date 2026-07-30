export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectNav, WorkflowProgress } from "@/components/project-nav";
import { Badge } from "@/components/ui/badge";
import { getProjectDetail } from "@/lib/persistence";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectDetail(id);

  if (!project) {
    notFound();
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="surface-panel p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <Link
                href="/"
                className="text-sm text-slate-500 transition-colors hover:text-blue-700"
              >
                ← Back to home
              </Link>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">
                  {project.title}
                </h1>
                <Badge variant={project.status === "complete" ? "success" : "default"}>
                  {project.status}
                </Badge>
              </div>
              <p className="max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
                {project.description}
              </p>
            </div>
            <div className="w-full max-w-xl">
              <WorkflowProgress status={project.status} />
            </div>
          </div>
          <div className="mt-6">
            <ProjectNav projectId={project.id} />
          </div>
        </section>
        {children}
      </div>
    </main>
  );
}
