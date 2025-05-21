import React, { useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Sector,
  Tooltip,
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

const renderActiveShape = (props: any) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
  } = props;
  return (
    <>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 12}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="#fff"
        strokeWidth={2}
        style={{ filter: "drop-shadow(0 0 8px rgba(0,0,0,0.2))" }}
      />
      <text
        x={cx}
        y={cy - 14}
        textAnchor="middle"
        fill="#333"
        fontSize={18}
        fontWeight="700"
      >
        {payload.name}
      </text>
      <text
        x={cx}
        y={cy + 14}
        textAnchor="middle"
        fill="#666"
        fontSize={16}
        fontWeight="500"
      >
        {(percent * 100).toFixed(1)}%
      </text>
    </>
  );
};

export const PieChartComponent: React.FC<PieChartProps> = ({ crops }) => {
  const typeMap: Record<string, number> = {};
  crops.forEach((c) => {
    typeMap[c.crop_type] = (typeMap[c.crop_type] || 0) + c.amount_sown;
  });
  const pieData = Object.entries(typeMap).map(([name, value]) => ({ name, value }));

  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const onPieEnter = (_: any, index: number) => setActiveIndex(index);
  const onCellClick = (_: any, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex(index);
  };
  const onChartClick = () => setActiveIndex(-1);

  return (
    <div
      className="bg-white rounded-2xl shadow px-6 pt-6 pb-6 cursor-pointer"
      onClick={onChartClick}
    >
      <h3 className="text-2xl font-semibold mb-4 text-gray-800">
        Crop Distribution
      </h3>

      {/* Chart*/}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius="55%"
              outerRadius="75%"
              dataKey="value"
              nameKey="name"
              activeIndex={activeIndex >= 0 ? activeIndex : undefined}
              activeShape={renderActiveShape}
              onMouseEnter={onPieEnter}
              paddingAngle={6}
              isAnimationActive
              animationDuration={600}
            >
              {pieData.map((_, idx) => (
                <Cell
                  key={idx}
                  fill={COLORS[idx % COLORS.length]}
                  stroke="#fff"
                  strokeWidth={1}
                  onClick={(e) => onCellClick(_, idx, e)}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255,255,255,0.95)",
                borderRadius: 8,
                boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
                fontSize: "0.9rem",
              }}
              formatter={(value: number) => value.toLocaleString()}
              labelFormatter={(name: string) => `Crop: ${name}`}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Manual legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-6">
        {pieData.map((entry, idx) => (
          <div key={entry.name} className="flex items-center gap-2">
            <span
              className="w-4 h-4 rounded"
              style={{ backgroundColor: COLORS[idx % COLORS.length] }}
            />
            <span className="text-gray-700 font-medium">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
