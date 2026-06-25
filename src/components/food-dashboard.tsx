"use client";

import { useMemo } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { Trash2, Flame } from "lucide-react";
import { FoodAdd } from "@/components/food-add";
import { useFoods, useDeleteFood } from "@/hooks/use-food";
import { startOfDay } from "@/lib/time";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function FoodDashboard() {
  const { from, to } = useMemo(() => {
    const s = startOfDay(new Date());
    const e = new Date(s.getTime() + 86_400_000);
    return { from: s.toISOString(), to: e.toISOString() };
  }, []);

  const { data: foods, isLoading } = useFoods(from, to);
  const del = useDeleteFood();

  const totals = useMemo(() => {
    const t = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    for (const f of foods ?? []) {
      t.calories += f.calories;
      t.protein += f.protein ?? 0;
      t.carbs += f.carbs ?? 0;
      t.fat += f.fat ?? 0;
    }
    return t;
  }, [foods]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Food</h1>
        <p className="text-sm text-muted-foreground">
          Snap a photo or describe a meal — AI estimates the calories.
        </p>
      </div>

      {/* Today totals */}
      <Card>
        <CardContent className="flex items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-950/50">
              <Flame className="size-5" />
            </div>
            <div>
              <div className="text-2xl font-semibold tabular-nums">
                {totals.calories}
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  kcal today
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-4 text-sm tabular-nums text-muted-foreground">
            <Macro label="P" v={totals.protein} />
            <Macro label="C" v={totals.carbs} />
            <Macro label="F" v={totals.fat} />
          </div>
        </CardContent>
      </Card>

      <FoodAdd />

      {/* Today's entries */}
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground">
          Today’s meals
        </h2>
        {isLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : (foods?.length ?? 0) === 0 ? (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            Nothing logged yet today.
          </p>
        ) : (
          <ul className="space-y-2">
            {foods!.map((f) => (
              <li
                key={f.id}
                className="flex items-center gap-3 rounded-lg border bg-card p-3"
              >
                {f.imageUrl ? (
                  <Image
                    src={f.imageUrl}
                    alt={f.description}
                    width={48}
                    height={48}
                    unoptimized
                    className="size-12 shrink-0 rounded-md object-cover"
                  />
                ) : (
                  <div className="grid size-12 shrink-0 place-items-center rounded-md bg-muted text-lg">
                    🍽️
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{f.description}</div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(f.eatenAt), "HH:mm")} ·{" "}
                    {f.protein ?? 0}p / {f.carbs ?? 0}c / {f.fat ?? 0}f
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-semibold tabular-nums">
                    {f.calories}
                    <span className="text-xs font-normal text-muted-foreground">
                      {" "}
                      kcal
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => del.mutate(f.id)}
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

function Macro({ label, v }: { label: string; v: number }) {
  return (
    <div className="text-center">
      <div className="font-medium text-foreground">{Math.round(v)}g</div>
      <div className="text-xs">{label}</div>
    </div>
  );
}
