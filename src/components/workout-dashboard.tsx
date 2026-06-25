"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { format, subDays } from "date-fns";
import { Dumbbell, Trash2, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Heatmap } from "@/components/heatmap";
import {
  useWorkouts,
  useSaveWorkout,
  useDeleteWorkout,
} from "@/hooks/use-workouts";
import { dateKey } from "@/lib/time";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TYPES = ["Gym", "Run", "Cycle", "Swim", "Yoga", "Sports", "Walk"];

export function WorkoutDashboard() {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const from = new Date(year, 0, 1).toISOString();
  const to = new Date(year + 1, 0, 1).toISOString();
  const { data: workouts } = useWorkouts(from, to);
  const save = useSaveWorkout();
  const del = useDeleteWorkout();

  const [type, setType] = useState("Gym");
  const [duration, setDuration] = useState("");

  const countByDay = useMemo(() => {
    const m = new Map<string, number>();
    for (const w of workouts ?? []) {
      const k = dateKey(new Date(w.performedAt));
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return m;
  }, [workouts]);

  const stats = useMemo(() => {
    const total = workouts?.length ?? 0;
    // current streak of consecutive days ending today (or yesterday)
    let streak = 0;
    let cursor = new Date();
    if (!countByDay.has(dateKey(cursor))) cursor = subDays(cursor, 1);
    while (countByDay.has(dateKey(cursor))) {
      streak++;
      cursor = subDays(cursor, 1);
    }
    const activeDays = countByDay.size;
    return { total, streak, activeDays };
  }, [workouts, countByDay]);

  async function quickLog() {
    await save.mutateAsync({
      type,
      durationMin: duration ? Number(duration) : null,
      intensity: 1,
    });
    setDuration("");
    toast.success(`Logged ${type} 💪`);
  }

  const isCurrentYear = year === new Date().getFullYear();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Workouts</h1>
          <p className="text-sm text-muted-foreground">
            Keep the squares green.
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setYear((y) => y - 1)}
            aria-label="Previous year"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="w-12 text-center text-sm font-medium tabular-nums">
            {year}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setYear((y) => y + 1)}
            disabled={isCurrentYear}
            aria-label="Next year"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* stats */}
      <div className="grid grid-cols-3 gap-3">
        <Stat label={`Workouts in ${year}`} value={stats.total} />
        <Stat label="Current streak" value={`${stats.streak}d`} />
        <Stat label="Active days" value={stats.activeDays} />
      </div>

      {/* heatmap */}
      <Card>
        <CardContent className="py-4">
          <Heatmap year={year} countByDay={countByDay} />
        </CardContent>
      </Card>

      {/* quick log */}
      <Card>
        <CardContent className="flex flex-wrap items-end gap-2 py-4">
          <div className="flex-1 space-y-1">
            <label className="text-xs text-muted-foreground">Type</label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-24 space-y-1">
            <label className="text-xs text-muted-foreground">Min</label>
            <Input
              inputMode="numeric"
              placeholder="45"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>
          <Button onClick={quickLog} disabled={save.isPending}>
            <Plus className="size-4" />
            Log
          </Button>
        </CardContent>
      </Card>

      {/* recent */}
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground">Recent</h2>
        {(workouts?.length ?? 0) === 0 ? (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            No workouts logged in {year} yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {workouts!.slice(0, 12).map((w) => (
              <li
                key={w.id}
                className="flex items-center gap-3 rounded-lg border bg-card p-3"
              >
                <div className="grid size-9 shrink-0 place-items-center rounded-md bg-green-100 text-green-600 dark:bg-green-950/50">
                  <Dumbbell className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{w.type}</div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(w.performedAt), "EEE, MMM d · HH:mm")}
                    {w.durationMin ? ` · ${w.durationMin} min` : ""}
                  </div>
                </div>
                <button
                  onClick={() => del.mutate(w.id)}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-destructive"
                  aria-label="Delete"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="py-4 text-center">
        <div className="text-2xl font-semibold tabular-nums">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}
