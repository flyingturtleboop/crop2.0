import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

interface Crop {
  id: string;
  crop_type: string;
  variety: string;
  growth_stage: string;
  amount_sown: number;
  extra_notes: string;
  location: string;
}

const CropTable: React.FC = () => {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch crop data from the backend using the '/getcrops' endpoint
  const fetchCrops = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://127.0.0.1:5000/crops", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setCrops(response.data);
      setLoading(false);
    } catch (err: any) {
      console.error("Error fetching crops:", err);
      if (err.response) {
        console.error("Response data:", err.response.data);
        console.error("Response status:", err.response.status);
      }
      setError("Failed to fetch crops");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrops();
  }, []);

  // Delete crop handler
  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://127.0.0.1:5000/crops/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setCrops((prev) => prev.filter((crop) => crop.id !== id));
    } catch (err) {
      console.error("Error deleting crop:", err);
      alert("Failed to delete crop");
    }
  };

  // Placeholder for edit functionality
  const handleEdit = (id: string) => {
    alert(`Edit functionality for crop id ${id} coming soon!`);
  };

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Crop Tracker</h2>
        {/* "Add Crop" button navigates to the add crop page */}
        <Link to="/addcrop">
          <button className="bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-4 rounded">
            Add Crop
          </button>
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Crop Type</th>
              <th className="px-4 py-2 border">Variety</th>
              <th className="px-4 py-2 border">Growth Stage</th>
              <th className="px-4 py-2 border">Amount Sown</th>
              <th className="px-4 py-2 border">Extra Notes</th>
              <th className="px-4 py-2 border">Location</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {crops.map((crop) => (
              <tr key={crop.id} className="border-t text-center">
                <td className="px-4 py-2 border">{crop.crop_type}</td>
                <td className="px-4 py-2 border">{crop.variety}</td>
                <td className="px-4 py-2 border">{crop.growth_stage}</td>
                <td className="px-4 py-2 border">{crop.amount_sown}</td>
                <td className="px-4 py-2 border">{crop.extra_notes}</td>
                <td className="px-4 py-2 border">{crop.location}</td>
                <td className="px-4 py-2 border">
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-black font-bold py-1 px-2 rounded mr-2"
                    onClick={() => handleEdit(crop.id)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-600 text-black font-bold py-1 px-2 rounded"
                    onClick={() => handleDelete(crop.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {crops.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-4">
                  No crops found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CropTable;
