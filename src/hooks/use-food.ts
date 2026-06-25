"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type Food = {
  id: string;
  eatenAt: string;
  description: string;
  source: string;
  imageUrl: string | null;
  calories: number;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  aiNote: string | null;
};

export type Estimate = {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  note: string;
};

export function useFoods(from?: string, to?: string) {
  const qs = from && to ? `?from=${from}&to=${to}` : "";
  return useQuery({
    queryKey: ["food", from ?? "all", to ?? "all"],
    queryFn: async (): Promise<Food[]> => {
      const res = await fetch(`/api/food${qs}`);
      if (!res.ok) throw new Error("Failed to load food");
      return (await res.json()).foods;
    },
  });
}

export function useEstimate() {
  return useMutation({
    mutationFn: async (input: {
      description?: string;
      imageDataUrl?: string;
    }): Promise<Estimate> => {
      const res = await fetch("/api/food/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Estimation failed");
      return data.estimate;
    },
  });
}

export function useSaveFood() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Record<string, unknown>) => {
      const res = await fetch("/api/food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["food"] }),
  });
}

export function useDeleteFood() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/food?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["food"] }),
  });
}
