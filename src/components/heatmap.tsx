"use client";

import { useMemo } from "react";
import { addDays, startOfWeek, format } from "date-fns";
import { dateKey } from "@/lib/time";
import { cn } from "@/lib/utils";

const LEVELS = [
  "bg-muted",
  "bg-green-200 dark:bg-green-900",
  "bg-green-400 dark:bg-green-700",
  "bg-green-500 dark:bg-green-600",
  "bg-green-600 dark:bg-green-400",
];

function levelOf(count: number): number {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count === 3) return 3;
  return 4;
}

const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

/** GitHub-contributions-style grid for one calendar year. */
export function Heatmap({
  year,
  countByDay,
  unit = "workout",
}: {
  year: number;
  countByDay: Map<string, number>;
  unit?: string;
}) {
  const weeks = useMemo(() => {
    const first = new Date(year, 0, 1);
    const last = new Date(year, 11, 31);
    let cursor = startOfWeek(first, { weekStartsOn: 0 });
    const out: Date[][] = [];
    while (cursor <= last) {
      const week: Date[] = [];
      for (let d = 0; d < 7; d++) week.push(addDays(cursor, d));
      out.push(week);
      cursor = addDays(cursor, 7);
    }
    return out;
  }, [year]);

  // Month labels positioned at the first week each month appears.
  const monthLabels = useMemo(() => {
    const labels: { col: number; label: string }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, col) => {
      const firstOfMonth = week.find(
        (d) => d.getFullYear() === year && d.getDate() <= 7,
      );
      const m = (firstOfMonth ?? week[0]).getMonth();
      if (firstOfMonth && m !== lastMonth) {
        labels.push({ col, label: format(firstOfMonth, "MMM") });
        lastMonth = m;
      }
    });
    return labels;
  }, [weeks, year]);

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex flex-col gap-1">
        {/* month row */}
        <div className="flex pl-8">
          {weeks.map((_, col) => {
            const lbl = monthLabels.find((m) => m.col === col);
            return (
              <div
                key={col}
                className="w-[15px] text-[10px] text-muted-foreground"
              >
                {lbl?.label ?? ""}
              </div>
            );
          })}
        </div>

        <div className="flex gap-1">
          {/* weekday labels */}
          <div className="flex w-7 flex-col gap-[3px]">
            {DAY_LABELS.map((l, i) => (
              <div
                key={i}
                className="h-3 text-[9px] leading-3 text-muted-foreground"
              >
                {l}
              </div>
            ))}
          </div>

          {/* week columns */}
          <div className="flex gap-[3px]">
            {weeks.map((week, col) => (
              <div key={col} className="flex flex-col gap-[3px]">
                {week.map((day) => {
                  const inYear = day.getFullYear() === year;
                  const count = inYear
                    ? countByDay.get(dateKey(day)) ?? 0
                    : 0;
                  const lvl = levelOf(count);
                  return (
                    <div
                      key={day.toISOString()}
                      title={
                        inYear
                          ? `${format(day, "MMM d")}: ${count} ${unit}${count === 1 ? "" : "s"}`
                          : ""
                      }
                      className={cn(
                        "size-3 rounded-[2px]",
                        inYear ? LEVELS[lvl] : "bg-transparent",
                      )}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* legend */}
        <div className="flex items-center justify-end gap-1 pt-1 text-[10px] text-muted-foreground">
          Less
          {LEVELS.map((c, i) => (
            <span key={i} className={cn("size-3 rounded-[2px]", c)} />
          ))}
          More
        </div>
      </div>
    </div>
  );
}
