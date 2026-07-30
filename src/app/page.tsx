"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Bot, Database, FileText, Shield, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { ProjectRow } from "@/lib/types";

const features = [
  {
    icon: Sparkles,
    title: "AI Requirement Analysis",
    description: "Extract features, users, goals, and constraints from rough ideas.",
  },
  {
    icon: Bot,
    title: "Smart Clarification",
    description: "Business-analyst style follow-up questions when information is missing.",
  },
  {
    icon: FileText,
    title: "SRS Generator",
    description: "Professional Software Requirement Specification in minutes.",
  },
  {
    icon: Database,
    title: "Database Designer",
    description: "Suggested entities and relationships for your data model.",
  },
  {
    icon: Shield,
    title: "Risk Analysis",
    description: "Identify technical and business risks with severity ratings.",
  },
];

export default function Home() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [idea, setIdea] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjectRow[]>([]);

  useEffect(() => {
    void fetch("/api/projects")
      .then((res) => res.json())
      .then((json) => setProjects(json.projects ?? []))
      .catch(() => setProjects([]));
  }, []);

  async function handleCreateProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !idea.trim()) return;

    setCreating(true);
    setError(null);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: idea.trim(),
          status: "draft",
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to create project");

      router.push(`/projects/${json.project.id}/workspace`);
    } catch (err) {
      setError(String(err));
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="surface-panel overflow-hidden p-6 md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-5">
              <Badge>SpecPilot AI v1.0</Badge>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
                Turn rough software ideas into structured requirements.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
                SpecPilot AI is an AI-powered Business Analyst that follows a structured
                LangGraph workflow — clarification, requirements, user stories, database
                design, risk analysis, and a complete SRS — stored in Supabase.
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                <span>Next.js</span>
                <span>•</span>
                <span>LangGraph</span>
                <span>•</span>
                <span>OpenAI</span>
                <span>•</span>
                <span>Supabase</span>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Start a new project</CardTitle>
                <CardDescription>
                  Describe your idea and open the AI workspace.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="warning" className="mb-4">
                    <AlertTitle>Could not create project</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <form className="space-y-4" onSubmit={handleCreateProject}>
                  <label className="space-y-2">
                    <span className="label-text">Project title</span>
                    <input
                      className="input-field"
                      placeholder="Campus food delivery app"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="label-text">Rough idea</span>
                    <textarea
                      className="input-field min-h-[8rem] resize-none"
                      placeholder="I want a food delivery app for university campuses..."
                      value={idea}
                      onChange={(e) => setIdea(e.target.value)}
                    />
                  </label>
                  <Button type="submit" disabled={creating}>
                    {creating ? "Creating..." : "Create Project"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <feature.icon className="h-5 w-5 text-blue-300" />
                <CardTitle className="text-base">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </section>

        <section className="surface-panel p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Recent projects</h2>
            <span className="text-sm text-slate-500">{projects.length} saved in Supabase</span>
          </div>
          {projects.length === 0 ? (
            <p className="text-sm text-slate-500">
              No projects yet. Create one above to begin the BA workflow.
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}/workspace`}
                  className="project-card block"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-900">{project.title}</div>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                        {project.description}
                      </p>
                    </div>
                    <Badge>{project.status}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
