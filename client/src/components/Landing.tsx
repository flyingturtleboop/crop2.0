import React from 'react';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4 text-gray-800">Welcome to Our App</h1>
      <p className="text-lg mb-8 text-gray-600">
        Discover awesome features by signing in or registering!
      </p>
      <div className="space-x-4">
      </div>
    </div>
  );
};

export default Landing;
