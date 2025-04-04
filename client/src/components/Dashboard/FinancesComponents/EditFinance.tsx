// EditFinance.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { FiX, FiEdit } from 'react-icons/fi';

interface EditFinanceProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  financeId: string;
  initialData: {
    amount: number;
    currency: string;
    status: string;
    notes: string;
  };
  onFinanceEdited: () => void;
}

const EditFinance: React.FC<EditFinanceProps> = ({
  open,
  setOpen,
  financeId,
  initialData,
  onFinanceEdited,
}) => {
  const [formData, setFormData] = useState({
    amount: initialData.amount,
    currency: initialData.currency,
    status: initialData.status,
    notes: initialData.notes,
  });
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'amount' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://127.0.0.1:5000/finances/${financeId}`, formData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setError(null);
      onFinanceEdited();
      setOpen(false);
    } catch (err) {
      console.error("Error editing finance record:", err);
      setError("Failed to edit finance record.");
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
        <button
          className="absolute top-2 right-2"
          onClick={handleCancel}
        >
          <FiX size={20} />
        </button>
        <h2 className="flex items-center text-2xl font-bold mb-4">
          <FiEdit className="mr-2" size={24} />
          Edit Finance Record
        </h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="amount" className="block mb-1 font-semibold">
              Amount
            </label>
            <input
              id="amount"
              name="amount"
              type="number"
              step="any"
              value={formData.amount}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-2"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="currency" className="block mb-1 font-semibold">
              Currency
            </label>
            <input
              id="currency"
              name="currency"
              type="text"
              value={formData.currency}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-2"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="status" className="block mb-1 font-semibold">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-2"
              required
            >
              <option value="received">Received</option>
              <option value="sent">Sent</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="notes" className="block mb-1 font-semibold">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-2"
              rows={3}
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
              <FiEdit className="mr-2" size={15} />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditFinance;
