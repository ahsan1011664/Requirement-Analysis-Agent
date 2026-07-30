import type { AgentState } from "@/lib/agent/state";
import {
  analyzeProjectTool,
  analyzeRisksTool,
  buildMvpScope,
  buildSrsTool,
  extractRequirementsTool,
  generateDatabaseTool,
  generateQuestionsTool,
  generateUserStoriesTool,
} from "@/lib/agent/tools";

export async function understandProjectNode(
  state: AgentState
): Promise<Partial<AgentState>> {
  const analysis = await analyzeProjectTool({
    title: state.title,
    description: state.description,
  });

  return {
    projectAnalysis: analysis,
    messages: [`Analyzed project: ${analysis.summary}`],
  };
}

export async function extractRequirementsNode(
  state: AgentState
): Promise<Partial<AgentState>> {
  if (!state.projectAnalysis) {
    return { messages: ["Skipped requirement extraction — no analysis available."] };
  }

  const requirements = await extractRequirementsTool({
    title: state.title,
    description: state.description,
    analysis: state.projectAnalysis,
    clarificationAnswers: state.clarificationAnswers,
  });

  return {
    functionalRequirements: requirements.functional,
    nonFunctionalRequirements: requirements.nonFunctional,
    messages: [`Extracted ${requirements.functional.length} functional requirements.`],
  };
}

export async function clarificationNode(
  state: AgentState
): Promise<Partial<AgentState>> {
  if (state.phase === "generate") {
    return { messages: ["Clarification answers received — continuing generation."] };
  }

  if (!state.projectAnalysis) {
    return { clarificationQuestions: [], messages: ["No analysis for clarification."] };
  }

  const questions = await generateQuestionsTool({
    title: state.title,
    description: state.description,
    analysis: state.projectAnalysis,
  });

  return {
    clarificationQuestions: questions,
    messages: [`Generated ${questions.length} clarification questions.`],
  };
}

export async function userStoryNode(state: AgentState): Promise<Partial<AgentState>> {
  const stories = await generateUserStoriesTool({
    title: state.title,
    functionalRequirements: state.functionalRequirements,
  });

  return {
    userStories: stories,
    messages: [`Generated ${stories.length} user stories.`],
  };
}

export async function databaseDesignerNode(
  state: AgentState
): Promise<Partial<AgentState>> {
  const entities = await generateDatabaseTool({
    title: state.title,
    description: state.description,
    functionalRequirements: state.functionalRequirements,
  });

  return {
    databaseEntities: entities,
    messages: [`Suggested ${entities.length} database entities.`],
  };
}

export async function riskAnalyzerNode(state: AgentState): Promise<Partial<AgentState>> {
  if (!state.projectAnalysis) {
    return { risks: [], messages: ["Skipped risk analysis."] };
  }

  const risks = await analyzeRisksTool({
    title: state.title,
    description: state.description,
    analysis: state.projectAnalysis,
  });

  return {
    risks,
    messages: [`Identified ${risks.length} project risks.`],
  };
}

export async function srsGeneratorNode(state: AgentState): Promise<Partial<AgentState>> {
  if (!state.projectAnalysis) {
    return { srsDocument: "", messages: ["Cannot generate SRS without analysis."] };
  }

  const mvpScope =
    state.mvpScope.length > 0
      ? state.mvpScope
      : buildMvpScope(state.projectAnalysis.features);

  const srs = await buildSrsTool({
    title: state.title,
    description: state.description,
    analysis: state.projectAnalysis,
    functionalRequirements: state.functionalRequirements,
    nonFunctionalRequirements: state.nonFunctionalRequirements,
    userStories: state.userStories,
    databaseEntities: state.databaseEntities,
    risks: state.risks,
    mvpScope,
  });

  return {
    mvpScope,
    srsDocument: srs,
    messages: ["Generated Software Requirements Specification."],
  };
}
