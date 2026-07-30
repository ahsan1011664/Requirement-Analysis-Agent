import { END, START, StateGraph } from "@langchain/langgraph";

import {
  clarificationNode,
  databaseDesignerNode,
  extractRequirementsNode,
  riskAnalyzerNode,
  srsGeneratorNode,
  understandProjectNode,
  userStoryNode,
} from "@/lib/agent/nodes";
import { AgentStateAnnotation, type AgentState } from "@/lib/agent/state";

function routeAfterClarification(state: AgentState): "generate" | "wait" {
  if (state.phase === "generate") {
    return "generate";
  }
  return "wait";
}

export function buildSpecPilotGraph() {
  const graph = new StateGraph(AgentStateAnnotation)
    .addNode("understandProject", understandProjectNode)
    .addNode("extractRequirements", extractRequirementsNode)
    .addNode("clarificationAgent", clarificationNode)
    .addNode("userStoryGenerator", userStoryNode)
    .addNode("databaseDesigner", databaseDesignerNode)
    .addNode("riskAnalyzer", riskAnalyzerNode)
    .addNode("srsGenerator", srsGeneratorNode)
    .addEdge(START, "understandProject")
    .addEdge("understandProject", "extractRequirements")
    .addEdge("extractRequirements", "clarificationAgent")
    .addConditionalEdges("clarificationAgent", routeAfterClarification, {
      generate: "userStoryGenerator",
      wait: END,
    })
    .addEdge("userStoryGenerator", "databaseDesigner")
    .addEdge("databaseDesigner", "riskAnalyzer")
    .addEdge("riskAnalyzer", "srsGenerator")
    .addEdge("srsGenerator", END);

  return graph.compile();
}

export async function runInitialAnalysis(input: {
  projectId: string;
  title: string;
  description: string;
}) {
  const app = buildSpecPilotGraph();

  const result = await app.invoke({
    projectId: input.projectId,
    title: input.title,
    description: input.description,
    phase: "initial",
    clarificationAnswers: {},
  });

  return result;
}

export async function runFullGeneration(input: {
  projectId: string;
  title: string;
  description: string;
  clarificationAnswers: Record<string, string>;
  projectAnalysis?: AgentState["projectAnalysis"];
  functionalRequirements?: string[];
  nonFunctionalRequirements?: string[];
}) {
  const app = buildSpecPilotGraph();

  const enrichedDescription =
    Object.keys(input.clarificationAnswers).length > 0
      ? `${input.description}\n\nClarifications:\n${Object.entries(input.clarificationAnswers)
          .map(([question, answer]) => `- ${question}: ${answer}`)
          .join("\n")}`
      : input.description;

  const result = await app.invoke({
    projectId: input.projectId,
    title: input.title,
    description: enrichedDescription,
    phase: "generate",
    clarificationAnswers: input.clarificationAnswers,
    projectAnalysis: input.projectAnalysis ?? null,
    functionalRequirements: input.functionalRequirements ?? [],
    nonFunctionalRequirements: input.nonFunctionalRequirements ?? [],
  });

  return result;
}
