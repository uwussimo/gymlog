-- CreateTable
CREATE TABLE "Sprint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "startAt" DATETIME NOT NULL,
    "activity" TEXT,
    "note" TEXT,
    "color" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Food" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eatenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'text',
    "imageUrl" TEXT,
    "calories" INTEGER NOT NULL,
    "protein" REAL,
    "carbs" REAL,
    "fat" REAL,
    "aiNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Workout" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "performedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL DEFAULT 'workout',
    "durationMin" INTEGER,
    "note" TEXT,
    "intensity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "HealthMetric" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "day" DATETIME NOT NULL,
    "steps" INTEGER,
    "sleepMin" INTEGER,
    "restingHr" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Sprint_startAt_key" ON "Sprint"("startAt");

-- CreateIndex
CREATE INDEX "Sprint_startAt_idx" ON "Sprint"("startAt");

-- CreateIndex
CREATE INDEX "Food_eatenAt_idx" ON "Food"("eatenAt");

-- CreateIndex
CREATE INDEX "Workout_performedAt_idx" ON "Workout"("performedAt");

-- CreateIndex
CREATE UNIQUE INDEX "HealthMetric_day_key" ON "HealthMetric"("day");

-- CreateIndex
CREATE INDEX "HealthMetric_day_idx" ON "HealthMetric"("day");
