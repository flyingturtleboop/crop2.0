import React from "react";
import HeroSection from "./HeroSection";
import AboutSection from "./AboutSection";

const Layout: React.FC = () => {
  return (
    <div className="w-full"> 
      <AboutSection />
      {/* Add additional sections below */}
    </div>
  );
};

export default Layout;
