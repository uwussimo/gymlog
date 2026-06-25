"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type Sprint = {
  id: string;
  startAt: string;
  activity: string | null;
  note: string | null;
  color: string | null;
};

async function fetchSprints(from: string, to: string): Promise<Sprint[]> {
  const res = await fetch(
    `/api/sprints?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
  );
  if (!res.ok) throw new Error("Failed to load sprints");
  const data = await res.json();
  return data.sprints;
}

export function useSprints(from: string, to: string) {
  return useQuery({
    queryKey: ["sprints", from, to],
    queryFn: () => fetchSprints(from, to),
  });
}

export type SaveSprintsInput = {
  slots: string[]; // ISO slot start times
  activity: string | null;
  note: string | null;
  color: string | null;
};

export function useSaveSprints() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: SaveSprintsInput) => {
      const res = await fetch("/api/sprints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sprints"] });
    },
  });
}
