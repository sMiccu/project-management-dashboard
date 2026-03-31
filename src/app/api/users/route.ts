import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/helpers";
import * as userRepo from "@/repositories/user-repository";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await userRepo.findAllUsers();
  return NextResponse.json({ users });
}
