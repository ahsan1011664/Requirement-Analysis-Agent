import { NextRequest, NextResponse } from "next/server";

import { runInitialAnalysis } from "@/lib/agent/graph";
import {
  getProjectDetail,
  saveAgentResults,
  saveProjectAnalysisSummary,
  updateProjectStatus,
} from "@/lib/persistence";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const project = await getProjectDetail(id);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    await updateProjectStatus(id, "analyzing");

    const result = await runInitialAnalysis({
      projectId: id,
      title: project.title,
      description: project.description,
    });

    if (result.projectAnalysis) {
      await saveProjectAnalysisSummary(id, result.projectAnalysis.summary);
    }

    await saveAgentResults(id, {
      functionalRequirements: result.functionalRequirements,
      nonFunctionalRequirements: result.nonFunctionalRequirements,
      userStories: [],
      databaseEntities: [],
      risks: [],
      srsDocument: "",
      clarificationQuestions: result.clarificationQuestions,
      messages: result.messages,
    });

    await updateProjectStatus(id, "clarification");

    return NextResponse.json({
      status: "clarification",
      analysis: result.projectAnalysis,
      clarificationQuestions: result.clarificationQuestions,
      functionalRequirements: result.functionalRequirements,
      nonFunctionalRequirements: result.nonFunctionalRequirements,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
