// DashboardComponents/StatCards.tsx
import React from "react";
import { Finance } from "../Dashboard_main";

interface StatCardsProps {
  finances: Finance[];
}

export const StatCards: React.FC<StatCardsProps> = ({ finances }) => {
  // Calculate the latest total revenue using the most recent finance record
  let totalRevenue = 0;
  if (finances.length > 0) {
    const latestFinance = finances.reduce((latest, current) =>
      new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest
    );
    totalRevenue = latestFinance.total;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card title="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} />
      {/* Additional stat cards can be added or computed here */}
      <Card title="Avg Order" value="$27.97" />
      <Card title="Trailing Week" value="$278,054.24" />
      <Card title="Trailing Year" value="$278,054.24" />
    </div>
  );
};

interface CardProps {
  title: string;
  value: string;
}

const Card: React.FC<CardProps> = ({ title, value }) => {
  return (
    <div className="p-4 rounded border border-stone-300">
      <h3 className="text-stone-500 mb-2 text-sm">{title}</h3>
      <p className="text-3xl font-semibold">{value}</p>
    </div>
  );
};
