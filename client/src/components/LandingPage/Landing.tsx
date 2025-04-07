import React from "react";
import HeroSection from "./HeroSection";
import AboutSection from "./AboutSection";
// import other sections as needed, e.g. FeaturesSection, ContactSection, etc.

const Layout: React.FC = () => {
  return (
    <div className="w-full"> 
      <HeroSection />
      <AboutSection />
      {/* Add additional sections below */}
    </div>
  );
};

export default Layout;
