// src/components/Dashboard/DashboardComponents/Grid.tsx
import React from "react";
import StatCards from "./StatCards";
import { LineGraph } from "./LineGraph";
import { PieChartComponent } from "./PieChart";
import { Finance, Crop, WeatherData } from "../Dashboard_main";

interface GridProps {
  finances: Finance[];
  crops: Crop[];
  startDate: Date;
  endDate: Date;
  cropCount: number;
  weather: WeatherData;
}

const Grid: React.FC<GridProps> = ({
  finances,
  crops,
  startDate,
  endDate,
  cropCount,
  weather,
}) => {
  // Only filter for the charts
  const filteredFinances = finances.filter((f) => {
    const d = new Date(f.timestamp);
    return d >= startDate && d <= endDate;
  });

  return (
    <div className="p-4 w-full">
      {/* Stat cards row (uses full finances list for correct total) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCards
          finances={finances}
          cropCount={cropCount}
          weather={weather}
        />
      </div>

      {/* Charts row (still uses filteredFinances) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow p-6">
          <LineGraph finances={filteredFinances} />
        </div>
        <div className="bg-white rounded-2xl shadow p-6">
          <PieChartComponent crops={crops} />
        </div>
      </div>
    </div>
  );
};

export default Grid;
