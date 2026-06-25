"use client";

import {
  Bar,
  BarChart,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";

export type BarPoint = { label: string; value: number; today?: boolean };

/**
 * Screen-Time-style daily bar chart with a dashed "average" reference line.
 * Used for calorie intake, steps and sleep.
 */
export function BarStats({
  title,
  icon,
  data,
  unit,
  accent = "#22c55e",
  formatValue = (v) => String(Math.round(v)),
}: {
  title: string;
  icon?: React.ReactNode;
  data: BarPoint[];
  unit: string;
  accent?: string;
  formatValue?: (v: number) => string;
}) {
  const withValues = data.filter((d) => d.value > 0);
  const avg =
    withValues.length > 0
      ? withValues.reduce((s, d) => s + d.value, 0) / withValues.length
      : 0;

  return (
    <Card>
      <CardContent className="space-y-3 py-4">
        <div className="flex items-baseline justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            {icon}
            {title}
          </div>
          <div className="text-right">
            <span className="text-xs text-muted-foreground">daily avg </span>
            <span className="font-semibold tabular-nums">
              {avg > 0 ? formatValue(avg) : "—"}
            </span>
            <span className="ml-1 text-xs text-muted-foreground">{unit}</span>
          </div>
        </div>

        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                tick={{ fontSize: 10, fill: "currentColor" }}
                className="text-muted-foreground"
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "var(--popover)",
                  color: "var(--popover-foreground)",
                }}
                formatter={(v) => [`${formatValue(Number(v))} ${unit}`, title]}
              />
              {avg > 0 && (
                <ReferenceLine
                  y={avg}
                  stroke="currentColor"
                  strokeDasharray="4 4"
                  className="text-muted-foreground/50"
                />
              )}
              <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                {data.map((d, i) => (
                  <Cell
                    key={i}
                    fill={accent}
                    fillOpacity={d.today ? 1 : 0.45}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
