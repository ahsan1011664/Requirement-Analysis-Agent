"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

import { extractClarificationQuestions, useProject } from "@/hooks/use-project";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function WorkspacePage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const { project, loading, error, refresh } = useProject(projectId);
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [actionError, setActionError] = useState<string | null>(null);

  const questions = project ? extractClarificationQuestions(project) : [];

  async function handleAnalyze() {
    setAnalyzing(true);
    setActionError(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/analyze`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Analysis failed");
      await refresh();
    } catch (err) {
      setActionError(String(err));
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleSubmitAnswers() {
    setSubmitting(true);
    setActionError(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/clarify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Generation failed");
      await refresh();
    } catch (err) {
      setActionError(String(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <Alert variant="warning">
        <AlertTitle>Unable to load workspace</AlertTitle>
        <AlertDescription>{error ?? "Project not found"}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <Card>
        <CardHeader>
          <CardTitle>AI Workspace</CardTitle>
          <CardDescription>
            Run the LangGraph analyst workflow, answer clarification questions, and
            track generated artefacts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {actionError && (
            <Alert variant="warning">
              <AlertTitle>Action failed</AlertTitle>
              <AlertDescription>{actionError}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleAnalyze} disabled={analyzing || project.status === "complete"}>
              {analyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {project.status === "draft" ? "Start AI Analysis" : "Re-run Analysis"}
                </>
              )}
            </Button>
            <Badge variant="secondary">{project.conversations.length} messages</Badge>
          </div>

          <div className="max-h-[32rem] space-y-3 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-4">
            {project.conversations.length === 0 ? (
              <p className="text-sm text-slate-500">
                No conversation yet. Start analysis to begin the BA workflow.
              </p>
            ) : (
              project.conversations.map((message) => (
                <div
                  key={message.id}
                  className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${
                    message.role === "user"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-950"
                      : "border-blue-200 bg-blue-50 text-blue-950"
                  }`}
                >
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wide opacity-70">
                    {message.role}
                  </div>
                  <pre className="whitespace-pre-wrap font-sans">{message.message}</pre>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Clarification Questions</CardTitle>
          <CardDescription>
            The clarification agent asks targeted questions before generating the full SRS.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.length === 0 ? (
            <Alert variant="info">
              <AlertTitle>No open questions</AlertTitle>
              <AlertDescription>
                Run analysis first. Questions appear here when important information is missing.
              </AlertDescription>
            </Alert>
          ) : (
            questions.map((question) => (
              <label key={question} className="block space-y-2">
                <span className="text-sm font-medium text-slate-800">{question}</span>
                <textarea
                  className="input-field min-h-[5rem] resize-none"
                  value={answers[question] ?? ""}
                  onChange={(event) =>
                    setAnswers((current) => ({
                      ...current,
                      [question]: event.target.value,
                    }))
                  }
                  placeholder="Your answer..."
                />
              </label>
            ))
          )}

          {questions.length > 0 && (
            <Button
              onClick={handleSubmitAnswers}
              disabled={submitting || project.status === "complete"}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating SRS...
                </>
              ) : (
                "Submit Answers & Generate SRS"
              )}
            </Button>
          )}

          {project.status === "complete" && (
            <Alert variant="success">
              <AlertTitle>Workflow complete</AlertTitle>
              <AlertDescription>
                Review requirements, database design, risks, and the final SRS in the other tabs.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
