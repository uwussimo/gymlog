import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/food?from=ISO&to=ISO  (defaults to last 30 days)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const where =
    from && to
      ? { eatenAt: { gte: new Date(from), lt: new Date(to) } }
      : undefined;

  const foods = await prisma.food.findMany({
    where,
    orderBy: { eatenAt: "desc" },
  });
  return NextResponse.json({ foods });
}

// POST /api/food — save a final food entry (after estimation / manual edit)
export async function POST(req: Request) {
  const b = await req.json();
  if (!b.description?.trim()) {
    return NextResponse.json({ error: "description required" }, { status: 400 });
  }
  const food = await prisma.food.create({
    data: {
      description: b.description.trim(),
      source: b.source === "photo" ? "photo" : "text",
      imageUrl: b.imageUrl ?? null,
      calories: Math.max(0, Math.round(Number(b.calories) || 0)),
      protein: b.protein != null ? Number(b.protein) : null,
      carbs: b.carbs != null ? Number(b.carbs) : null,
      fat: b.fat != null ? Number(b.fat) : null,
      aiNote: b.aiNote ?? null,
      eatenAt: b.eatenAt ? new Date(b.eatenAt) : new Date(),
    },
  });
  return NextResponse.json({ food });
}

// DELETE /api/food?id=...
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await prisma.food.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
