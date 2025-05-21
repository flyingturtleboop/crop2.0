// src/components/AddFinance.tsx
import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { FiPlus } from 'react-icons/fi';
import { useDropzone } from 'react-dropzone';
import Modal from './Modal';

interface AddFinanceProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onFinanceAdded?: () => void;
}

interface FinanceData {
  amount: number;
  currency: string;
  status: string;
  notes: string;
}

const AddFinance: React.FC<AddFinanceProps> = ({ open, setOpen, onFinanceAdded }) => {
  const [formData, setFormData] = useState<FinanceData>({
    amount: 0,
    currency: '',
    status: 'received',
    notes: '',
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) setReceiptFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
  });

  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(f => ({
      ...f,
      [name]: name === 'amount' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const token = localStorage.getItem('token');
    const data = new FormData();
    data.append('amount', formData.amount.toString());
    data.append('currency', formData.currency);
    data.append('status', formData.status);
    data.append('notes', formData.notes);
    if (receiptFile) data.append('receipt_image', receiptFile);

    try {
      // let axios set the Content-Type (with boundary)
      const headers: Record<string,string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      await axios.post(
        'http://127.0.0.1:5000/finances',
        data,
        { headers }
      );

      setOpen(false);
      if (onFinanceAdded) onFinanceAdded();
    } catch (err: any) {
      console.error('Error adding finance record:', err);
      setError(err.response?.data?.error || 'Failed to add finance record');
    }
  };

  return (
    <Modal show={open} onClose={() => setOpen(false)} size="md">
      <div className="p-4">
        <h2 className="flex items-center text-2xl font-bold mb-4">
          <FiPlus className="mr-2 text-green-500" size={24} />
          Add Finance
        </h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Amount</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Currency</label>
            <input
              type="text"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2 shadow-sm"
            >
              <option value="received">Received</option>
              <option value="sent">Sent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full border rounded px-3 py-2 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Upload Receipt</label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded p-4 text-center cursor-pointer transition shadow-sm ${
                isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
              }`}
            >
              <input {...getInputProps()} />
              <p className="text-gray-500">
                {isDragActive
                  ? 'Drop the file here'
                  : 'Drag & drop an image, or click to select'}
              </p>
            </div>
            {receiptFile && (
              <p className="mt-2 text-gray-600">
                Selected: <strong>{receiptFile.name}</strong>
              </p>
            )}
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="bg-gray-200 text-black px-4 py-2 rounded hover:bg-gray-300 shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center bg-blue-600 text-black px-4 py-2 rounded hover:bg-blue-700 shadow-sm"
            >
              <FiPlus className="mr-2 text-green-500" size={15} />
              Save
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AddFinance;
