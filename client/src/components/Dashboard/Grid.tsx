import React from "react";
import { StatCards } from "./StatCards";
import { LineGraph } from "./LineGraph";
import { BarGraph } from "./BarGraph";

const Grid = () => {
  return (
    <div className=" p-4 w-full">
      {/* Top row: 4 stat cards */}
      <StatCards />

      {/* Bottom row: line chart + bar chart side by side */}
      <div className="grid grid-cols-12 gap-4 mt-4">
        {/* line chart in 8 columns */}
        <div className="col-span-12 lg:col-span-8 border border-stone-300 rounded p-4 w-full">
          <LineGraph />
        </div>
        {/* bar chart in 4 columns */}
        <div className="col-span-12 lg:col-span-4 border border-stone-300 rounded p-4 w-full">
          <BarGraph />
        </div>
      </div>
    </div>
  );
};

export default Grid;
