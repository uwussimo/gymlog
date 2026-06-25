"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { format, isToday, subDays } from "date-fns";
import { Flame, Footprints, Moon, Upload, Loader2, Heart } from "lucide-react";
import { BarStats, type BarPoint } from "@/components/bar-stats";
import { useFoods } from "@/hooks/use-food";
import { useHealth, useSaveHealth, useImportHealth } from "@/hooks/use-health";
import { dateKey, startOfDay } from "@/lib/time";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DAYS = 14;

export function HealthDashboard() {
  // window: last 14 days
  const { rangeFrom, rangeTo, dayList } = useMemo(() => {
    const today = startOfDay(new Date());
    const list: Date[] = [];
    for (let i = DAYS - 1; i >= 0; i--) list.push(subDays(today, i));
    return {
      rangeFrom: list[0].toISOString(),
      rangeTo: new Date(today.getTime() + 86_400_000).toISOString(),
      dayList: list,
    };
  }, []);

  const { data: foods } = useFoods(rangeFrom, rangeTo);
  const { data: metrics } = useHealth(rangeFrom, rangeTo);

  const calorieByDay = useMemo(() => {
    const m = new Map<string, number>();
    for (const f of foods ?? [])
      m.set(
        dateKey(new Date(f.eatenAt)),
        (m.get(dateKey(new Date(f.eatenAt))) ?? 0) + f.calories,
      );
    return m;
  }, [foods]);

  const metricByDay = useMemo(() => {
    const m = new Map<string, { steps: number | null; sleepMin: number | null }>();
    for (const x of metrics ?? [])
      m.set(dateKey(new Date(x.day)), { steps: x.steps, sleepMin: x.sleepMin });
    return m;
  }, [metrics]);

  const calorieData: BarPoint[] = dayList.map((d) => ({
    label: format(d, "d"),
    value: calorieByDay.get(dateKey(d)) ?? 0,
    today: isToday(d),
  }));
  const stepData: BarPoint[] = dayList.map((d) => ({
    label: format(d, "d"),
    value: metricByDay.get(dateKey(d))?.steps ?? 0,
    today: isToday(d),
  }));
  const sleepData: BarPoint[] = dayList.map((d) => ({
    label: format(d, "d"),
    value: metricByDay.get(dateKey(d))?.sleepMin ?? 0,
    today: isToday(d),
  }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Health</h1>
        <p className="text-sm text-muted-foreground">
          Your last {DAYS} days at a glance.
        </p>
      </div>

      <BarStats
        title="Calorie intake"
        icon={<Flame className="size-4 text-orange-500" />}
        data={calorieData}
        unit="kcal"
        accent="#f97316"
      />
      <BarStats
        title="Steps"
        icon={<Footprints className="size-4 text-sky-500" />}
        data={stepData}
        unit="steps"
        accent="#0ea5e9"
        formatValue={(v) =>
          v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(Math.round(v))
        }
      />
      <BarStats
        title="Sleep"
        icon={<Moon className="size-4 text-violet-500" />}
        data={sleepData}
        unit="h"
        accent="#8b5cf6"
        formatValue={(v) => (v / 60).toFixed(1)}
      />

      <ManualEntry currentMetric={metricByDay.get(dateKey(new Date()))} />
      <AppleHealthImport />
    </div>
  );
}

function ManualEntry({
  currentMetric,
}: {
  currentMetric?: { steps: number | null; sleepMin: number | null };
}) {
  const save = useSaveHealth();
  const [steps, setSteps] = useState("");
  const [sleepH, setSleepH] = useState("");

  async function submit() {
    await save.mutateAsync({
      day: new Date().toISOString(),
      steps: steps ? Number(steps) : currentMetric?.steps ?? null,
      sleepMin: sleepH
        ? Math.round(Number(sleepH) * 60)
        : currentMetric?.sleepMin ?? null,
    });
    toast.success("Today's metrics saved");
    setSteps("");
    setSleepH("");
  }

  return (
    <Card>
      <CardContent className="space-y-3 py-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Heart className="size-4 text-rose-500" />
          Log today manually
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex-1 space-y-1">
            <Label className="text-xs text-muted-foreground">Steps</Label>
            <Input
              inputMode="numeric"
              placeholder={String(currentMetric?.steps ?? "8000")}
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
            />
          </div>
          <div className="flex-1 space-y-1">
            <Label className="text-xs text-muted-foreground">Sleep (h)</Label>
            <Input
              inputMode="decimal"
              placeholder={
                currentMetric?.sleepMin
                  ? (currentMetric.sleepMin / 60).toFixed(1)
                  : "7.5"
              }
              value={sleepH}
              onChange={(e) => setSleepH(e.target.value)}
            />
          </div>
          <Button onClick={submit} disabled={save.isPending}>
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AppleHealthImport() {
  const imp = useImportHealth();

  async function onFile(file: File | undefined) {
    if (!file) return;
    toast.info("Reading export… large files can take a moment.");
    try {
      const text = await file.text();
      const res = await imp.mutateAsync(text);
      toast.success(`Imported ${res.days} days of steps & sleep`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Import failed");
    }
  }

  return (
    <Card>
      <CardContent className="space-y-2 py-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Upload className="size-4" />
          Import from Apple Health
        </div>
        <p className="text-xs text-muted-foreground">
          A browser app can’t read Apple Health directly. On your iPhone: Health
          app → profile → <b>Export All Health Data</b>, unzip, and upload the{" "}
          <code>export.xml</code> here to pull in steps &amp; sleep.
        </p>
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed py-4 text-sm text-muted-foreground hover:bg-muted/50">
          {imp.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          {imp.isPending ? "Importing…" : "Choose export.xml"}
          <input
            type="file"
            accept=".xml,text/xml"
            className="hidden"
            disabled={imp.isPending}
            onChange={(e) => onFile(e.target.files?.[0])}
          />
        </label>
      </CardContent>
    </Card>
  );
}
