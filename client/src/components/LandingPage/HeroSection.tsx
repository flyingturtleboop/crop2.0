// HeroSection.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Background image filling this hero section only */}
      <div
        className="fixed top-16 left-0 w-full h-full bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: "url('/intro_img1.png')" }}
      />
      {/* Dark overlay on top of the image */}
      <div className="fixed top-16 left-0 w-full h-[calc(100vh-4rem)] inset-0 bg-black/40" />

      {/* Hero content (on top) */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
        <h1 className="text-4xl font-bold mb-4">Track Your Crops. Grow Smarter.</h1>
        <p className="text-lg mb-8 text-center max-w-xl">
          Monitor crop health, schedule tasks, and maximize your harvest—all in one place.
        </p>
        <button
          onClick={() => navigate("/login")}
          style={{ backgroundColor: "#22c55e" }}
          className="px-6 py-3 bg-green-500 text-white font-semibold rounded hover:bg-green-600 transition"
        >
          Get Started
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
