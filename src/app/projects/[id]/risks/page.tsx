"use client";

import { useParams } from "next/navigation";

import { useProject } from "@/hooks/use-project";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function severityVariant(severity: string): "destructive" | "warning" | "success" {
  if (severity === "high") return "destructive";
  if (severity === "medium") return "warning";
  return "success";
}

export default function RisksPage() {
  const params = useParams<{ id: string }>();
  const { project, loading, error } = useProject(params.id);

  if (loading) return <Skeleton className="h-96" />;

  if (error || !project) {
    return (
      <Alert variant="warning">
        <AlertTitle>Unable to load risks</AlertTitle>
        <AlertDescription>{error ?? "Project not found"}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Risk Analysis</CardTitle>
        <CardDescription>
          Technical and business risks identified by the risk analyzer node.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {project.risks.length === 0 ? (
          <p className="text-sm text-slate-500">
            Risks are generated after clarification answers are submitted.
          </p>
        ) : (
          project.risks.map((risk) => (
            <div
              key={risk.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-slate-900">{risk.title}</h3>
                <Badge variant={severityVariant(risk.severity)}>{risk.severity}</Badge>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
