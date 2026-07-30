"use client";

import { useParams } from "next/navigation";

import { useProject } from "@/hooks/use-project";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DatabasePage() {
  const params = useParams<{ id: string }>();
  const { project, loading, error } = useProject(params.id);

  if (loading) return <Skeleton className="h-96" />;

  if (error || !project) {
    return (
      <Alert variant="warning">
        <AlertTitle>Unable to load database design</AlertTitle>
        <AlertDescription>{error ?? "Project not found"}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Suggested Database Schema</CardTitle>
        <CardDescription>
          Entities and relationships generated from functional requirements.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {project.database_entities.length === 0 ? (
          <p className="text-sm text-slate-500">
            Complete the clarification step to generate database entities.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">#</th>
                  <th className="px-4 py-3 font-semibold">Entity</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {project.database_entities.map((entity, index) => (
                  <tr key={entity.id} className="border-t border-slate-200">
                    <td className="px-4 py-3 text-slate-500">{index + 1}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{entity.entity_name}</td>
                    <td className="px-4 py-3">
                      <Badge variant="success">Suggested</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {project.database_entities.length > 0 && (
          <Accordion type="single" collapsible className="mt-6">
            {project.database_entities.map((entity) => (
              <AccordionItem key={entity.id} value={entity.id}>
                <AccordionTrigger>{entity.entity_name} details</AccordionTrigger>
                <AccordionContent>
                  Primary key: <code className="text-blue-700">id (uuid)</code>
                  <br />
                  Foreign keys and field-level design are included in the final SRS document.
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
