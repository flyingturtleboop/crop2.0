// DashboardComponents/Grid.tsx
import React from "react";
import { StatCards } from "./StatCards";
import { LineGraph } from "./LineGraph";
import { PieChartComponent } from "./PieChart";
import { Finance, Crop } from "../Dashboard_main";

interface GridProps {
  finances: Finance[];
  crops: Crop[];
}

const Grid: React.FC<GridProps> = ({ finances, crops }) => {
  return (
    <div className="p-4 w-full">
      {/* Top row: Stat cards */}
      <StatCards finances={finances} />
      {/* Bottom row: Line chart and Pie chart side by side */}
      <div className="grid grid-cols-12 gap-4 mt-4">
        {/* Line chart in 8 columns */}
        <div className="col-span-12 lg:col-span-8 border border-stone-300 rounded p-4 w-full">
          <LineGraph finances={finances} />
        </div>
        {/* Pie chart in 4 columns */}
        <div className="col-span-12 lg:col-span-4 border border-stone-300 rounded p-4 w-full">
          <PieChartComponent crops={crops} />
        </div>
      </div>
    </div>
  );
};

export default Grid;
