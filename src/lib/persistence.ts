import { createServerSupabase } from "@/lib/supabaseServer";
import type { ProjectDetail, ProjectRow } from "@/lib/types";

export async function listProjects(): Promise<ProjectRow[]> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getProjectDetail(id: string): Promise<ProjectDetail | null> {
  const supabase = createServerSupabase();

  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !project) return null;

  const [conversations, requirements, userStories, entities, risks, srs] =
    await Promise.all([
      supabase
        .from("conversations")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: true }),
      supabase.from("requirements").select("*").eq("project_id", id),
      supabase.from("user_stories").select("*").eq("project_id", id),
      supabase.from("database_entities").select("*").eq("project_id", id),
      supabase.from("risks").select("*").eq("project_id", id),
      supabase
        .from("srs_documents")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: false }),
    ]);

  return {
    ...project,
    conversations: conversations.data ?? [],
    requirements: requirements.data ?? [],
    user_stories: userStories.data ?? [],
    database_entities: entities.data ?? [],
    risks: risks.data ?? [],
    srs_documents: srs.data ?? [],
  };
}

export async function createProjectRecord(input: {
  title: string;
  description: string;
  status?: string;
}): Promise<ProjectRow> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("projects")
    .insert([
      {
        title: input.title,
        description: input.description,
        status: input.status ?? "draft",
      },
    ])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateProjectStatus(id: string, status: string) {
  const supabase = createServerSupabase();
  const { error } = await supabase
    .from("projects")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function addConversation(
  projectId: string,
  role: string,
  message: string
) {
  const supabase = createServerSupabase();
  const { error } = await supabase
    .from("conversations")
    .insert([{ project_id: projectId, role, message }]);

  if (error) throw new Error(error.message);
}

export async function saveAgentResults(
  projectId: string,
  result: {
    functionalRequirements: string[];
    nonFunctionalRequirements: string[];
    userStories: string[];
    databaseEntities: Array<{ entity_name: string }>;
    risks: Array<{ title: string; severity: string }>;
    srsDocument: string;
    clarificationQuestions?: string[];
    messages?: string[];
  }
) {
  const supabase = createServerSupabase();

  await supabase.from("requirements").delete().eq("project_id", projectId);
  await supabase.from("user_stories").delete().eq("project_id", projectId);
  await supabase.from("database_entities").delete().eq("project_id", projectId);
  await supabase.from("risks").delete().eq("project_id", projectId);

  const requirementRows = [
    ...result.functionalRequirements.map((content) => ({
      project_id: projectId,
      requirement_type: "functional",
      content,
    })),
    ...result.nonFunctionalRequirements.map((content) => ({
      project_id: projectId,
      requirement_type: "non_functional",
      content,
    })),
  ];

  if (requirementRows.length) {
    const { error } = await supabase.from("requirements").insert(requirementRows);
    if (error) throw new Error(error.message);
  }

  if (result.userStories.length) {
    const { error } = await supabase
      .from("user_stories")
      .insert(result.userStories.map((story) => ({ project_id: projectId, story })));
    if (error) throw new Error(error.message);
  }

  if (result.databaseEntities.length) {
    const { error } = await supabase.from("database_entities").insert(
      result.databaseEntities.map((entity) => ({
        project_id: projectId,
        entity_name: entity.entity_name,
      }))
    );
    if (error) throw new Error(error.message);
  }

  if (result.risks.length) {
    const { error } = await supabase.from("risks").insert(
      result.risks.map((risk) => ({
        project_id: projectId,
        title: risk.title,
        severity: risk.severity,
      }))
    );
    if (error) throw new Error(error.message);
  }

  if (result.srsDocument) {
    const { error } = await supabase
      .from("srs_documents")
      .insert([{ project_id: projectId, content: result.srsDocument }]);
    if (error) throw new Error(error.message);
  }

  for (const message of result.messages ?? []) {
    await addConversation(projectId, "assistant", message);
  }

  if (result.clarificationQuestions?.length) {
    await addConversation(
      projectId,
      "assistant",
      `Clarification needed:\n${result.clarificationQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}`
    );
  }
}

export async function saveClarificationAnswers(
  projectId: string,
  answers: Record<string, string>
) {
  const lines = Object.entries(answers).map(([question, answer]) => `- ${question}: ${answer}`);
  await addConversation(
    projectId,
    "user",
    `Clarification answers:\n${lines.join("\n")}`
  );
}

export async function saveProjectAnalysisSummary(
  projectId: string,
  summary: string
) {
  await addConversation(projectId, "assistant", `Project analysis:\n${summary}`);
}
