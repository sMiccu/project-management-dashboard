"use server";

import { requireAuth } from "@/lib/auth/helpers";
import { projectCreateSchema, projectUpdateSchema } from "@/lib/validations/project";
import * as projectService from "@/services/project-service";

export type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createProjectAction(
  formData: Record<string, unknown>
): Promise<ActionResult> {
  try {
    const user = await requireAuth();
    const parsed = projectCreateSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const project = await projectService.createProject(parsed.data, user.id);
    return { success: true, data: project };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function updateProjectAction(
  id: string,
  formData: Record<string, unknown>
): Promise<ActionResult> {
  try {
    const user = await requireAuth();
    const parsed = projectUpdateSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const project = await projectService.updateProject(id, parsed.data, user.id);
    return { success: true, data: project };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function deleteProjectAction(
  id: string
): Promise<ActionResult> {
  try {
    const user = await requireAuth();
    await projectService.deleteProject(id, user.id);
    return { success: true, data: null };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
