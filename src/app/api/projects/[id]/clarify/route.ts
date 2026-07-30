import { NextRequest, NextResponse } from "next/server";

import { runFullGeneration } from "@/lib/agent/graph";
import {
  getProjectDetail,
  saveAgentResults,
  saveClarificationAnswers,
  updateProjectStatus,
} from "@/lib/persistence";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const answers = (body.answers ?? {}) as Record<string, string>;

    const project = await getProjectDetail(id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (!answers || Object.keys(answers).length === 0) {
      return NextResponse.json(
        { error: "Missing clarification answers" },
        { status: 400 }
      );
    }

    await updateProjectStatus(id, "generating");
    await saveClarificationAnswers(id, answers);

    const existingFunctional = project.requirements
      .filter((r) => r.requirement_type === "functional")
      .map((r) => r.content);
    const existingNonFunctional = project.requirements
      .filter((r) => r.requirement_type === "non_functional")
      .map((r) => r.content);

    const result = await runFullGeneration({
      projectId: id,
      title: project.title,
      description: project.description,
      clarificationAnswers: answers,
      functionalRequirements: existingFunctional,
      nonFunctionalRequirements: existingNonFunctional,
    });

    await saveAgentResults(id, {
      functionalRequirements: result.functionalRequirements,
      nonFunctionalRequirements: result.nonFunctionalRequirements,
      userStories: result.userStories,
      databaseEntities: result.databaseEntities,
      risks: result.risks,
      srsDocument: result.srsDocument,
      messages: result.messages,
    });

    await updateProjectStatus(id, "complete");

    return NextResponse.json({
      status: "complete",
      functionalRequirements: result.functionalRequirements,
      nonFunctionalRequirements: result.nonFunctionalRequirements,
      userStories: result.userStories,
      databaseEntities: result.databaseEntities,
      risks: result.risks,
      srsDocument: result.srsDocument,
      mvpScope: result.mvpScope,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
