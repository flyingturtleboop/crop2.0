import React from "react";
import { Layers, Wind, ThermometerSun, DollarSign } from "lucide-react";
import { Finance, WeatherData } from "../Dashboard_main";

export interface StatCardsProps {
  finances: Finance[];
  cropCount: number;
  weather: WeatherData;
}

const StatCards: React.FC<StatCardsProps> = ({
  finances,
  cropCount,
  weather,
}) => {
  // get latest total
  const latestTotal =
    finances.length > 0
      ? finances.reduce((a, b) =>
          new Date(b.timestamp) > new Date(a.timestamp) ? b : a
        ).total
      : 0;

  return (
    <>
      {/* 1) Crops planted */}
      <Card
        title="Crops Planted"
        value={String(cropCount)}
        icon={<Layers size={28} className="text-green-600" />}
      />

      {/* 2) Wind speed */}
      <Card
        title="Wind Speed"
        value={`${weather.windspeed.toFixed(0)} km/h`}
        icon={<Wind size={28} className="text-blue-600" />}
      />

      {/* 3) Temperature */}
      <Card
        title="Temperature"
        value={`${weather.temperature.toFixed(1)}°C`}
        icon={<ThermometerSun size={28} className="text-orange-600" />}
      />

      {/* 4) Total revenue */}
      <Card
        title="Total Revenue"
        value={`$${latestTotal.toLocaleString()}`}
        icon={<DollarSign size={28} className="text-purple-600" />}
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
  <div className="flex items-center bg-white rounded-2xl p-6 shadow hover:shadow-md transition min-h-[100px]">
    <div className="bg-gray-100 p-3 rounded-full">{icon}</div>
    <div className="ml-4">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  </div>
);

export default StatCards;
