// src/components/DashboardComponents/Grid.tsx
import React from "react";
import { StatCards } from "./StatCards";
import { LineGraph } from "./LineGraph";
import { PieChartComponent } from "./PieChart";
import { Finance, Crop } from "../Dashboard_main";

interface GridProps {
  finances: Finance[];
  crops: Crop[];
}

const Grid: React.FC<GridProps> = ({ finances, crops }) => (
  <>
    {/* Stat Cards Row */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
      <StatCards finances={finances} />
    </div>

    {/* Charts Row */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-white rounded-2xl shadow p-8">
        <LineGraph finances={finances} />
      </div>
      <div className="bg-white rounded-2xl shadow p-8">
        <PieChartComponent crops={crops} />
      </div>
    </div>
  </>
);

export default Grid;
