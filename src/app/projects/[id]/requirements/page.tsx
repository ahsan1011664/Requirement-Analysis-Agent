"use client";

import { useParams } from "next/navigation";

import { useProject } from "@/hooks/use-project";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export default function RequirementsPage() {
  const params = useParams<{ id: string }>();
  const { project, loading, error } = useProject(params.id);

  if (loading) return <Skeleton className="h-96" />;

  if (error || !project) {
    return (
      <Alert variant="warning">
        <AlertTitle>Unable to load requirements</AlertTitle>
        <AlertDescription>{error ?? "Project not found"}</AlertDescription>
      </Alert>
    );
  }

  const functional = project.requirements.filter((r) => r.requirement_type === "functional");
  const nonFunctional = project.requirements.filter(
    (r) => r.requirement_type === "non_functional"
  );

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Generated Requirements</CardTitle>
          <CardDescription>
            Functional and non-functional requirements produced by the LangGraph workflow.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="functional">
            <TabsList>
              <TabsTrigger value="functional">Functional ({functional.length})</TabsTrigger>
              <TabsTrigger value="non-functional">
                Non-Functional ({nonFunctional.length})
              </TabsTrigger>
              <TabsTrigger value="stories">User Stories ({project.user_stories.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="functional" className="space-y-3">
              {functional.length === 0 ? (
                <p className="text-sm text-slate-500">Run analysis to generate requirements.</p>
              ) : (
                functional.map((req, index) => (
                  <div
                    key={req.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700"
                  >
                    <Badge className="mb-2" variant="default">
                      FR-{index + 1}
                    </Badge>
                    <p>{req.content}</p>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="non-functional" className="space-y-3">
              {nonFunctional.length === 0 ? (
                <p className="text-sm text-slate-500">No non-functional requirements yet.</p>
              ) : (
                nonFunctional.map((req, index) => (
                  <div
                    key={req.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700"
                  >
                    <Badge className="mb-2" variant="secondary">
                      NFR-{index + 1}
                    </Badge>
                    <p>{req.content}</p>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="stories" className="space-y-3">
              {project.user_stories.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Submit clarification answers to generate user stories.
                </p>
              ) : (
                project.user_stories.map((story, index) => (
                  <div
                    key={story.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm italic text-slate-700"
                  >
                    <Badge className="mb-2" variant="success">
                      Story {index + 1}
                    </Badge>
                    <p>{story.story}</p>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
