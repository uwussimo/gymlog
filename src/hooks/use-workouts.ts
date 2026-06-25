"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type Workout = {
  id: string;
  performedAt: string;
  type: string;
  durationMin: number | null;
  note: string | null;
  intensity: number;
};

export function useWorkouts(from: string, to: string) {
  return useQuery({
    queryKey: ["workouts", from, to],
    queryFn: async (): Promise<Workout[]> => {
      const res = await fetch(
        `/api/workouts?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
      );
      if (!res.ok) throw new Error("Failed to load workouts");
      return (await res.json()).workouts;
    },
  });
}

export function useSaveWorkout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Record<string, unknown>) => {
      const res = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workouts"] }),
  });
}

export function useDeleteWorkout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/workouts?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workouts"] }),
  });
}
