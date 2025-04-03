import React, { useState } from 'react';
import axios from 'axios';
import { FiPlus } from 'react-icons/fi';

interface CropData {
  crop_type: string;
  variety: string;
  growth_stage: string;
  amount_sown: number;
  extra_notes: string;
  location: string;
}

interface AddCropProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onCropAdded?: () => void;
}

const AddCrop: React.FC<AddCropProps> = ({ open, setOpen, onCropAdded }) => {
  const [formData, setFormData] = useState<CropData>({
    crop_type: '',
    variety: '',
    growth_stage: '',
    amount_sown: 0,
    extra_notes: '',
    location: '',
  });
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'amount_sown' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://127.0.0.1:5000/crops', formData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setOpen(false);
      if (onCropAdded) onCropAdded();
    } catch (err: any) {
      console.error("Error adding crop:", err);
      setError("Failed to add crop");
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Dark overlay */}
      <div
        className="fixed inset-0 bg-black opacity-50"
        onClick={handleCancel}
      ></div>
      {/* Modal content */}
      <div className="relative bg-white rounded-lg p-6 w-full max-w-lg z-10">
        <h2 className="flex items-center text-2xl font-bold mb-4">
          <FiPlus className="mr-2" size={24} />
          Add New Crop
        </h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="crop_type" className="block mb-1 font-semibold">
              Crop Type
            </label>
            <input
              id="crop_type"
              name="crop_type"
              type="text"
              value={formData.crop_type}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-2"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="variety" className="block mb-1 font-semibold">
              Variety
            </label>
            <input
              id="variety"
              name="variety"
              type="text"
              value={formData.variety}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-2"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="growth_stage" className="block mb-1 font-semibold">
              Growth Stage
            </label>
            <input
              id="growth_stage"
              name="growth_stage"
              type="text"
              value={formData.growth_stage}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-2"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="amount_sown" className="block mb-1 font-semibold">
              Amount Sown
            </label>
            <input
              id="amount_sown"
              name="amount_sown"
              type="number"
              value={formData.amount_sown}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-2"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="extra_notes" className="block mb-1 font-semibold">
              Extra Notes
            </label>
            <textarea
              id="extra_notes"
              name="extra_notes"
              value={formData.extra_notes}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-2"
              rows={3}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="location" className="block mb-1 font-semibold">
              Location
            </label>
            <input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-2"
              required
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-4 rounded shadow-sm"
            >
              <FiPlus className="mr-2" size={15} />
              <span>Add Crop</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCrop;
