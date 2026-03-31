import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/helpers";
import * as projectService from "@/services/project-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = req.nextUrl.searchParams;
  const status = params.get("status") ?? undefined;
  const memberId = params.get("memberId") ?? undefined;
  const sortBy = (params.get("sortBy") as "due_date" | "updated_at") ?? undefined;
  const sortOrder = (params.get("sortOrder") as "asc" | "desc") ?? undefined;

  const effectiveMemberId =
    user.role === "MEMBER" ? user.id : memberId;

  const projects = await projectService.getProjects({
    status,
    memberId: effectiveMemberId,
    sortBy,
    sortOrder,
  });

  return NextResponse.json({ projects });
}
