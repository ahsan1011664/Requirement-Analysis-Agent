import { invokeJson } from "@/lib/llm";
import type { DatabaseEntity, ProjectAnalysis, RiskItem } from "@/lib/types";

function extractKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  const keywords = [
    "admin",
    "payment",
    "notification",
    "android",
    "ios",
    "mobile",
    "web",
    "auth",
    "login",
    "tracking",
    "order",
    "delivery",
    "restaurant",
    "student",
    "school",
    "campus",
  ];
  return keywords.filter((k) => lower.includes(k));
}

export async function analyzeProjectTool(input: {
  title: string;
  description: string;
}): Promise<ProjectAnalysis> {
  const fallback: ProjectAnalysis = {
    summary: `${input.title}: ${input.description.slice(0, 200)}`,
    users: inferUsers(input.description),
    goals: ["Deliver core product value", "Enable smooth user onboarding", "Support operational workflows"],
    constraints: inferConstraints(input.description),
    features: inferFeatures(input.description),
  };

  return invokeJson<ProjectAnalysis>(
    "You are a senior business analyst. Return JSON with keys: summary (string), users (string[]), goals (string[]), constraints (string[]), features (string[]).",
    `Analyze this software project:\nTitle: ${input.title}\nDescription: ${input.description}`,
    fallback
  );
}

export async function extractRequirementsTool(input: {
  title: string;
  description: string;
  analysis: ProjectAnalysis;
  clarificationAnswers?: Record<string, string>;
}): Promise<{ functional: string[]; nonFunctional: string[] }> {
  const context = input.clarificationAnswers
    ? `\nClarifications:\n${Object.entries(input.clarificationAnswers)
        .map(([q, a]) => `- ${q}: ${a}`)
        .join("\n")}`
    : "";

  const fallback = {
    functional: buildFunctionalRequirements(input.title, input.description, input.analysis),
    nonFunctional: [
      "The system shall authenticate users securely.",
      "The system shall respond to user actions within 2 seconds under normal load.",
      "The system shall maintain 99.5% availability during business hours.",
      "The system shall scale to support growing user traffic.",
      "The system shall provide an accessible, intuitive interface.",
    ],
  };

  return invokeJson<{ functional: string[]; nonFunctional: string[] }>(
    "You are a requirements engineer. Return JSON with functional (string[]) and nonFunctional (string[]) requirement statements using 'shall' phrasing.",
    `Project: ${input.title}\nDescription: ${input.description}\nAnalysis: ${JSON.stringify(input.analysis)}${context}`,
    fallback
  );
}

export async function generateQuestionsTool(input: {
  title: string;
  description: string;
  analysis: ProjectAnalysis;
}): Promise<string[]> {
  const fallback = buildClarificationQuestions(input.description, input.analysis);

  const result = await invokeJson<{ questions: string[] }>(
    "You are a business analyst. Return JSON with questions (string[]) — 4-6 specific clarification questions about missing project information.",
    `Project: ${input.title}\nDescription: ${input.description}\nAnalysis: ${JSON.stringify(input.analysis)}`,
    { questions: fallback }
  );

  return result.questions?.length ? result.questions : fallback;
}

export async function generateUserStoriesTool(input: {
  title: string;
  functionalRequirements: string[];
}): Promise<string[]> {
  const fallback = input.functionalRequirements.slice(0, 8).map(
    (req) =>
      `As a user, I want ${req.replace(/^The system shall /i, "").replace(/\.$/, "")} so that I can achieve my goal efficiently.`
  );

  const result = await invokeJson<{ stories: string[] }>(
    "You are an agile BA. Return JSON with stories (string[]) in 'As a ..., I want ..., so that ...' format.",
    `Project: ${input.title}\nRequirements:\n${input.functionalRequirements.join("\n")}`,
    { stories: fallback }
  );

  return result.stories?.length ? result.stories : fallback;
}

export async function generateDatabaseTool(input: {
  title: string;
  description: string;
  functionalRequirements: string[];
}): Promise<DatabaseEntity[]> {
  const fallback = buildDatabaseEntities(input.description, input.functionalRequirements);

  const result = await invokeJson<{ entities: DatabaseEntity[] }>(
    "You are a solution architect. Return JSON with entities (array of { entity_name, fields (string[]), relationships (string[]) }).",
    `Project: ${input.title}\nDescription: ${input.description}\nRequirements:\n${input.functionalRequirements.join("\n")}`,
    { entities: fallback }
  );

  return result.entities?.length ? result.entities : fallback;
}

