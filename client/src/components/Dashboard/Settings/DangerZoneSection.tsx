"use client";
import { useState } from "react";

export default function DangerZoneSection() {
  const [showModal, setShowModal] = useState(false);

  const handleDelete = () => {
    console.log("Account deleted");
    setShowModal(false);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full">
      <h2 className="text-2xl font-semibold mb-6 text-red-600">Danger Zone</h2>

      <div className="flex justify-start">
        <button
          onClick={() => setShowModal(true)}
          className="bg-red-600 hover:bg-red-700 text-black py-4 px-8 rounded text-lg"
        >
          Delete Account
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 w-full h-full bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-center text-red-600">
              Are you sure?
            </h2>
            <p className="text-center mb-6 text-gray-600">
              This action cannot be undone.
            </p>
            <div className="flex justify-between">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded w-1/2 mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-green-600 hover:bg-green-700 text-black font-semibold py-2 px-4 rounded w-1/2 ml-2"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
