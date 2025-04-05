import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import FAQModal from "./FAQModal"; // Import FAQModal component
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
  try {
    const response = await axios.get(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  } catch (err) {
    throw new Error("Failed to fetch data");
  }
};

const Dashboard_main: React.FC = () => {
  const [finances, setFinances] = useState<Finance[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [showChat, setShowChat] = useState<boolean>(false); // Track if chat should be shown

  const navigate = useNavigate();

  // Fetch finances and crops data
  const fetchFinances = async () => {
    try {
      const data = await fetchData("http://127.0.0.1:5000/finances");
      setFinances(data);
    } catch (err: any) {
      setError("Failed to fetch finances");
    }
  };

  const fetchCrops = async () => {
    try {
      const data = await fetchData("http://127.0.0.1:5000/crops");
      setCrops(data);
    } catch (err: any) {
      setError("Failed to fetch crops");
    }
  };

  useEffect(() => {
    Promise.all([fetchFinances(), fetchCrops()]).then(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const handleQuestionSubmit = (question: string) => {
    console.log("User submitted question: ", question); // This could be extended to log, store, or process the question
  };

  return (
    <div className="bg-white rounded-lg pb-4 shadow w-full">
      {/* The FAQ button */}
      <button
        onClick={() => setShowChat(!showChat)}
        className="faq-button"
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 9999,
        }}
      >
        FAQs
      </button>

      {/* The chat-container and FAQModal are shown based on showChat state */}
      {showChat && (
        <div className="chat-container">
          <FAQModal
            isOpen={showChat}
            closeModal={() => setShowChat(false)}
            onQuestionSubmit={handleQuestionSubmit} // Handle the question submission
          />
        </div>
      )}

      {/* Grid component for displaying finances and crops */}
      <Grid finances={finances} crops={crops} />
    </div>
  );
};

export default Dashboard_main;
