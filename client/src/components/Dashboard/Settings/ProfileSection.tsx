"use client";
import { useState } from "react";

export default function ProfileSection() {
  const [showToast, setShowToast] = useState(false);

  const handleSave = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full">
      {showToast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white py-2 px-4 rounded shadow-lg">
          Settings saved successfully!
        </div>
      )}

      <h2 className="text-2xl font-semibold mb-6">Account Settings</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className="block text-sm font-medium mb-2">Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            className="border p-4 rounded w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            className="border p-4 rounded w-full"
          />
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium mb-2">Password</label>
        <input
          type="password"
          placeholder="Enter new password"
          className="border p-4 rounded w-full"
        />
      </div>

      <div className="flex justify-end mt-8">
        <button
          onClick={handleSave}
          className="bg-green-600 hover:bg-green-700 text-black py-3 px-8 rounded text-lg"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
