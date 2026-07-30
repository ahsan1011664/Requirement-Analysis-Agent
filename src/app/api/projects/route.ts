import { NextRequest, NextResponse } from "next/server";

import { createProjectRecord, listProjects } from "@/lib/persistence";

function isMissingProjectsTableError(error: unknown) {
  const message = String(error);
  return (
    message.includes("public.projects") &&
    (message.includes("schema cache") ||
      message.includes("Could not find the table") ||
      message.includes("42P01"))
  );
}

export async function GET() {
  try {
    const projects = await listProjects();
    return NextResponse.json({ projects });
  } catch (err) {
    if (isMissingProjectsTableError(err)) {
      return NextResponse.json(
        {
          error:
            "Supabase is missing the public.projects table. Run supabase/schema.sql in your Supabase project, then refresh the schema cache and retry.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const title = body.title?.toString?.() ?? null;
    const description = body.description?.toString?.() ?? null;
    const status = body.status?.toString?.() ?? "draft";

    if (!title || !description) {
      return NextResponse.json(
        { error: "Missing title or description" },
        { status: 400 }
      );
    }

    const project = await createProjectRecord({ title, description, status });
    return NextResponse.json({ project }, { status: 201 });
  } catch (err) {
    if (isMissingProjectsTableError(err)) {
      return NextResponse.json(
        {
          error:
            "Supabase is missing the public.projects table. Run supabase/schema.sql in your Supabase project, then refresh the schema cache and retry.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
