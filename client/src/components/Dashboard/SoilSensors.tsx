import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // To extract cropId from the URL
import axios from 'axios';
import { FaWater, FaTemperatureHigh, FaLeaf } from 'react-icons/fa'; // Add icons for pH, Moisture, Temperature

export default function SoilSensors() {
  const { cropId } = useParams(); // Extract cropId from the URL

  const [pH, setPH] = useState('');
  const [moisture, setMoisture] = useState('');
  const [temperature, setTemperature] = useState('');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch existing soil data when the component loads or cropId changes
  useEffect(() => {
    if (cropId) {
      axios
        .get(`http://localhost:5000/api/soil-data/${cropId}`)
        .then((response) => {
          const data = response.data;
          // Pre-fill the form with existing data if available
          setPH(data.pH);
          setMoisture(data.moisture);
          setTemperature(data.temperature);
          setLocation(data.location);
          setLatitude(data.latitude);
          setLongitude(data.longitude);
        })
        .catch((err) => {
          setError('Error fetching soil data');
          console.error(err);
        });
    }
  }, [cropId]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newData = {
      pH,
      moisture,
      temperature,
      location,
      latitude,
      longitude,
      crop_id: cropId, // Include cropId from URL
    };

    axios
      .post('http://localhost:5000/api/soil-data', newData)
      .then(() => {
        setSuccess('Soil data added successfully!');
        setError(null);
        // Optionally, reset form fields after success
        setPH('');
        setMoisture('');
        setTemperature('');
        setLocation('');
        setLatitude('');
        setLongitude('');
      })
      .catch((err) => {
        setError('Error adding soil data');
        setSuccess(null);
        console.error(err);
      });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-semibold text-center text-green-600 mb-6">
          Add Soil Data for Crop ID: {cropId}
        </h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && <p className="text-green-500 text-center mb-4">{success}</p>}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-3 gap-6">
            {/* pH Field */}
            <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-3">
                <FaWater className="text-blue-500" size={24} />
                <div className="w-full">
                  <label className="block text-gray-700 font-semibold">pH:</label>
                  <input
                    type="number"
                    value={pH}
                    onChange={(e) => setPH(e.target.value)}
                    required
                    min="0"
                    max="14"
                    step="0.1"
                    className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Moisture Field */}
            <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-3">
                <FaLeaf className="text-green-500" size={24} />
                <div className="w-full">
                  <label className="block text-gray-700 font-semibold">Moisture:</label>
                  <input
                    type="number"
                    value={moisture}
                    onChange={(e) => setMoisture(e.target.value)}
                    required
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Temperature Field */}
            <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-3">
                <FaTemperatureHigh className="text-orange-500" size={24} />
                <div className="w-full">
                  <label className="block text-gray-700 font-semibold">Temperature:</label>
                  <input
                    type="number"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    required
                    min="-50"
                    max="50"
                    step="0.1"
                    className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Location Field */}
            <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
              <label className="block text-gray-700 font-semibold">Location:</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Latitude Field */}
            <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
              <label className="block text-gray-700 font-semibold">Latitude:</label>
              <input
                type="number"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                step="0.0001"
                className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Longitude Field */}
            <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
              <label className="block text-gray-700 font-semibold">Longitude:</label>
              <input
                type="number"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                step="0.0001"
                className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 mt-6 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              Add Soil Data
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
