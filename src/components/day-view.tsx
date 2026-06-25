"use client";

import { useMemo, useState } from "react";
import { addDays, format, isToday } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SprintGrid } from "@/components/sprint-grid";
import { useSprints } from "@/hooks/use-sprints";
import { buildSlots, dateKey, humanDuration, SLOT_MINUTES } from "@/lib/time";
import { colorOf } from "@/lib/colors";

const START_HOUR = 6;
const SLOT_COUNT = 80; // 6:00 -> 02:00 next day

export function DayView() {
  const [date, setDate] = useState(() => new Date());
  const key = dateKey(date);

  const slots = useMemo(
    () => buildSlots(key, START_HOUR, SLOT_COUNT),
    [key],
  );
  const from = slots[0].toISOString();
  const to = new Date(
    slots[slots.length - 1].getTime() + SLOT_MINUTES * 60_000,
  ).toISOString();
  const { data: sprints } = useSprints(from, to);

  const summary = useMemo(() => {
    if (!sprints) return { totalSlots: 0, rows: [] as { activity: string; color: string | null; slots: number }[] };
    const byActivity = new Map<string, { color: string | null; slots: number }>();
    let total = 0;
    for (const s of sprints) {
      if (!s.activity) continue;
      total++;
      const cur = byActivity.get(s.activity);
      if (cur) cur.slots++;
      else byActivity.set(s.activity, { color: s.color, slots: 1 });
    }
    const rows = [...byActivity.entries()]
      .map(([activity, v]) => ({ activity, ...v }))
      .sort((a, b) => b.slots - a.slots);
    return { totalSlots: total, rows };
  }, [sprints]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {format(date, "EEEE, MMM d")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isToday(date) ? "Today" : format(date, "yyyy")} ·{" "}
            {humanDuration(summary.totalSlots)} logged
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setDate((d) => addDays(d, -1))}
            aria-label="Previous day"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDate(new Date())}
            disabled={isToday(date)}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setDate((d) => addDays(d, 1))}
            aria-label="Next day"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
        <SprintGrid dayKey={key} startHour={START_HOUR} slotCount={SLOT_COUNT} />

        <aside className="space-y-3 lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-lg border bg-card p-3">
            <h2 className="mb-2 text-sm font-medium">Time breakdown</h2>
            {summary.rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Drag across slots to log what you did.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {summary.rows.map((r) => (
                  <li key={r.activity} className="flex items-center gap-2 text-sm">
                    <span
                      className={`size-2.5 shrink-0 rounded-full ${colorOf(r.color).swatch}`}
                    />
                    <span className="flex-1 truncate">{r.activity}</span>
                    <span className="shrink-0 tabular-nums text-muted-foreground">
                      {humanDuration(r.slots)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p className="px-1 text-xs text-muted-foreground">
            Tip: click a slot to log it, or drag down several slots to fill a
            block at once. Adjacent slots with the same text merge automatically.
          </p>
        </aside>
      </div>
    </div>
  );
}
