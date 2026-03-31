"use client";

import { useQuery } from "@tanstack/react-query";
import type { ActivityLogView } from "@/types";

async function fetchActivityLogs(
  projectId: string
): Promise<{ logs: ActivityLogView[]; nextCursor?: string }> {
  const res = await fetch(`/api/projects/${projectId}/activity-logs`);
  if (!res.ok) throw new Error("Failed to fetch activity logs");
  return res.json();
}

export function useActivityLogs(projectId: string | null) {
  return useQuery({
    queryKey: ["activity-logs", projectId],
    queryFn: () => fetchActivityLogs(projectId!),
    enabled: !!projectId,
  });
}
