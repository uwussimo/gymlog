import { NextResponse } from "next/server";

// Served at /manifest.webmanifest
export function GET() {
  return NextResponse.json({
    name: "gymlog — life companion",
    short_name: "gymlog",
    description:
      "15-minute sprint logging, food calories, workouts and health.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  });
}
