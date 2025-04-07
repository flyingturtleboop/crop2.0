import React from "react";

const AboutSection: React.FC = () => {
  return (
    <section className="w-full py-16 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          About Our App
        </h2>
        <p className="text-lg text-gray-600">
          Our app is designed to help you monitor your crops, manage resources, 
          and optimize your farming operations with ease. Experience advanced 
          analytics, intuitive design, and comprehensive tools to grow smarter.
        </p>
      </div>
    </section>
  );
};

export default AboutSection;