export async function analyzeRisksTool(input: {
  title: string;
  description: string;
  analysis: ProjectAnalysis;
}): Promise<RiskItem[]> {
  const fallback = buildRisks(input.description, input.analysis);

  const result = await invokeJson<{ risks: RiskItem[] }>(
    "You are a risk analyst. Return JSON with risks (array of { title, severity: low|medium|high, recommendation }).",
    `Project: ${input.title}\nDescription: ${input.description}\nAnalysis: ${JSON.stringify(input.analysis)}`,
    { risks: fallback }
  );

  return result.risks?.length ? result.risks : fallback;
}

export async function buildSrsTool(input: {
  title: string;
  description: string;
  analysis: ProjectAnalysis;
  functionalRequirements: string[];
  nonFunctionalRequirements: string[];
  userStories: string[];
  databaseEntities: DatabaseEntity[];
  risks: RiskItem[];
  mvpScope: string[];
}): Promise<string> {
  const sections = [
    `# Software Requirements Specification\n\n## 1. Introduction\n\n### 1.1 Purpose\nThis document specifies the requirements for **${input.title}**.\n\n### 1.2 Project Summary\n${input.analysis.summary}\n\n### 1.3 Scope\n${input.description}\n\n## 2. Stakeholders & Users\n${input.analysis.users.map((u) => `- ${u}`).join("\n")}\n\n## 3. Goals\n${input.analysis.goals.map((g) => `- ${g}`).join("\n")}\n\n## 4. Functional Requirements\n${input.functionalRequirements.map((r, i) => `${i + 1}. ${r}`).join("\n")}\n\n## 5. Non-Functional Requirements\n${input.nonFunctionalRequirements.map((r, i) => `${i + 1}. ${r}`).join("\n")}\n\n## 6. User Stories\n${input.userStories.map((s) => `- ${s}`).join("\n")}\n\n## 7. Database Design\n${input.databaseEntities
      .map(
        (e) =>
          `### ${e.entity_name}\n- Fields: ${e.fields.join(", ")}\n- Relationships: ${e.relationships.join(", ") || "None specified"}`
      )
      .join("\n\n")}\n\n## 8. MVP Scope\n${input.mvpScope.map((m) => `- ${m}`).join("\n")}\n\n## 9. Risks\n${input.risks
      .map((r) => `- **${r.title}** (${r.severity}): ${r.recommendation}`)
      .join("\n")}\n\n## 10. Constraints\n${input.analysis.constraints.map((c) => `- ${c}`).join("\n")}\n`,
  ];

  const fallback = sections.join("\n");

  const model = await import("@/lib/llm").then((m) => m.createChatModel());
  if (!model) {
    return fallback;
  }

  try {
    const response = await model.invoke([
      {
        role: "system",
        content:
          "You are a technical writer. Produce a professional SRS in Markdown using the provided structured data. Keep all sections.",
      },
      {
        role: "user",
        content: `Generate SRS for ${input.title}:\n${fallback}`,
      },
    ]);

    const text =
      typeof response.content === "string"
        ? response.content
        : JSON.stringify(response.content);

    return text.trim() || fallback;
  } catch {
    return fallback;
  }
}

function inferUsers(description: string): string[] {
  const users = new Set<string>(["End users"]);
  const lower = description.toLowerCase();
  if (lower.includes("admin")) users.add("Administrators");
  if (lower.includes("student")) users.add("Students");
  if (lower.includes("restaurant")) users.add("Restaurant partners");
  if (lower.includes("driver") || lower.includes("delivery")) users.add("Delivery personnel");
  return Array.from(users);
}

function inferConstraints(description: string): string[] {
  const constraints: string[] = [];
  const lower = description.toLowerCase();
  if (!lower.includes("payment")) constraints.push("Payment integration strategy not defined");
  if (!lower.includes("android") && !lower.includes("ios") && !lower.includes("web")) {
    constraints.push("Target platform not specified");
  }
  if (!lower.includes("auth") && !lower.includes("login")) {
    constraints.push("Authentication approach not defined");
  }
  return constraints.length ? constraints : ["Budget and timeline to be confirmed"];
}

