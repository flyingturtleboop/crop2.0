import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FaWater, FaLeaf, FaTemperatureHigh } from 'react-icons/fa';

export default function SoilSensors() {
  const { cropId } = useParams();

  const [pH, setPH] = useState('');
  const [moisture, setMoisture] = useState('');
  const [temperature, setTemperature] = useState<string>('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = (latitude: number, longitude: number) => {
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      )
        .then((res) => res.json())
        .then((data) => {
          const temp = data?.current_weather?.temperature;
          if (typeof temp === 'number') {
            setTemperature(temp.toFixed(1));
          } else {
            setError('Temperature data not available');
          }
        })
        .catch((err) => {
          setError('Failed to fetch weather data');
          console.error(err);
        });
    };

    const defaultLat = 39.0119;
    const defaultLon = -98.4842;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => fetchWeather(coords.latitude, coords.longitude),
        (err) => {
          console.warn('Geolocation failed, using default coordinates:', err);
          fetchWeather(defaultLat, defaultLon);
        }
      );
    } else {
      console.warn('Geolocation unavailable, using default coordinates');
      fetchWeather(defaultLat, defaultLon);
    }
  }, []);

  useEffect(() => {
    if (cropId) {
      axios
        .get(`http://localhost:5000/api/soil-data/${cropId}`)
        .then((response) => {
          const data = response.data;
          if (data.length > 0) {
            const latest = data[data.length - 1];
            setPH(latest.pH);
            setMoisture(latest.moisture);
            setLocation(latest.location || '');
          }
        })
        .catch((err) => {
          console.error('Error fetching soil data:', err);
          // Show user-friendly prompt to connect sensors
          setError('Connect soil sensors');
        });
    }
  }, [cropId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newData = {
      pH,
      moisture,
      temperature,
      location,
      crop_id: cropId,
    };

    axios
      .post('http://localhost:5000/api/soil-data', newData)
      .then(() => {
        setSuccess('Soil data added successfully!');
        setError(null);
        setPH('');
        setMoisture('');
        setLocation('');
      })
      .catch((err) => {
        setError('Error adding soil data');
        setSuccess(null);
        console.error(err);
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-20 px-8 bg-white">
      <div className="w-full max-w-7xl bg-white p-12 rounded-xl shadow-2xl">
        <h2 className="text-5xl font-bold text-center text-gray-900 mb-12">
          Soil Sensor Data
        </h2>

        {error && <p className="text-red-600 text-xl text-center mb-6">{error}</p>}
        {success && <p className="text-green-700 text-xl text-center mb-6">{success}</p>}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-gray-100 p-6 rounded-lg shadow-md">
              <div className="flex flex-col items-center">
                <FaWater className="text-blue-500 mb-2" size={36} />
                <label className="text-xl font-semibold text-gray-800 mb-2">pH:</label>
                <input
                  type="number"
                  value={pH}
                  onChange={(e) => setPH(e.target.value)}
                  required
                  min="0"
                  max="14"
                  step="0.1"
                  className="w-full text-lg px-4 py-3 border rounded-lg focus:outline-none focus:ring-4 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="bg-gray-100 p-6 rounded-lg shadow-md">
              <div className="flex flex-col items-center">
                <FaLeaf className="text-green-600 mb-2" size={36} />
                <label className="text-xl font-semibold text-gray-800 mb-2">Moisture:</label>
                <input
                  type="number"
                  value={moisture}
                  onChange={(e) => setMoisture(e.target.value)}
                  required
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full text-lg px-4 py-3 border rounded-lg focus:outline-none focus:ring-4 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="bg-gray-100 p-6 rounded-lg shadow-md">
              <div className="flex flex-col items-center">
                <FaTemperatureHigh className="text-orange-500 mb-2" size={36} />
                <label className="text-xl font-semibold text-gray-800 mb-2">Temperature (°C):</label>
                <input
                  type="text"
                  value={temperature || ''}
                  placeholder="Loading..."
                  readOnly
                  className="w-full text-lg px-4 py-3 border bg-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          <div className="mt-16 flex justify-center">
            <button
              type="submit"
              className="text-white text-2xl font-bold px-12 py-4 rounded-full shadow-lg bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 focus:outline-none focus:ring-4 focus:ring-green-400 transform hover:scale-105 transition duration-300"
            >
              Add Soil Data
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}