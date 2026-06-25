import OpenAI from "openai";

// Model is configurable so it can be swapped without touching code.
// Default to a current vision-capable OpenAI model. (There is no "GPT-5.5";
// set OPENAI_MODEL in .env to whatever you have access to.)
export const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o";

let client: OpenAI | null = null;
export function getOpenAI(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  client ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

export type NutritionEstimate = {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  note: string;
};

const SYSTEM_PROMPT = `You are a nutrition estimator. Given a text description and/or a photo of food, estimate the nutrition for the WHOLE portion shown/described.
Respond ONLY with a compact JSON object of this exact shape:
{"name": string, "calories": number, "protein": number, "carbs": number, "fat": number, "note": string}
- name: a short label for the meal (e.g. "Chicken rice bowl").
- calories: integer kcal for the whole portion.
- protein/carbs/fat: grams, numbers (may be decimals).
- note: one short sentence on assumptions or confidence.
Estimate reasonably even with limited info. Never refuse.`;

export async function estimateNutrition(input: {
  description?: string;
  imageDataUrl?: string;
}): Promise<NutritionEstimate> {
  const openai = getOpenAI();

  const userContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [];
  const text = input.description?.trim();
  userContent.push({
    type: "text",
    text: text
      ? `Food description: ${text}`
      : "Estimate the nutrition of the food in the image.",
  });
  if (input.imageDataUrl) {
    userContent.push({
      type: "image_url",
      image_url: { url: input.imageDataUrl },
    });
  }

  const completion = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userContent },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw) as Partial<NutritionEstimate>;

  return {
    name: parsed.name?.toString() || text || "Meal",
    calories: Math.max(0, Math.round(Number(parsed.calories) || 0)),
    protein: Math.max(0, Number(parsed.protein) || 0),
    carbs: Math.max(0, Number(parsed.carbs) || 0),
    fat: Math.max(0, Number(parsed.fat) || 0),
    note: parsed.note?.toString() || "",
  };
}
