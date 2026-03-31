"use server";

import { requireAdmin } from "@/lib/auth/helpers";
import * as phaseMasterRepo from "@/repositories/phase-master-repository";
import type { ActionResult } from "./project-actions";

export async function createPhaseMasterAction(
  name: string
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const trimmed = name.trim();
    if (!trimmed) return { success: false, error: "フェーズ名は必須です" };

    const existing = await phaseMasterRepo.findAllPhaseMasters();
    if (existing.some((pm) => pm.name === trimmed)) {
      return { success: false, error: `「${trimmed}」は既に登録されています` };
    }

    const defaultOrder = await phaseMasterRepo.getMaxDefaultOrder();
    const pm = await phaseMasterRepo.createPhaseMaster({
      name: trimmed,
      defaultOrder,
    });
    return { success: true, data: pm };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function updatePhaseMasterAction(
  id: string,
  name: string
): Promise<ActionResult> {
  try {
    await requireAdmin();
    if (!name.trim()) return { success: false, error: "フェーズ名は必須です" };

    const pm = await phaseMasterRepo.updatePhaseMaster(id, { name: name.trim() });
    return { success: true, data: pm };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function deletePhaseMasterAction(
  id: string
): Promise<ActionResult> {
  try {
    await requireAdmin();
    await phaseMasterRepo.deletePhaseMaster(id);
    return { success: true, data: null };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
