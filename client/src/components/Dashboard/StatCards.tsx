import React from "react";

export const StatCards = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card title="Gross Revenue" value="$120,054.24" />
      <Card title="Avg Order" value="$27.97" />
      <Card title="Trailing Year" value="$278,054.24" />
      <Card title="Trailing Year" value="$278,054.24" />
    </div>
  );
};

const Card = ({ title, value }: { title: string; value: string }) => {
  return (
    <div className="p-4 rounded border border-stone-300">
      <h3 className="text-stone-500 mb-2 text-sm">{title}</h3>
      <p className="text-3xl font-semibold">{value}</p>
    </div>
  );
};
