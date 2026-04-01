"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface ChartProps {
  data: { week: string; points: number }[];
}

// If real data is empty/flat, show a mock upward trend
const MOCK_DATA = [
  { week: "Week 1", points: 2 },
  { week: "Week 2", points: 5 },
  { week: "Week 3", points: 8 },
  { week: "Week 4", points: 12 },
  { week: "Week 5", points: 14 },
  { week: "Week 6", points: 19 },
  { week: "Week 7", points: 22 },
  { week: "Week 8", points: 28 },
];

export function ConfidenceChart({ data }: ChartProps) {
  const hasRealData = data.length > 0 && data.some((d) => d.points > 0);
  const chartData = hasRealData ? data : MOCK_DATA;

  return (
    <div className="h-36">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4682B4" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#4682B4" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="week"
            tick={{ fontSize: 10, fill: "#1B2A4A", opacity: 0.3 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              background: "#fff",
              border: "1px solid rgba(27,42,74,0.1)",
              borderRadius: 12,
              fontSize: 12,
              padding: "6px 10px",
            }}
            labelStyle={{ color: "#1B2A4A", fontWeight: 600 }}
            formatter={(value) => [`${value} pts`, "Activity"]}
          />
          <Area
            type="monotone"
            dataKey="points"
            stroke="#4682B4"
            strokeWidth={2}
            fill="url(#progressGradient)"
            dot={false}
            activeDot={{ r: 4, fill: "#4682B4", stroke: "#fff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
      {!hasRealData && (
        <p className="text-[10px] text-navy/25 text-center -mt-1">
          Sample data — your real progress will show here
        </p>
      )}
    </div>
  );
}
