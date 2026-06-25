# gymlog — your life companion

A personal PWA to take control of your time, food, training and health. Built around the **15-minute sprint** logging workflow (the spreadsheet, but smarter).

## Features

- **⏱ 15-minute sprints** — a daily grid from 6:00. Click a slot or **drag across several** to log what you did. Adjacent slots with the same text **merge into one block** showing the total time (just like the Google Sheet), color-coded, with a live per-activity breakdown and a "Continue previous" shortcut.
- **🍽 Food + AI calories** — describe a meal or **snap a photo**; OpenAI estimates calories + macros, which you can edit before saving. Daily totals and history.
- **💪 Workouts** — quick-log sessions and see a **GitHub-style yearly heatmap**, current streak and active days.
- **📊 Health** — Screen-Time-style daily bar charts (with average line) for **calorie intake, steps and sleep**. Manual entry plus **Apple Health export import** (steps & sleep from `export.xml`).
- **📱 Installable PWA** — add to your home screen.

## Stack

Next.js 16 (App Router) · Prisma 7 (SQLite) · shadcn/ui + Tailwind v4 · TanStack React Query · OpenAI · Recharts.

## Setup

```bash
npm install
npx prisma migrate dev   # creates ./dev.db
npm run dev              # http://localhost:3000
```

Add your OpenAI key to `.env` to enable photo/text calorie estimation:

```
OPENAI_API_KEY="sk-..."
OPENAI_MODEL="gpt-4o"     # any vision-capable model you have access to
```

Without a key the app still works — you just enter calories manually.

## Notes

- **Apple Health**: a browser/PWA cannot read HealthKit directly. Steps & sleep come from manual entry or by importing your Apple Health export (`Health app → profile → Export All Health Data`, unzip, upload `export.xml` on the Health tab). The data model is ready for a future native wrapper to auto-fill these.
- **Database**: SQLite for zero-setup. To move to Postgres, change `datasource.provider` in `prisma/schema.prisma`, swap the adapter in `src/lib/prisma.ts` (`@prisma/adapter-pg`), set `DATABASE_URL`, and re-run `prisma migrate dev`.

## Project layout

```
src/
  app/            routes + API handlers (sprints, food, workouts, health)
  components/     sprint grid/editor, dashboards, heatmap, charts, nav
  hooks/          React Query hooks per feature
  lib/            prisma, openai, time/colors/image helpers
prisma/           schema + migrations
```
