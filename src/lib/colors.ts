/**
 * Block colors for the sprint grid, echoing the pastel palette from the
 * Google Sheet. Each entry carries light/dark cell styling and a swatch.
 */
export type ColorKey =
  | "blue"
  | "green"
  | "yellow"
  | "purple"
  | "pink"
  | "red"
  | "orange"
  | "gray";

export const COLORS: Record<
  ColorKey,
  { label: string; cell: string; swatch: string; text: string }
> = {
  blue: {
    label: "Blue",
    cell: "bg-blue-100 dark:bg-blue-950/50 border-blue-200 dark:border-blue-900",
    swatch: "bg-blue-400",
    text: "text-blue-950 dark:text-blue-100",
  },
  green: {
    label: "Green",
    cell: "bg-green-100 dark:bg-green-950/50 border-green-200 dark:border-green-900",
    swatch: "bg-green-400",
    text: "text-green-950 dark:text-green-100",
  },
  yellow: {
    label: "Yellow",
    cell: "bg-amber-100 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900",
    swatch: "bg-amber-400",
    text: "text-amber-950 dark:text-amber-100",
  },
  purple: {
    label: "Purple",
    cell: "bg-violet-100 dark:bg-violet-950/50 border-violet-200 dark:border-violet-900",
    swatch: "bg-violet-400",
    text: "text-violet-950 dark:text-violet-100",
  },
  pink: {
    label: "Pink",
    cell: "bg-pink-100 dark:bg-pink-950/50 border-pink-200 dark:border-pink-900",
    swatch: "bg-pink-400",
    text: "text-pink-950 dark:text-pink-100",
  },
  red: {
    label: "Red",
    cell: "bg-red-100 dark:bg-red-950/50 border-red-200 dark:border-red-900",
    swatch: "bg-red-400",
    text: "text-red-950 dark:text-red-100",
  },
  orange: {
    label: "Orange",
    cell: "bg-orange-100 dark:bg-orange-950/50 border-orange-200 dark:border-orange-900",
    swatch: "bg-orange-400",
    text: "text-orange-950 dark:text-orange-100",
  },
  gray: {
    label: "Gray",
    cell: "bg-muted border-border",
    swatch: "bg-gray-400",
    text: "text-foreground",
  },
};

export const COLOR_KEYS = Object.keys(COLORS) as ColorKey[];

export function colorOf(key?: string | null) {
  if (key && key in COLORS) return COLORS[key as ColorKey];
  return COLORS.gray;
}
