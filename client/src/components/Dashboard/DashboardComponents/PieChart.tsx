// src/components/DashboardComponents/PieChart.tsx
import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import { Crop } from "../Dashboard_main";

interface PieChartProps {
  crops: Crop[];
}

const COLORS = [
  "#F97316",
  "#0EA5E9",
  "#10B981",
  "#E11D48",
  "#7C3AED",
  "#FBBF24",
  "#3B82F6",
  "#EF4444",
];

export const PieChartComponent: React.FC<PieChartProps> = ({ crops }) => {
  const typeMap: Record<string, number> = {};
  crops.forEach((crop) => {
    typeMap[crop.crop_type] = (typeMap[crop.crop_type] || 0) + crop.amount_sown;
  });

  const pieData = Object.entries(typeMap).map(([name, value]) => ({ name, value }));

  const renderCustomizedLabel = (props: any) => {
    const { cx, cy, midAngle, outerRadius, name, percent } = props;
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 24;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#000"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={14}
      >
        {`${name} ${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  return (
    <div className="h-80">
      <h3 className="text-2xl font-semibold mb-4">Crop Distribution</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="50%"
            outerRadius="70%"
            labelLine
            label={renderCustomizedLabel}
            isAnimationActive
            animationDuration={800}
            paddingAngle={2}
          >
            {pieData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => value.toLocaleString()} />
          <Legend
            verticalAlign="bottom"
            height={30}
            iconType="circle"
            wrapperStyle={{ fontSize: "0.9rem" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
