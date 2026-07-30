import { NextRequest, NextResponse } from "next/server";

import { getProjectDetail } from "@/lib/persistence";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const project = await getProjectDetail(id);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
