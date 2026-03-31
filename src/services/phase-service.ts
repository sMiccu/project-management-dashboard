import * as phaseRepo from "@/repositories/phase-repository";
import * as activityLogRepo from "@/repositories/activity-log-repository";

export async function addPhase(
  projectId: string,
  phaseMasterId: string,
  userId: string
) {
  const orderIndex = await phaseRepo.getMaxOrderIndex(projectId);
  const phase = await phaseRepo.createPhase({
    projectId,
    phaseMasterId,
    orderIndex,
  });

  await activityLogRepo.createLog({
    projectId,
    userId,
    action: "UPDATE",
    field: "phases",
    oldValue: null,
    newValue: `フェーズ追加: ${phase.phaseMaster.name}`,
  });

  return phase;
}

export async function updatePhase(
  phaseId: string,
  data: {
    status?: string;
    dueDate?: string | null;
    assigneeId?: string | null;
  },
  userId: string
) {
  const current = await phaseRepo.findPhaseById(phaseId);
  if (!current) throw new Error("フェーズが見つかりません");

  const updateData: { status?: string; dueDate?: Date | null; assigneeId?: string | null } = {};
  if (data.status !== undefined) updateData.status = data.status;
  if (data.dueDate !== undefined) {
    updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  }
  if (data.assigneeId !== undefined) updateData.assigneeId = data.assigneeId;

  const logs: {
    projectId: string;
    userId: string;
    action: string;
    field: string;
    oldValue: string | null;
    newValue: string | null;
  }[] = [];

  if (data.status !== undefined && data.status !== current.status) {
    logs.push({
      projectId: current.projectId,
      userId,
      action: "UPDATE",
      field: `phase.${current.phaseMaster.name}.status`,
      oldValue: current.status,
      newValue: data.status,
    });
  }

  if (data.dueDate !== undefined) {
    const oldDate = current.dueDate?.toISOString().slice(0, 10) ?? null;
    const newDate = data.dueDate?.slice(0, 10) ?? null;
    if (oldDate !== newDate) {
      logs.push({
        projectId: current.projectId,
        userId,
        action: "UPDATE",
        field: `phase.${current.phaseMaster.name}.dueDate`,
        oldValue: oldDate,
        newValue: newDate,
      });
    }
  }

  if (logs.length > 0) {
    await activityLogRepo.createManyLogs(logs);
  }

  return phaseRepo.updatePhase(phaseId, updateData);
}

export async function deletePhase(phaseId: string, userId: string) {
  const current = await phaseRepo.findPhaseById(phaseId);
  if (!current) throw new Error("フェーズが見つかりません");

  await activityLogRepo.createLog({
    projectId: current.projectId,
    userId,
    action: "UPDATE",
    field: "phases",
    oldValue: `フェーズ削除: ${current.phaseMaster.name}`,
    newValue: null,
  });

  return phaseRepo.deletePhase(phaseId);
}

export async function reorderPhases(
  projectId: string,
  orderedIds: string[]
) {
  return phaseRepo.reorderPhases(projectId, orderedIds);
}
