"use server";

import { requireAuth } from "@/lib/auth/helpers";
import * as phaseService from "@/services/phase-service";
import type { ActionResult } from "./project-actions";

export async function addPhaseAction(
  projectId: string,
  phaseMasterId: string
): Promise<ActionResult> {
  try {
    const user = await requireAuth();
    const phase = await phaseService.addPhase(projectId, phaseMasterId, user.id);
    return { success: true, data: phase };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function updatePhaseAction(
  phaseId: string,
  data: {
    status?: string;
    dueDate?: string | null;
    assigneeId?: string | null;
  }
): Promise<ActionResult> {
  try {
    const user = await requireAuth();
    const phase = await phaseService.updatePhase(phaseId, data, user.id);
    return { success: true, data: phase };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function deletePhaseAction(
  phaseId: string
): Promise<ActionResult> {
  try {
    const user = await requireAuth();
    await phaseService.deletePhase(phaseId, user.id);
    return { success: true, data: null };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function reorderPhasesAction(
  projectId: string,
  orderedIds: string[]
): Promise<ActionResult> {
  try {
    await requireAuth();
    await phaseService.reorderPhases(projectId, orderedIds);
    return { success: true, data: null };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
