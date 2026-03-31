"use client";

import { useQuery } from "@tanstack/react-query";
import type { PhaseMasterSummary } from "@/types";

async function fetchPhaseMasters(): Promise<PhaseMasterSummary[]> {
  const res = await fetch("/api/phase-masters");
  if (!res.ok) throw new Error("Failed to fetch phase masters");
  const data = await res.json();
  return data.phaseMasters;
}

export function usePhaseMasters() {
  return useQuery({
    queryKey: ["phase-masters"],
    queryFn: fetchPhaseMasters,
  });
}
