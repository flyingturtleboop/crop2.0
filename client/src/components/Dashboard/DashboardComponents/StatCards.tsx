import React from "react";
import { DollarSign, TrendingUp, Calendar, Clock } from "lucide-react";
import { Finance } from "../Dashboard_main";

interface StatCardsProps {
  finances: Finance[];
}

export const StatCards: React.FC<StatCardsProps> = ({ finances }) => {
  if (finances.length === 0) return null;

  const latest = finances.reduce((a, b) =>
    new Date(b.timestamp) > new Date(a.timestamp) ? b : a
  );

  return (
    <>
      <Card
        title="Total Revenue"
        value={`$${latest.total.toLocaleString()}`}
        icon={<DollarSign size={28} className="text-green-600" />}
      />
      <Card
        title="Avg Order"
        value="$27.97"
        icon={<TrendingUp size={28} className="text-blue-600" />}
      />
      <Card
        title="Trailing Week"
        value="$278,054.24"
        icon={<Calendar size={28} className="text-purple-600" />}
      />
      <Card
        title="Trailing Year"
        value="$1,025,432.10"
        icon={<Clock size={28} className="text-red-600" />}
      />
    </>
  );
};

interface CardProps {
  title: string;
  value: string;
  icon: React.ReactElement;
}

const Card: React.FC<CardProps> = ({ title, value, icon }) => (
  <div className="flex items-center bg-white rounded-2xl p-8 shadow hover:shadow-md transition-shadow min-h-[120px]">
    <div className="bg-green-100 p-4 rounded-full">
      {icon}
    </div>
    <div className="ml-6">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
    </div>
  </div>
);
