export type ProjectStage = "Draft" | "Clarification" | "Analysis";

export interface ProjectRecord {
  id: string;
  title: string;
  idea: string;
  stage: ProjectStage;
  createdAt: string;
  lastUpdatedAt: string;
  questions: string[];
  summary: Array<{
    label: string;
    value: string;
  }>;
}

const STORAGE_KEY = "specpilot.projects.v1";

export const phaseOneChecklist = [
  "Capture the project idea",
  "Store workspace state",
  "Prepare the clarification handoff",
  "Keep a project list for reopening",
];

export const defaultProjects: ProjectRecord[] = [
  {
    id: "demo-campus-delivery",
    title: "Campus Food Delivery",
    idea: "A food delivery app for university campuses with student accounts, restaurant onboarding, payments, and tracking.",
    stage: "Draft",
    createdAt: new Date("2026-07-28T09:00:00.000Z").toISOString(),
    lastUpdatedAt: new Date("2026-07-28T09:00:00.000Z").toISOString(),
    questions: ["Should the app support both Android and iOS?"],
    summary: [
      { label: "Users", value: "Students, restaurants, admins" },
      { label: "Core goal", value: "Order food across campus" },
      { label: "Open gaps", value: "Platform, payments, notifications" },
    ],
  },
];

export function createProject(input: { title: string; idea: string }): ProjectRecord {
  const timestamp = new Date().toISOString();

  return {
    id: `project-${crypto.randomUUID()}`,
    title: input.title,
    idea: input.idea,
    stage: "Draft",
    createdAt: timestamp,
    lastUpdatedAt: timestamp,
    questions: ["What is the primary user persona?", "Which platform should launch first?"],
    summary: [
      { label: "Users", value: "To be clarified" },
      { label: "Core goal", value: "To be analyzed" },
      { label: "Open gaps", value: "Captured by the clarification agent" },
    ],
  };
}

export function loadProjects(): ProjectRecord[] {
  if (typeof window === "undefined") {
    return defaultProjects;
  }

  const storedValue = window.localStorage.getItem(STORAGE_KEY);

  if (!storedValue) {
    return defaultProjects;
  }

  try {
    const parsedProjects = JSON.parse(storedValue) as ProjectRecord[];

    return Array.isArray(parsedProjects) && parsedProjects.length > 0
      ? parsedProjects
      : defaultProjects;
  } catch {
    return defaultProjects;
  }
}

export function saveProjects(projects: ProjectRecord[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}