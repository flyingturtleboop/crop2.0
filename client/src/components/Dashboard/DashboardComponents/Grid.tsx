import React from "react";
import { StatCards } from "./StatCards";
import { LineGraph } from "./LineGraph";
import { PieChartComponent } from "./PieChart";
import { Finance, Crop } from "../Dashboard_main";

interface GridProps {
  finances: Finance[];
  crops: Crop[];
  startDate: Date;
  endDate: Date;
}

const Grid: React.FC<GridProps> = ({
  finances,
  crops,
  startDate,
  endDate,
}) => {
  const filteredFinances = finances.filter((f) => {
    const d = new Date(f.timestamp);
    return d >= startDate && d <= endDate;
  });

  const filteredCrops = crops;

  return (
    <div className="p-4 w-full">
      {/* Top row: Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCards finances={filteredFinances} />
      </div>

      {/* Bottom row: Line chart and Pie chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow p-6">
          <LineGraph finances={filteredFinances} />
        </div>
        <div className="bg-white rounded-2xl shadow p-6">
          <PieChartComponent crops={filteredCrops} />
        </div>
      </div>
    </div>
  );
};

export default Grid;
