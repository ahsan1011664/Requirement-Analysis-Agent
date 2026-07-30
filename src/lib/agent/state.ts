import { Annotation } from "@langchain/langgraph";

import type { DatabaseEntity, ProjectAnalysis, RiskItem } from "@/lib/types";

export const AgentStateAnnotation = Annotation.Root({
  projectId: Annotation<string>,
  title: Annotation<string>,
  description: Annotation<string>,
  phase: Annotation<"initial" | "generate">,
  clarificationAnswers: Annotation<Record<string, string>>,
  projectAnalysis: Annotation<ProjectAnalysis | null>({
    reducer: (_, next) => next,
    default: () => null,
  }),
  functionalRequirements: Annotation<string[]>({
    reducer: (_, next) => next,
    default: () => [],
  }),
  nonFunctionalRequirements: Annotation<string[]>({
    reducer: (_, next) => next,
    default: () => [],
  }),
  clarificationQuestions: Annotation<string[]>({
    reducer: (_, next) => next,
    default: () => [],
  }),
  userStories: Annotation<string[]>({
    reducer: (_, next) => next,
    default: () => [],
  }),
  databaseEntities: Annotation<DatabaseEntity[]>({
    reducer: (_, next) => next,
    default: () => [],
  }),
  risks: Annotation<RiskItem[]>({
    reducer: (_, next) => next,
    default: () => [],
  }),
  mvpScope: Annotation<string[]>({
    reducer: (_, next) => next,
    default: () => [],
  }),
  srsDocument: Annotation<string>({
    reducer: (_, next) => next,
    default: () => "",
  }),
  messages: Annotation<string[]>({
    reducer: (current, next) => [...current, ...next],
    default: () => [],
  }),
});

export type AgentState = typeof AgentStateAnnotation.State;
