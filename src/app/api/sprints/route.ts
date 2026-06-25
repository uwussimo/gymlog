import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/sprints?from=ISO&to=ISO — slots in [from, to)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  if (!from || !to) {
    return NextResponse.json({ error: "from and to required" }, { status: 400 });
  }

  const sprints = await prisma.sprint.findMany({
    where: { startAt: { gte: new Date(from), lt: new Date(to) } },
    orderBy: { startAt: "asc" },
  });

  return NextResponse.json({ sprints });
}

// POST /api/sprints — upsert a set of slots at once (a "range fill").
// Body: { slots: ISO[], activity, note, color }.
// An empty activity + note clears (deletes) those slots.
export async function POST(req: Request) {
  const body = await req.json();
  const slots: string[] = body.slots ?? [];
  const activity: string | null = body.activity?.trim() || null;
  const note: string | null = body.note?.trim() || null;
  const color: string | null = body.color || null;

  if (!Array.isArray(slots) || slots.length === 0) {
    return NextResponse.json({ error: "slots required" }, { status: 400 });
  }

  const dates = slots.map((s) => new Date(s));

  if (!activity && !note) {
    await prisma.sprint.deleteMany({ where: { startAt: { in: dates } } });
    return NextResponse.json({ ok: true, cleared: dates.length });
  }

  await prisma.$transaction(
    dates.map((startAt) =>
      prisma.sprint.upsert({
        where: { startAt },
        create: { startAt, activity, note, color },
        update: { activity, note, color },
      }),
    ),
  );

  return NextResponse.json({ ok: true, count: dates.length });
}
