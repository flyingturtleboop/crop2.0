// src/components/DashboardComponents/LineGraph.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface FinanceRecord {
  id: string;
  amount: number;
  currency: string;
  status: string;
  notes: string;
  total: number;
  timestamp: string;
  receipt_image?: string;
}

export const LineGraph: React.FC = () => {
  const [data, setData] = useState<{ name: string; total: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinances = async () => {
      try {
        const token = localStorage.getItem("token");
        const resp = await axios.get<FinanceRecord[]>(
          "http://127.0.0.1:5000/finances",
          token ? { headers: { Authorization: `Bearer ${token}` } } : {}
        );

        // sort ascending by timestamp, force UTC parsing
        const sorted = resp.data
          .map((f) => ({ ...f, ts: new Date(f.timestamp + "Z").getTime() }))
          .sort((a, b) => a.ts - b.ts);

        // map into recharts format
        const chartData = sorted.map((f) => ({
          name: new Date(f.ts).toLocaleDateString(),
          total: f.total,
        }));

        setData(chartData);
      } catch (err) {
        console.error("Failed to load finances for chart", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFinances();
  }, []);

  if (loading) {
    return <p className="p-4 text-gray-500">Loading chart data...</p>;
  }

  if (data.length === 0) {
    return <p className="p-4 text-gray-500">No finance data available.</p>;
  }

  return (
    <div className="h-80 bg-white rounded shadow-sm p-4">
      <h3 className="text-xl font-semibold mb-4">
        Total Revenue Since Start Date
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 24, right: 24, left: 0, bottom: 24 }}
        >
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            padding={{ right: 12 }}
            stroke="#cbd5e1"
          />
          <YAxis axisLine={false} tickLine={false} stroke="#cbd5e1" />
          <Tooltip
            wrapperClassName="bg-white rounded shadow-md text-sm"
            labelClassName="font-medium text-gray-600"
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#22c55e"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            isAnimationActive
            animationDuration={1000}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
