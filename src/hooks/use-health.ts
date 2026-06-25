"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type HealthMetric = {
  id: string;
  day: string;
  steps: number | null;
  sleepMin: number | null;
  restingHr: number | null;
};

export function useHealth(from: string, to: string) {
  return useQuery({
    queryKey: ["health", from, to],
    queryFn: async (): Promise<HealthMetric[]> => {
      const res = await fetch(
        `/api/health?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
      );
      if (!res.ok) throw new Error("Failed to load health metrics");
      return (await res.json()).metrics;
    },
  });
}

export function useSaveHealth() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      day: string;
      steps?: number | null;
      sleepMin?: number | null;
      restingHr?: number | null;
    }) => {
      const res = await fetch("/api/health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["health"] }),
  });
}

export function useImportHealth() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (xml: string) => {
      const res = await fetch("/api/health/import", {
        method: "POST",
        headers: { "Content-Type": "text/xml" },
        body: xml,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");
      return data as { ok: boolean; days: number };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["health"] }),
  });
}
