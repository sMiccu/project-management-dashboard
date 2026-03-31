import * as projectRepo from "@/repositories/project-repository";
import * as activityLogService from "@/services/activity-log-service";
import type { ProjectView, PhaseView, UserSummary } from "@/types";

function toProjectView(raw: Awaited<ReturnType<typeof projectRepo.findProjectById>>): ProjectView | null {
  if (!raw) return null;
  const orderAmount = raw.orderAmount ?? 0;
  const outsourcingCost = raw.outsourcingCost ?? 0;
  const expense = raw.expense ?? 0;
  return {
    id: raw.id,
    companyName: raw.companyName,
    projectName: raw.projectName,
    status: raw.status as ProjectView["status"],
    contractType: raw.contractType as ProjectView["contractType"],
    orderAmount,
    outsourcingCost,
    expense,
    grossProfit: orderAmount - (outsourcingCost + expense),
    googleDriveUrl: raw.googleDriveUrl,
    members: raw.members.map((m) => m.user as UserSummary),
    phases: raw.phases.map(
      (p) =>
        ({
          id: p.id,
          phaseMaster: p.phaseMaster,
          status: p.status as PhaseView["status"],
          dueDate: p.dueDate?.toISOString() ?? null,
          assignee: p.assignee as UserSummary | null,
          orderIndex: p.orderIndex,
        }) satisfies PhaseView
    ),
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
  };
}

export async function getProjects(
  filters: projectRepo.ProjectFilters
): Promise<ProjectView[]> {
  const rows = await projectRepo.findProjects(filters);
  return rows.map((r) => toProjectView(r)!);
}

export async function getProjectById(
  id: string
): Promise<ProjectView | null> {
  const row = await projectRepo.findProjectById(id);
  return toProjectView(row);
}

export async function createProject(
  data: {
    companyName: string;
    projectName: string;
    status?: string;
    contractType?: string | null;
    orderAmount?: number;
    outsourcingCost?: number;
    expense?: number;
    googleDriveUrl?: string | null;
    memberIds?: string[];
    phaseMasterIds?: string[];
  },
  userId: string
): Promise<ProjectView> {
  const project = await projectRepo.createProject(data);
  await activityLogService.recordCreate(project.id, userId);
  return toProjectView(project)!;
}

export async function updateProject(
  id: string,
  data: {
    companyName?: string;
    projectName?: string;
    status?: string;
    contractType?: string | null;
    orderAmount?: number;
    outsourcingCost?: number;
    expense?: number;
    googleDriveUrl?: string | null;
    memberIds?: string[];
  },
  userId: string
): Promise<ProjectView> {
  const current = await projectRepo.findProjectById(id);
  if (!current) throw new Error("案件が見つかりません");

  const { memberIds, ...rest } = data;

  const prismaFields = new Set([
    "companyName", "projectName", "status", "contractType",
    "orderAmount", "outsourcingCost", "expense", "googleDriveUrl",
  ]);

  const filteredUpdate: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(rest)) {
    if (value !== undefined && prismaFields.has(key)) {
      filteredUpdate[key] = value;
    }
  }

  if (Object.keys(filteredUpdate).length > 0) {
    const oldData: Record<string, unknown> = {};
    for (const key of Object.keys(filteredUpdate)) {
      oldData[key] = (current as Record<string, unknown>)[key];
    }
    await activityLogService.recordChanges(id, userId, oldData, filteredUpdate);
  }

  const updated = await projectRepo.updateProjectData(id, filteredUpdate);

  if (memberIds !== undefined) {
    await projectRepo.updateProjectMembers(id, memberIds);
  }

  const refreshed = await projectRepo.findProjectById(id);
  return toProjectView(refreshed ?? updated)!;
}

export async function deleteProject(
  id: string,
  userId: string
): Promise<void> {
  await activityLogService.recordDelete(id, userId);
  await projectRepo.deleteProject(id);
}
