import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/helpers";
import * as phaseMasterRepo from "@/repositories/phase-master-repository";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const phaseMasters = await phaseMasterRepo.findAllPhaseMasters();
  return NextResponse.json({ phaseMasters });
}
