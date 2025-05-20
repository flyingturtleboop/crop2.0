// src/components/DashboardComponents/LineGraph.tsx
import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Finance } from "../Dashboard_main";

interface LineGraphProps {
  finances: Finance[];
}

export const LineGraph: React.FC<LineGraphProps> = ({ finances }) => {
  const sorted = [...finances].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  const data = sorted.map((fin) => ({
    name: new Date(fin.timestamp).toLocaleDateString(),
    total: fin.total,
  }));

  return (
    <div className="h-80">
      <h3 className="text-xl font-semibold mb-4">
        Total Revenue Since Start Date
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 24, right: 24, left: 0, bottom: 24 }}>
          <XAxis dataKey="name" axisLine tickLine={false} padding={{ right: 6 }} stroke="#ccc" />
          <YAxis axisLine tickLine={false} stroke="#ccc" />
          <Tooltip wrapperClassName="text-base rounded" labelClassName="text-sm text-stone-500" />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#22c55e"
            strokeWidth={4}
            dot={{ r: 5 }}
            activeDot={{ r: 7 }}
            isAnimationActive
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
