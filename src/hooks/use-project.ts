"use client";

import { useCallback, useEffect, useState } from "react";

import type { ProjectDetail } from "@/lib/types";

export function useProject(projectId: string) {
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/projects/${projectId}`);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error ?? "Failed to load project");
      }

      setProject(json.project);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { project, loading, error, refresh };
}

export function extractClarificationQuestions(project: ProjectDetail): string[] {
  const clarificationMessage = [...project.conversations]
    .reverse()
    .find((c) => c.role === "assistant" && c.message.startsWith("Clarification needed:"));

  if (!clarificationMessage) return [];

  return clarificationMessage.message
    .split("\n")
    .slice(1)
    .map((line) => line.replace(/^\d+\.\s*/, "").trim())
    .filter(Boolean);
}
