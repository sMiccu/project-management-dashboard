"use client";

import { useQuery } from "@tanstack/react-query";
import type { ProjectView } from "@/types";

interface ProjectFilters {
  status?: string;
  memberId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

async function fetchProjects(filters: ProjectFilters): Promise<ProjectView[]> {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.memberId) params.set("memberId", filters.memberId);
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);

  const qs = params.toString();
  const res = await fetch(`/api/projects${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch projects");
  const data = await res.json();
  return data.projects;
}

export function useProjects(filters: ProjectFilters = {}) {
  return useQuery({
    queryKey: ["projects", filters],
    queryFn: () => fetchProjects(filters),
  });
}
