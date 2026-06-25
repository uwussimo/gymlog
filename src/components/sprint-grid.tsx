"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSprints, useSaveSprints, type Sprint } from "@/hooks/use-sprints";
import {
  buildSlots,
  timeLabel,
  humanDuration,
  SLOT_MINUTES,
} from "@/lib/time";
import { COLOR_KEYS, colorOf, type ColorKey } from "@/lib/colors";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { SprintEditor } from "@/components/sprint-editor";

const ROW_H = 30; // px per 15-min slot

type Block = {
  start: number; // slot index
  len: number;
  activity: string | null;
  note: string | null;
  color: string | null;
};

export function SprintGrid({
  dayKey,
  startHour = 6,
  slotCount = 72,
}: {
  dayKey: string;
  startHour?: number;
  slotCount?: number;
}) {
  const slots = useMemo(
    () => buildSlots(dayKey, startHour, slotCount),
    [dayKey, startHour, slotCount],
  );
  const from = slots[0].toISOString();
  const to = new Date(
    slots[slots.length - 1].getTime() + SLOT_MINUTES * 60_000,
  ).toISOString();

  const { data: sprints, isLoading } = useSprints(from, to);
  const save = useSaveSprints();

  // Map slot index -> sprint row
  const byIndex = useMemo(() => {
    const map = new Map<number, Sprint>();
    if (!sprints) return map;
    const idxByIso = new Map(slots.map((d, i) => [d.toISOString(), i]));
    for (const s of sprints) {
      const i = idxByIso.get(new Date(s.startAt).toISOString());
      if (i !== undefined) map.set(i, s);
    }
    return map;
  }, [sprints, slots]);

  // Merge consecutive slots with identical activity+color into blocks.
  const blocks = useMemo(() => {
    const out: Block[] = [];
    let i = 0;
    while (i < slotCount) {
      const s = byIndex.get(i);
      const filled = s && (s.activity || s.note);
      if (!filled) {
        i++;
        continue;
      }
      let j = i + 1;
      while (j < slotCount) {
        const n = byIndex.get(j);
        if (
          n &&
          (n.activity || n.note) &&
          (n.activity ?? "") === (s.activity ?? "") &&
          (n.color ?? "") === (s.color ?? "")
        ) {
          j++;
        } else break;
      }
      out.push({
        start: i,
        len: j - i,
        activity: s.activity,
        note: s.note,
        color: s.color,
      });
      i = j;
    }
    return out;
  }, [byIndex, slotCount]);

  const blockAt = useMemo(() => {
    const m = new Map<number, Block>();
    for (const b of blocks) for (let k = b.start; k < b.start + b.len; k++) m.set(k, b);
    return m;
  }, [blocks]);

  // ---- selection / drag ----
  const [anchor, setAnchor] = useState<number | null>(null);
  const [focus, setFocus] = useState<number | null>(null);
  const dragging = useRef(false);
  const moved = useRef(false);

  const [editor, setEditor] = useState<{
    range: [number, number];
    initial: { activity: string; note: string; color: ColorKey | null };
    prevActivity: { activity: string; color: string | null } | null;
  } | null>(null);

  const selRange: [number, number] | null =
    anchor !== null && focus !== null
      ? [Math.min(anchor, focus), Math.max(anchor, focus)]
      : null;

  function openEditorFor(lo: number, hi: number) {
    const s = byIndex.get(lo);
    const prevBlock = lo > 0 ? blockAt.get(lo - 1) : undefined;
    setEditor({
      range: [lo, hi],
      initial: {
        activity: s?.activity ?? "",
        note: s?.note ?? "",
        color: (s?.color as ColorKey | null) ?? null,
      },
      prevActivity: prevBlock
        ? { activity: prevBlock.activity ?? "", color: prevBlock.color }
        : null,
    });
  }

  function commit() {
    if (anchor === null || focus === null) return;
    let lo = Math.min(anchor, focus);
    let hi = Math.max(anchor, focus);
    // A plain click inside a block selects the whole block.
    if (!moved.current) {
      const b = blockAt.get(lo);
      if (b) {
        lo = b.start;
        hi = b.start + b.len - 1;
      }
    }
    openEditorFor(lo, hi);
    setAnchor(null);
    setFocus(null);
  }

  useEffect(() => {
    function up() {
      if (dragging.current) {
        dragging.current = false;
        commit();
      }
    }
    window.addEventListener("pointerup", up);
    return () => window.removeEventListener("pointerup", up);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchor, focus, blockAt, byIndex]);

  function onDown(i: number) {
    dragging.current = true;
    moved.current = false;
    setAnchor(i);
    setFocus(i);
  }
  function onEnter(i: number) {
    if (!dragging.current) return;
    moved.current = true;
    setFocus(i);
  }

  async function handleSave(v: {
    activity: string;
    note: string;
    color: ColorKey | null;
  }) {
    if (!editor) return;
    const [lo, hi] = editor.range;
    const isoSlots = [];
    for (let k = lo; k <= hi; k++) isoSlots.push(slots[k].toISOString());
    await save.mutateAsync({
      slots: isoSlots,
      activity: v.activity || null,
      note: v.note || null,
      color: v.color,
    });
    setEditor(null);
  }

  // current-time indicator
  const nowTop = useMemo(() => {
    const now = new Date();
    const first = slots[0].getTime();
    const mins = (now.getTime() - first) / 60_000;
    if (mins < 0 || mins > slotCount * SLOT_MINUTES) return null;
    return (mins / SLOT_MINUTES) * ROW_H;
  }, [slots, slotCount]);

  if (isLoading) {
    return (
      <div className="space-y-1">
        {Array.from({ length: 16 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-full" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="select-none rounded-lg border bg-card">
        <div className="grid grid-cols-[3.25rem_1fr]">
          {/* time rail */}
          <div className="border-r">
            {slots.map((d, i) => (
              <div
                key={i}
                className={cn(
                  "flex h-[30px] items-start justify-end pr-2 pt-0.5 text-[11px] tabular-nums",
                  d.getMinutes() === 0
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground/60",
                )}
              >
                {timeLabel(d)}
              </div>
            ))}
          </div>

          {/* content column */}
          <div
            className="relative"
            style={{ height: slotCount * ROW_H }}
            onPointerLeave={() => {
              // keep dragging state; selection just stops updating
            }}
          >
            {/* hit + empty layer */}
            {slots.map((_, i) => {
              const filled = blockAt.has(i);
              return (
                <div
                  key={i}
                  onPointerDown={() => onDown(i)}
                  onPointerEnter={() => onEnter(i)}
                  className={cn(
                    "absolute inset-x-0 cursor-pointer border-b border-border/40",
                    !filled && "hover:bg-muted/60",
                  )}
                  style={{ top: i * ROW_H, height: ROW_H }}
                />
              );
            })}

            {/* block overlay (visual only) */}
            {blocks.map((b) => {
              const c = colorOf(b.color);
              return (
                <div
                  key={b.start}
                  className={cn(
                    "pointer-events-none absolute inset-x-0 overflow-hidden rounded-[3px] border px-2 py-1",
                    c.cell,
                    c.text,
                  )}
                  style={{
                    top: b.start * ROW_H + 1,
                    height: b.len * ROW_H - 2,
                  }}
                >
                  <div className="flex h-full flex-col justify-between">
                    <div className="text-[13px] font-medium leading-tight line-clamp-2">
                      {b.activity}
                    </div>
                    <div className="flex items-end justify-between gap-2">
                      <span className="text-[11px] opacity-70">
                        {humanDuration(b.len)}
                      </span>
                      {b.note ? (
                        <span className="truncate text-[11px] italic opacity-70">
                          {b.note}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* selection overlay */}
            {selRange && (
              <div
                className="pointer-events-none absolute inset-x-0 rounded-[3px] ring-2 ring-primary ring-offset-0"
                style={{
                  top: selRange[0] * ROW_H,
                  height: (selRange[1] - selRange[0] + 1) * ROW_H,
                }}
              />
            )}

            {/* now line */}
            {nowTop !== null && (
              <div
                className="pointer-events-none absolute inset-x-0 z-10 border-t border-red-500"
                style={{ top: nowTop }}
              >
                <div className="absolute -left-1 -top-1 size-2 rounded-full bg-red-500" />
              </div>
            )}
          </div>
        </div>
      </div>

      {editor && (
        <SprintEditor
          open
          range={editor.range}
          slots={slots}
          initial={editor.initial}
          prevActivity={editor.prevActivity}
          saving={save.isPending}
          onClose={() => setEditor(null)}
          onSave={handleSave}
        />
      )}
    </>
  );
}
