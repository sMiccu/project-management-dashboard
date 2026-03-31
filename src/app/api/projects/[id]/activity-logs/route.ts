import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/helpers";
import * as activityLogService from "@/services/activity-log-service";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const limit = Number(req.nextUrl.searchParams.get("limit")) || 50;
  const cursor = req.nextUrl.searchParams.get("cursor") ?? undefined;

  const result = await activityLogService.getProjectLogs(id, {
    limit,
    cursor,
  });

  return NextResponse.json(result);
}
