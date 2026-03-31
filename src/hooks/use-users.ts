"use client";

import { useQuery } from "@tanstack/react-query";
import type { UserSummary } from "@/types";

async function fetchUsers(): Promise<UserSummary[]> {
  const res = await fetch("/api/users");
  if (!res.ok) throw new Error("Failed to fetch users");
  const data = await res.json();
  return data.users;
}

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });
}
