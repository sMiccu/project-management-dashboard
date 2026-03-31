import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/helpers";
import * as projectService from "@/services/project-service";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const project = await projectService.getProjectById(id);
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (
    user.role === "MEMBER" &&
    !project.members.some((m) => m.id === user.id)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(project);
}
