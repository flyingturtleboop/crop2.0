// Dashboard_main.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Grid from "./DashboardComponents/Grid";

export interface Finance {
  id: string;
  amount: number;
  currency: string;
  status: string;
  notes: string;
  total: number;
  timestamp: string;
}

export interface Crop {
  id: string;
  crop_type: string;
  variety: string;
  growth_stage: string;
  amount_sown: number;
  extra_notes: string;
  location: string;
}

const Dashboard_main: React.FC = () => {
  const [finances, setFinances] = useState<Finance[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const fetchFinances = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://127.0.0.1:5000/finances", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setFinances(response.data);
    } catch (err) {
      console.error("Error fetching finances:", err);
      setError("Failed to fetch finances");
    }
  };

  const fetchCrops = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://127.0.0.1:5000/crops", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setCrops(response.data);
    } catch (err) {
      console.error("Error fetching crops:", err);
      setError("Failed to fetch crops");
    }
  };

  useEffect(() => {
    Promise.all([fetchFinances(), fetchCrops()]).then(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  // Filter finances to only include records from the past week
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const financesPastWeek = finances.filter(
    (fin) => new Date(fin.timestamp) >= oneWeekAgo
  );

  return (
    <div className="bg-white rounded-lg pb-4 shadow w-full">
      <Grid finances={financesPastWeek} crops={crops} />
    </div>
  );
};

export default Dashboard_main;
