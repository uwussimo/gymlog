import { NextResponse } from "next/server";
import { estimateNutrition } from "@/lib/openai";

// POST /api/food/estimate { description?, imageDataUrl? } -> nutrition guess (not saved)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.description?.trim() && !body.imageDataUrl) {
      return NextResponse.json(
        { error: "Provide a description or a photo." },
        { status: 400 },
      );
    }
    const estimate = await estimateNutrition({
      description: body.description,
      imageDataUrl: body.imageDataUrl,
    });
    return NextResponse.json({ estimate });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Estimation failed";
    const noKey = message.includes("OPENAI_API_KEY");
    return NextResponse.json(
      {
        error: noKey
          ? "OpenAI key not configured — add OPENAI_API_KEY to .env, or enter the calories manually."
          : message,
      },
      { status: noKey ? 422 : 500 },
    );
  }
}
