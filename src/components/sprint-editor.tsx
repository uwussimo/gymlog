"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { COLORS, COLOR_KEYS, type ColorKey } from "@/lib/colors";
import { timeLabel, humanDuration, SLOT_MINUTES } from "@/lib/time";
import { cn } from "@/lib/utils";
import { ArrowDownToLine, Trash2 } from "lucide-react";

export function SprintEditor({
  open,
  range,
  slots,
  initial,
  prevActivity,
  saving,
  onClose,
  onSave,
}: {
  open: boolean;
  range: [number, number];
  slots: Date[];
  initial: { activity: string; note: string; color: ColorKey | null };
  prevActivity: { activity: string; color: string | null } | null;
  saving: boolean;
  onClose: () => void;
  onSave: (v: { activity: string; note: string; color: ColorKey | null }) => void;
}) {
  const [activity, setActivity] = useState(initial.activity);
  const [note, setNote] = useState(initial.note);
  const [color, setColor] = useState<ColorKey | null>(initial.color);

  useEffect(() => {
    setActivity(initial.activity);
    setNote(initial.note);
    setColor(initial.color);
  }, [initial]);

  const [lo, hi] = range;
  const len = hi - lo + 1;
  const startLabel = timeLabel(slots[lo]);
  const endLabel = timeLabel(
    new Date(slots[hi].getTime() + SLOT_MINUTES * 60_000),
  );

  function submit() {
    onSave({ activity: activity.trim(), note: note.trim(), color });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {startLabel} – {endLabel}
          </DialogTitle>
          <DialogDescription>
            {len} slot{len > 1 ? "s" : ""} · {humanDuration(len)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {prevActivity && prevActivity.activity && (
            <button
              type="button"
              onClick={() => {
                setActivity(prevActivity.activity);
                if (prevActivity.color) setColor(prevActivity.color as ColorKey);
              }}
              className="flex w-full items-center gap-2 rounded-md border border-dashed px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted"
            >
              <ArrowDownToLine className="size-4 shrink-0" />
              <span className="truncate">
                Continue “{prevActivity.activity}”
              </span>
            </button>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="activity">What did you do?</Label>
            <Input
              id="activity"
              autoFocus
              value={activity}
              placeholder="e.g. Working on IT-9223"
              onChange={(e) => setActivity(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-1.5">
              {COLOR_KEYS.map((k) => (
                <button
                  key={k}
                  type="button"
                  aria-label={COLORS[k].label}
                  onClick={() => setColor(k === color ? null : k)}
                  className={cn(
                    "size-7 rounded-full border-2 transition-transform",
                    COLORS[k].swatch,
                    color === k
                      ? "scale-110 border-foreground"
                      : "border-transparent hover:scale-105",
                  )}
                />
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea
              id="note"
              value={note}
              rows={2}
              placeholder="Total time, status, who you talked to…"
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="flex-row justify-between gap-2 sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            disabled={saving}
            onClick={() => onSave({ activity: "", note: "", color: null })}
          >
            <Trash2 className="size-4" />
            Clear
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="button" onClick={submit} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
