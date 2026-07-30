# SpecPilot AI

AI Requirements Analyst & Solution Architect — transforms rough software ideas into structured project requirements using a LangGraph agent workflow.

## Features

- **Project intake** — capture ideas and persist to Supabase
- **LangGraph workflow** — analyze, clarify, generate requirements, user stories, database entities, risks, and SRS
- **Workspace UI** — chat-style conversation with clarification Q&A
- **Artefact pages** — Requirements, Database, Risks, Final Report
- **Fallback mode** — works without OpenAI using heuristic generation

## Tech Stack

- Next.js 16, React 19, Tailwind CSS 4
- LangGraph + OpenAI
- Supabase (Postgres)
- shadcn-style UI components (Radix + CVA)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Run the Supabase schema in `supabase/schema.sql`.

4. Fill in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side persistence)
- `OPENAI_API_KEY` (optional — enables LLM-powered analysis)

5. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Workflow

1. Create a project on the home page
2. Open **Workspace** → **Start AI Analysis**
3. Answer clarification questions
4. Submit answers to generate the full SRS
5. Review **Requirements**, **Database**, **Risks**, and **Final Report**

## LangGraph Nodes

`understandProject` → `extractRequirements` → `clarificationAgent` → (user answers) → `userStoryGenerator` → `databaseDesigner` → `riskAnalyzer` → `srsGenerator` → Supabase persistence

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/projects` | GET, POST | List / create projects |
| `/api/projects/[id]` | GET | Project with all artefacts |
| `/api/projects/[id]/analyze` | POST | Run initial analysis + clarification |
| `/api/projects/[id]/clarify` | POST | Submit answers and generate SRS |

## Deploy

- **Frontend/API**: Vercel
- **Database**: Supabase

Ensure all environment variables are set in production.
