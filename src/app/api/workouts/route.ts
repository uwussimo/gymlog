import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/workouts?from=ISO&to=ISO
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const where =
    from && to
      ? { performedAt: { gte: new Date(from), lt: new Date(to) } }
      : undefined;
  const workouts = await prisma.workout.findMany({
    where,
    orderBy: { performedAt: "desc" },
  });
  return NextResponse.json({ workouts });
}

// POST /api/workouts
export async function POST(req: Request) {
  const b = await req.json();
  const workout = await prisma.workout.create({
    data: {
      type: b.type?.trim() || "workout",
      durationMin: b.durationMin != null ? Number(b.durationMin) : null,
      note: b.note?.trim() || null,
      intensity: Math.min(4, Math.max(1, Number(b.intensity) || 1)),
      performedAt: b.performedAt ? new Date(b.performedAt) : new Date(),
    },
  });
  return NextResponse.json({ workout });
}

// DELETE /api/workouts?id=...
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await prisma.workout.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
