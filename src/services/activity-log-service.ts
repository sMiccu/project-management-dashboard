import * as activityLogRepo from "@/repositories/activity-log-repository";

export async function recordCreate(projectId: string, userId: string) {
  return activityLogRepo.createLog({
    projectId,
    userId,
    action: "CREATE",
  });
}

export async function recordDelete(projectId: string, userId: string) {
  return activityLogRepo.createLog({
    projectId,
    userId,
    action: "DELETE",
  });
}

export async function recordChanges(
  projectId: string,
  userId: string,
  oldData: Record<string, unknown>,
  newData: Record<string, unknown>
) {
  const logs: {
    projectId: string;
    userId: string;
    action: string;
    field: string;
    oldValue: string | null;
    newValue: string | null;
  }[] = [];

  for (const key of Object.keys(newData)) {
    const oldVal = oldData[key];
    const newVal = newData[key];
    if (oldVal !== newVal && newVal !== undefined) {
      logs.push({
        projectId,
        userId,
        action: "UPDATE",
        field: key,
        oldValue: oldVal != null ? String(oldVal) : null,
        newValue: newVal != null ? String(newVal) : null,
      });
    }
  }

  if (logs.length > 0) {
    await activityLogRepo.createManyLogs(logs);
  }
}

export async function getProjectLogs(
  projectId: string,
  options?: { limit?: number; cursor?: string }
) {
  const limit = options?.limit ?? 50;
  const rows = await activityLogRepo.findLogsByProjectId(projectId, {
    limit,
    cursor: options?.cursor,
  });

  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? items[items.length - 1]?.id : undefined;

  return { logs: items, nextCursor };
}
