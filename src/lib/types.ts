export interface ProjectAnalysis {
  summary: string;
  users: string[];
  goals: string[];
  constraints: string[];
  features: string[];
}

export interface DatabaseEntity {
  entity_name: string;
  fields: string[];
  relationships: string[];
}

export interface RiskItem {
  title: string;
  severity: "low" | "medium" | "high";
  recommendation: string;
}

export interface ConversationRow {
  id: string;
  project_id: string;
  role: string;
  message: string;
  created_at: string;
}

export interface RequirementRow {
  id: string;
  project_id: string;
  requirement_type: string;
  content: string;
  created_at: string;
}

export interface UserStoryRow {
  id: string;
  project_id: string;
  story: string;
  created_at: string;
}

export interface DatabaseEntityRow {
  id: string;
  project_id: string;
  entity_name: string;
  created_at: string;
}

export interface RiskRow {
  id: string;
  project_id: string;
  title: string;
  severity: string;
  created_at: string;
}

export interface SrsDocumentRow {
  id: string;
  project_id: string;
  content: string;
  created_at: string;
}

export interface ProjectRow {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectDetail extends ProjectRow {
  conversations: ConversationRow[];
  requirements: RequirementRow[];
  user_stories: UserStoryRow[];
  database_entities: DatabaseEntityRow[];
  risks: RiskRow[];
  srs_documents: SrsDocumentRow[];
}

export type ProjectStatus =
  | "draft"
  | "analyzing"
  | "clarification"
  | "generating"
  | "complete";
