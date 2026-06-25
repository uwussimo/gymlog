"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, Camera, Loader2, X } from "lucide-react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useEstimate, useSaveFood } from "@/hooks/use-food";
import { fileToDataUrl } from "@/lib/image";

const empty = { calories: "", protein: "", carbs: "", fat: "" };

export function FoodAdd() {
  const [tab, setTab] = useState<"text" | "photo">("text");
  const [description, setDescription] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [fields, setFields] = useState(empty);
  const [aiNote, setAiNote] = useState("");
  const [ready, setReady] = useState(false);

  const estimate = useEstimate();
  const save = useSaveFood();

  async function onPickImage(file: File | undefined) {
    if (!file) return;
    try {
      const url = await fileToDataUrl(file);
      setImageDataUrl(url);
    } catch {
      toast.error("Couldn't read that image");
    }
  }

  async function runEstimate() {
    if (tab === "text" && !description.trim())
      return toast.error("Describe what you ate first");
    if (tab === "photo" && !imageDataUrl)
      return toast.error("Add a photo first");
    try {
      const est = await estimate.mutateAsync({
        description: description || undefined,
        imageDataUrl: tab === "photo" ? imageDataUrl ?? undefined : undefined,
      });
      setFields({
        calories: String(est.calories),
        protein: String(Math.round(est.protein)),
        carbs: String(Math.round(est.carbs)),
        fat: String(Math.round(est.fat)),
      });
      setAiNote(est.note);
      if (!description.trim()) setDescription(est.name);
      setReady(true);
      toast.success(`Estimated ~${est.calories} kcal`);
    } catch (e) {
      setReady(true); // allow manual entry
      toast.error(e instanceof Error ? e.message : "Estimation failed");
    }
  }

  function reset() {
    setDescription("");
    setImageDataUrl(null);
    setFields(empty);
    setAiNote("");
    setReady(false);
  }

  async function onSave() {
    if (!description.trim()) return toast.error("Add a name for the meal");
    if (!fields.calories) return toast.error("Add a calorie amount");
    await save.mutateAsync({
      description: description.trim(),
      source: tab,
      imageUrl: tab === "photo" ? imageDataUrl : null,
      calories: Number(fields.calories),
      protein: fields.protein ? Number(fields.protein) : null,
      carbs: fields.carbs ? Number(fields.carbs) : null,
      fat: fields.fat ? Number(fields.fat) : null,
      aiNote: aiNote || null,
    });
    toast.success("Logged");
    reset();
  }

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <Tabs value={tab} onValueChange={(v) => setTab(v as "text" | "photo")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text">Describe</TabsTrigger>
            <TabsTrigger value="photo">
              <Camera className="size-4" /> Photo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="pt-3">
            <Textarea
              value={description}
              placeholder="e.g. Two scrambled eggs, toast and an orange juice"
              rows={2}
              onChange={(e) => setDescription(e.target.value)}
            />
          </TabsContent>

          <TabsContent value="photo" className="space-y-3 pt-3">
            {imageDataUrl ? (
              <div className="relative w-full overflow-hidden rounded-lg border">
                <Image
                  src={imageDataUrl}
                  alt="food"
                  width={600}
                  height={400}
                  className="max-h-56 w-full object-cover"
                  unoptimized
                />
                <button
                  onClick={() => setImageDataUrl(null)}
                  className="absolute right-2 top-2 rounded-full bg-background/80 p-1"
                  aria-label="Remove photo"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <label className="flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-sm text-muted-foreground hover:bg-muted/50">
                <Camera className="size-6" />
                Tap to take or choose a photo
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => onPickImage(e.target.files?.[0])}
                />
              </label>
            )}
            <Input
              value={description}
              placeholder="Optional: add detail (e.g. large portion)"
              onChange={(e) => setDescription(e.target.value)}
            />
          </TabsContent>
        </Tabs>

        <Button
          onClick={runEstimate}
          disabled={estimate.isPending}
          className="w-full"
          variant="secondary"
        >
          {estimate.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          Estimate calories with AI
        </Button>

        {ready && (
          <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
            <div className="space-y-1.5">
              <Label htmlFor="meal-name">Meal</Label>
              <Input
                id="meal-name"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(["calories", "protein", "carbs", "fat"] as const).map((k) => (
                <div key={k} className="space-y-1">
                  <Label className="text-xs capitalize text-muted-foreground">
                    {k === "calories" ? "kcal" : `${k} g`}
                  </Label>
                  <Input
                    inputMode="numeric"
                    value={fields[k]}
                    onChange={(e) =>
                      setFields((f) => ({ ...f, [k]: e.target.value }))
                    }
                  />
                </div>
              ))}
            </div>
            {aiNote && (
              <p className="text-xs italic text-muted-foreground">{aiNote}</p>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={reset} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={onSave}
                disabled={save.isPending}
                className="flex-1"
              >
                {save.isPending ? "Saving…" : "Log it"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
