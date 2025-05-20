// src/components/Dashboard_main.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { MessageCircle, Calendar as CalendarIcon } from "lucide-react";
import FAQModal from "./FAQModal";
import { StatCards } from "./DashboardComponents/StatCards";
import Grid from "./DashboardComponents/Grid";

// Define Finance and Crop interfaces
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

// Utility function for fetching data
const fetchData = async (url: string) => {
  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axios.get(url, { headers });
  return response.data;
};

const Dashboard_main: React.FC = () => {
  const [finances, setFinances] = useState<Finance[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showChat, setShowChat] = useState(false);

  // Date range state (default last 7 days)
  const [startDate, setStartDate] = useState<Date>(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  );
  const [endDate, setEndDate] = useState<Date>(new Date());

  const navigate = useNavigate();

  // Fetch finances & crops for the selected date range
  const loadFinances = async () => {
    const start = startDate.toISOString().slice(0, 10);
    const end = endDate.toISOString().slice(0, 10);
    try {
      const data = await fetchData(
        `http://127.0.0.1:5000/finances?start=${start}&end=${end}`
      );
      setFinances(data);
    } catch {
      setError("Failed to fetch finances");
    }
  };

  const loadCrops = async () => {
    const start = startDate.toISOString().slice(0, 10);
    const end = endDate.toISOString().slice(0, 10);
    try {
      const data = await fetchData(
        `http://127.0.0.1:5000/crops?start=${start}&end=${end}`
      );
      setCrops(data);
    } catch {
      setError("Failed to fetch crops");
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadFinances(), loadCrops()]).finally(() =>
      setLoading(false)
    );
  }, [startDate, endDate]);

  if (loading) return <p className="p-6 text-center">Loading…</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  const handleQuestionSubmit = (question: string) => {
    console.log("FAQ question:", question);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with date-range picker */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto flex items-center justify-between py-4 px-6">
          <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
          <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm px-4 py-2">
            <CalendarIcon size={20} className="text-gray-500 mr-2" />
            <DatePicker
              selected={startDate}
              onChange={(date) => date && setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              maxDate={new Date()}
              className="border-none focus:ring-0 px-2 py-1 text-sm"
            />
            <span className="mx-2 text-gray-500">to</span>
            <DatePicker
              selected={endDate}
              onChange={(date) => date && setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              maxDate={new Date()}
              className="border-none focus:ring-0 px-2 py-1 text-sm"
            />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCards finances={finances} />
        </div>

        {/* Charts */}
        <Grid
          finances={finances}
          crops={crops}
          startDate={startDate}
          endDate={endDate}
        />
      </main>


      {showChat && (
        <FAQModal
          isOpen={true}
          closeModal={() => setShowChat(false)}
          onQuestionSubmit={handleQuestionSubmit}
        />
      )}
    </div>
  );
};

export default Dashboard_main;
