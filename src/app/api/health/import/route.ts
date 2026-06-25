import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseDateKey } from "@/lib/time";

export const maxDuration = 60;

/** Apple dates look like "2024-06-01 07:30:00 -0700". Make them ISO-parseable. */
function parseAppleDate(s: string): number {
  const iso = s.replace(" ", "T").replace(/ ([+-]\d{2})(\d{2})$/, "$1:$2");
  return Date.parse(iso);
}

const attr = (tag: string, name: string) =>
  new RegExp(`${name}="([^"]*)"`).exec(tag)?.[1];

// POST /api/health/import — raw export.xml text body. Aggregates StepCount + SleepAnalysis by day.
export async function POST(req: Request) {
  const xml = await req.text();
  if (!xml.includes("<Record")) {
    return NextResponse.json(
      { error: "That doesn't look like an Apple Health export.xml" },
      { status: 400 },
    );
  }

  const days = new Map<string, { steps: number; sleepMin: number }>();
  const get = (k: string) => {
    let d = days.get(k);
    if (!d) days.set(k, (d = { steps: 0, sleepMin: 0 }));
    return d;
  };

  for (const m of xml.matchAll(/<Record\b([^>]*?)\/?>/g)) {
    const tag = m[1];
    const type = attr(tag, "type");
    if (type === "HKQuantityTypeIdentifierStepCount") {
      const start = attr(tag, "startDate");
      const value = Number(attr(tag, "value"));
      if (start && Number.isFinite(value)) {
        get(start.slice(0, 10)).steps += value;
      }
    } else if (type === "HKCategoryTypeIdentifierSleepAnalysis") {
      const value = attr(tag, "value") ?? "";
      if (value.includes("Asleep")) {
        const start = attr(tag, "startDate");
        const end = attr(tag, "endDate");
        if (start && end) {
          const mins = (parseAppleDate(end) - parseAppleDate(start)) / 60_000;
          // attribute sleep to the wake (end) day
          if (mins > 0) get(end.slice(0, 10)).sleepMin += mins;
        }
      }
    }
  }

  const entries = [...days.entries()];
  for (let i = 0; i < entries.length; i += 100) {
    const chunk = entries.slice(i, i + 100);
    await prisma.$transaction(
      chunk.map(([key, v]) => {
        const day = parseDateKey(key);
        const data = {
          steps: v.steps > 0 ? Math.round(v.steps) : null,
          sleepMin: v.sleepMin > 0 ? Math.round(v.sleepMin) : null,
        };
        return prisma.healthMetric.upsert({
          where: { day },
          create: { day, ...data },
          update: data,
        });
      }),
    );
  }

  return NextResponse.json({ ok: true, days: entries.length });
}
