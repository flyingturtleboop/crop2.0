// DashboardComponents/LineGraph.tsx
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
  // Sort the finance data by timestamp (ascending) and format it for the chart
  const sortedData = [...finances].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  const data = sortedData.map((fin) => ({
    name: new Date(fin.timestamp).toLocaleDateString(),
    total: fin.total,
  }));

  return (
    <div className="h-64">
      <div className="flex items-center gap-1.5 mb-2">
        <h3 className="font-medium">Total Revenue Over Past Week</h3>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
        >
          {/* Only show the x-axis and y-axis lines */}
          <XAxis
            dataKey="name"
            axisLine={true}
            tickLine={false}
            padding={{ right: 4 }}
            stroke="#ccc"
          />
          <YAxis axisLine={true} tickLine={false} stroke="#ccc" />
          <Tooltip
            wrapperClassName="text-sm rounded"
            labelClassName="text-xs text-stone-500"
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#22c55e"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            isAnimationActive={true}
            animationDuration={1500}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