function inferFeatures(description: string): string[] {
  const features: string[] = ["User registration and login"];
  const keywords = extractKeywords(description);
  if (keywords.includes("order")) features.push("Order placement and management");
  if (keywords.includes("tracking")) features.push("Real-time order tracking");
  if (keywords.includes("payment")) features.push("Payment processing");
  if (keywords.includes("admin")) features.push("Admin dashboard");
  if (keywords.includes("notification")) features.push("Push/email notifications");
  return features;
}

function buildClarificationQuestions(description: string, analysis: ProjectAnalysis): string[] {
  const questions: string[] = [];
  const lower = description.toLowerCase();

  if (!lower.includes("android") && !lower.includes("ios") && !lower.includes("web")) {
    questions.push("Which platform should launch first: web, Android, iOS, or all?");
  }
  if (!lower.includes("payment")) {
    questions.push("Which payment methods should be supported?");
  }
  if (!lower.includes("admin")) {
    questions.push("Do you need an admin panel for managing users and content?");
  }
  if (!lower.includes("notification")) {
    questions.push("Should the app send push or email notifications?");
  }
  if (analysis.users.length <= 1) {
    questions.push("Who are the primary user personas for this product?");
  }

  return questions.length
    ? questions.slice(0, 6)
    : [
        "What is the primary business goal for the first release?",
        "Are there any compliance or privacy requirements?",
        "What is the expected timeline for MVP delivery?",
      ];
}

function buildFunctionalRequirements(
  title: string,
  description: string,
  analysis: ProjectAnalysis
): string[] {
  const reqs = [
    "The system shall allow users to register and authenticate securely.",
    `The system shall support the core workflow described for ${title}.`,
  ];

  for (const feature of analysis.features.slice(0, 6)) {
    reqs.push(`The system shall provide ${feature.toLowerCase()}.`);
  }

  if (description.toLowerCase().includes("admin")) {
    reqs.push("The system shall provide an admin interface for operational management.");
  }

  return reqs;
}

function buildDatabaseEntities(
  description: string,
  functionalRequirements: string[]
): DatabaseEntity[] {
  const entities: DatabaseEntity[] = [
    {
      entity_name: "users",
      fields: ["id", "email", "password_hash", "role", "created_at"],
      relationships: ["orders", "addresses"],
    },
  ];

  const lower = description.toLowerCase();
  if (lower.includes("order") || lower.includes("delivery") || lower.includes("food")) {
    entities.push(
      {
        entity_name: "restaurants",
        fields: ["id", "name", "location", "status", "owner_id"],
        relationships: ["menu_items", "orders"],
      },
      {
        entity_name: "orders",
        fields: ["id", "user_id", "restaurant_id", "status", "total", "created_at"],
        relationships: ["order_items", "payments"],
      },
      {
        entity_name: "payments",
        fields: ["id", "order_id", "amount", "method", "status"],
        relationships: ["orders"],
      }
    );
  }

  if (functionalRequirements.some((r) => r.toLowerCase().includes("review"))) {
    entities.push({
      entity_name: "reviews",
      fields: ["id", "user_id", "target_id", "rating", "comment"],
      relationships: ["users"],
    });
  }

  return entities;
}

function buildRisks(description: string, analysis: ProjectAnalysis): RiskItem[] {
  const risks: RiskItem[] = [];
  const lower = description.toLowerCase();

  if (!lower.includes("auth") && !lower.includes("login")) {
    risks.push({
      title: "No authentication strategy defined",
      severity: "high",
      recommendation: "Define auth method (OAuth, email/password, SSO) before development.",
    });
  }
  if (!lower.includes("payment")) {
    risks.push({
      title: "Payment gateway not specified",
      severity: "medium",
      recommendation: "Select payment provider and compliance requirements early.",
    });
  }
  if (analysis.features.length > 8) {
    risks.push({
      title: "Scope creep risk",
      severity: "medium",
      recommendation: "Prioritize MVP features and defer nice-to-have items.",
    });
  }

  risks.push({
    title: "Privacy and data protection",
    severity: "medium",
    recommendation: "Document data retention policies and user consent flows.",
  });

  return risks;
}

export function buildMvpScope(features: string[]): string[] {
  return features.slice(0, 5).map((f) => `Include ${f.toLowerCase()} in MVP`);
}
