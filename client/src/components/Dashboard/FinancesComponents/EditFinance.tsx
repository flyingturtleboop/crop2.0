// EditFinance.tsx
import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { FiX, FiEdit, FiEye } from 'react-icons/fi';
import { useDropzone } from 'react-dropzone';
import Modal from './Modal';

interface EditFinanceProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  financeId: string;
  initialData: {
    amount: number;
    currency: string;
    status: string;
    notes: string;
    receipt_image?: string;
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
  const [newReceiptFile, setNewReceiptFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles[0]) {
      setNewReceiptFile(acceptedFiles[0]);
    }
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif'] },
    multiple: false,
  });

  if (!open) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      data.append('amount', formData.amount.toString());
      data.append('currency', formData.currency);
      data.append('status', formData.status);
      data.append('notes', formData.notes);
      if (newReceiptFile) {
        data.append('receipt_image', newReceiptFile);
      }
      await axios.put(`http://127.0.0.1:5000/finances/${financeId}`, data, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'multipart/form-data',
        },
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

  const toggleViewModal = () => {
    setViewModalOpen(prev => !prev);
  };

  return (
    <Modal show={open} onClose={handleCancel} size="md">
      <div className="p-4">
        <button className="absolute top-2 right-2 shadow-sm" onClick={handleCancel}>
          <FiX size={20} />
        </button>
        <h2 className="flex items-center text-2xl font-bold mb-4">
          <FiEdit className="mr-2 text-blue-500" size={24} />
          Edit Finance Record
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-4">
            <label htmlFor="amount" className="block mb-1 font-semibold">Amount</label>
            <input
              id="amount"
              name="amount"
              type="number"
              step="any"
              value={formData.amount}
              onChange={handleChange}
              className="w-full border rounded p-2 shadow-sm"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="currency" className="block mb-1 font-semibold">Currency</label>
            <input
              id="currency"
              name="currency"
              type="text"
              value={formData.currency}
              onChange={handleChange}
              className="w-full border rounded p-2 shadow-sm"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="status" className="block mb-1 font-semibold">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border rounded p-2 shadow-sm"
              required
            >
              <option value="received">Received</option>
              <option value="sent">Sent</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="notes" className="block mb-1 font-semibold">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full border rounded p-2 shadow-sm"
              rows={3}
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Upload New Receipt Image</label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded p-4 text-center cursor-pointer transition shadow-sm ${isDragActive ? 'bg-blue-50 border-blue-400' : 'border-gray-300'}`}
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <p className="text-blue-500">Drop the file here...</p>
              ) : (
                <p className="text-gray-500">Drag & drop a file here, or click to select</p>
              )}
            </div>
            {newReceiptFile && (
              <p className="mt-2 text-gray-600">
                Selected: <strong>{newReceiptFile.name}</strong>
              </p>
            )}
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <div className="flex justify-end space-x-4">
            <button 
              type="button"
              onClick={handleCancel}
              className="bg-gray-200 text-black px-4 py-2 rounded hover:bg-gray-300 shadow-sm"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex items-center bg-blue-600 text-black px-4 py-2 rounded hover:bg-blue-700 shadow-sm"
            >
              <FiEdit className="mr-2 text-blue-500" size={15} />
              Save Changes
            </button>
          </div>
        </form>
        {initialData.receipt_image && (
          <div className="mt-4">
            <p className="font-semibold mb-2">Current Receipt:</p>
            <div className="flex flex-col items-center">
              <img
                src={initialData.receipt_image}
                alt="Current Receipt"
                className="w-16 h-auto border shadow-sm"
              />
              <div className="w-full flex justify-end mt-2">
                <button
                  type="button"
                  onClick={toggleViewModal}
                  className="bg-gray-200 text-black shadow-sm px-2 py-1 rounded text-xs"
                >
                  View
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {viewModalOpen && initialData.receipt_image && (
        <Modal show={viewModalOpen} onClose={toggleViewModal} size="lg">
          <div className="p-4">
            <img src={initialData.receipt_image} alt="Full Receipt" className="max-w-full h-auto shadow-sm" />
          </div>
        </Modal>
      )}
    </Modal>
  );
};

export default EditFinance;
