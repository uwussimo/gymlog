import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay } from "@/lib/time";

// GET /api/health?from=ISO&to=ISO
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const where =
    from && to ? { day: { gte: new Date(from), lt: new Date(to) } } : undefined;
  const metrics = await prisma.healthMetric.findMany({
    where,
    orderBy: { day: "asc" },
  });
  return NextResponse.json({ metrics });
}

// POST /api/health — upsert one day's metrics. Body: { day: ISO, steps?, sleepMin?, restingHr? }
export async function POST(req: Request) {
  const b = await req.json();
  if (!b.day) return NextResponse.json({ error: "day required" }, { status: 400 });
  const day = startOfDay(new Date(b.day));
  const data = {
    steps: b.steps != null ? Number(b.steps) : null,
    sleepMin: b.sleepMin != null ? Number(b.sleepMin) : null,
    restingHr: b.restingHr != null ? Number(b.restingHr) : null,
  };
  const metric = await prisma.healthMetric.upsert({
    where: { day },
    create: { day, ...data },
    update: data,
  });
  return NextResponse.json({ metric });
}
