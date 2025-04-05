// DashboardComponents/PieChart.tsx
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
  "#F97316", // orange-500
  "#0EA5E9", // sky-500
  "#10B981", // emerald-500
  "#E11D48", // rose-600
  "#7C3AED", // violet-600
  "#FBBF24", // amber-400
  "#3B82F6", // blue-500
  "#EF4444", // red-500
];

export const PieChartComponent: React.FC<PieChartProps> = ({ crops }) => {
  // Sum up amount_sown by crop_type
  const typeMap: Record<string, number> = {};
  crops.forEach((crop) => {
    const { crop_type, amount_sown } = crop;
    typeMap[crop_type] = (typeMap[crop_type] || 0) + amount_sown;
  });

  // Convert the object into an array for Recharts
  const pieData = Object.entries(typeMap).map(([type, total]) => ({
    name: type,
    value: total,
  }));

  // Custom label for each slice
  const renderCustomizedLabel = (props: any) => {
    const { cx, cy, midAngle, outerRadius, name, value } = props;
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 20;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#000"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
      >
        {`${name} ${value}`}
      </text>
    );
  };

  return (
    <div className="h-64">
      <h3 className="font-medium mb-2">Crop Distribution</h3>
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
            labelLine={true}
            label={renderCustomizedLabel}
            isAnimationActive={true}
            animationDuration={800}
            animationEasing="ease-out"
            paddingAngle={2}
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend
            verticalAlign="bottom"
            height={30}
            iconType="circle"
            wrapperStyle={{ fontSize: "0.85rem" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
