import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const data = [
  { name: "Jan", Returning: 275, New: 41 },
  { name: "Feb", Returning: 620, New: 96 },
  { name: "Mar", Returning: 202, New: 192 },
  { name: "Apr", Returning: 500, New: 50 },
  { name: "May", Returning: 355, New: 400 },
  { name: "Jun", Returning: 875, New: 200 },
  { name: "Jul", Returning: 700, New: 205 },
];

export const BarGraph = () => {
  return (
    <div className="h-64">
      <h3 className="font-medium mb-2">Usage</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 0, right: 0, left: -24, bottom: 0 }}
        >
          <CartesianGrid stroke="#e4e4e7" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            className="text-xs font-bold"
          />
          <YAxis
            className="text-xs font-bold"
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            wrapperClassName="text-sm rounded"
            labelClassName="text-xs text-stone-500"
          />
          <Bar dataKey="New" fill="#18181b" />
          <Bar dataKey="Returning" fill="#5b21b6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
