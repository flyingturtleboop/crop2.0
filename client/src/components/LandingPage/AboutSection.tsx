import React, { useState, useEffect } from 'react';
import { Parallax } from 'react-parallax';
import CountUp from 'react-countup';
import { MdAnalytics, MdCloud, MdPhoneIphone, MdForum, MdSecurity } from 'react-icons/md';

// Dependencies:
// npm install react-countup react-parallax react-icons

// Weather widget using open-meteo (no API key needed)
const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<{ temperature: number; windspeed: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        const { latitude, longitude } = coords;
        fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
        )
          .then((res) => res.json())
          .then((data) => {
            setWeather({
              temperature: data.current_weather.temperature,
              windspeed: data.current_weather.windspeed,
            });
          });
      });
    }
  }, []);

  if (!weather) {
    return <p className="text-gray-600">Loading weather...</p>;
  }

  return (
    <div className="inline-block bg-white p-6 rounded-2xl shadow-md">
      <p className="text-4xl font-bold text-gray-800">{weather.temperature}°C</p>
      <p className="text-gray-600">Windspeed: {weather.windspeed} km/h</p>
    </div>
  );
};

const AboutSection: React.FC = () => {
  return (
    <div className="font-sans antialiased">
      {/* Parallax Hero with Accuracy */}
      <Parallax
        bgImage="https://source.unsplash.com/1600x900/?drone,farmland"
        bgImageAlt="Aerial view of farmland"
        strength={400}
        className="h-screen w-full"
      >
        <div className="relative bg-green-900 bg-opacity-30 flex h-screen flex-col items-center justify-center text-center p-4">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold text-green-300 drop-shadow-2xl">
            Discover CropAI
          </h1>
          {/* Prominent Accuracy Display */}
          <div className="mt-8 flex flex-col items-center">
            <CountUp
              end={93}
              duration={2}
              suffix="%"
              className="text-8xl font-extrabold text-white drop-shadow-lg"
            />
            <p className="mt-2 text-xl text-white">Accuracy Rate</p>
          </div>
        </div>
      </Parallax>

      {/* Features Cards */}
      <section className="py-16 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-10 text-center">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex items-start bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
              <MdAnalytics size={36} className="text-green-600 mr-4" />
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Real-time Analytics</h3>
                <p className="text-gray-600">Track crop health and yield predictions instantly.</p>
              </div>
            </div>
            <div className="flex items-start bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
              <MdCloud size={36} className="text-blue-500 mr-4" />
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Weather Forecasts</h3>
                <p className="text-gray-600">Receive hyperlocal weather alerts for proactive planning.</p>
              </div>
            </div>
            <div className="flex items-start bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
              <MdPhoneIphone size={36} className="text-green-600 mr-4" />
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Cross-device Access</h3>
                <p className="text-gray-600">Access your dashboard on desktop and mobile seamlessly.</p>
              </div>
            </div>
            <div className="flex items-start bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
              <MdForum size={36} className="text-purple-500 mr-4" />
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Community Forum</h3>
                <p className="text-gray-600">Share insights and tips with fellow growers.</p>
              </div>
            </div>
            <div className="flex items-start bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
              <MdSecurity size={36} className="text-blue-800 mr-4" />
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Secure Storage</h3>
                <p className="text-gray-600">Your data is encrypted and stored with privacy controls.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Weather Widget */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Current Weather</h2>
          <WeatherWidget />
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Stay Updated</h2>
          <p className="text-gray-600 mb-6">Subscribe to our newsletter for the latest updates and tips.</p>
          <form className="flex justify-center gap-2">
            <input
              type="email"
              placeholder="Email address"
              className="px-4 py-2 border rounded-l-lg focus:outline-none"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded-r-lg hover:bg-green-700 transition"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-green-200 to-green-400">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to transform your farm?</h2>
          <p className="text-white mb-8 leading-snug">Get started today and join farmers optimizing with Crop-AI.</p>
          <a
            href="/register"
            className="inline-block px-8 py-4 bg-white text-green-600 font-bold rounded-full shadow-xl hover:shadow-2xl transition"
          >
            Get Started
          </a>
        </div>
      </section>
    </div>
  );
};

export default AboutSection;
