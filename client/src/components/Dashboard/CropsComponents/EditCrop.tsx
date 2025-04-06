// EditCrop.tsx
import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { FiX, FiEdit, FiEye } from 'react-icons/fi';
import { useDropzone } from 'react-dropzone';
import CropModal from './CropModal';

interface CropData {
  crop_type: string;
  variety: string;
  growth_stage: string;
  amount_sown: number;
  extra_notes: string;
  location: string;
  crop_image?: string;
}

interface EditCropProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  cropId: string;
  initialData: CropData;
  onCropEdited?: () => void;
}

const EditCrop: React.FC<EditCropProps> = ({ open, setOpen, cropId, initialData, onCropEdited }) => {
  const [formData, setFormData] = useState<CropData>(initialData);
  const [newCropFile, setNewCropFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles[0]) {
      setNewCropFile(acceptedFiles[0]);
    }
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif'] },
    multiple: false,
  });

  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount_sown' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      data.append('crop_type', formData.crop_type);
      data.append('variety', formData.variety);
      data.append('growth_stage', formData.growth_stage);
      data.append('amount_sown', formData.amount_sown.toString());
      data.append('extra_notes', formData.extra_notes);
      data.append('location', formData.location);
      if (newCropFile) {
        data.append('crop_image', newCropFile);
      }
      await axios.put(`http://127.0.0.1:5000/crops/${cropId}`, data, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'multipart/form-data',
        },
      });
      setError(null);
      onCropEdited && onCropEdited();
      setOpen(false);
    } catch (err) {
      console.error("Error editing crop:", err);
      setError("Failed to edit crop");
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const toggleViewModal = () => {
    setViewModalOpen(prev => !prev);
  };

  return (
    <CropModal show={open} onClose={handleCancel} size="md">
      <div className="p-4">
        <button className="absolute top-2 right-2 shadow-sm" onClick={handleCancel}>
          <FiX size={20} />
        </button>
        <h2 className="flex items-center text-2xl font-bold mb-4">
          <FiEdit className="mr-2 text-blue-500" size={24} />
          Edit Crop
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Crop Type</label>
            <input 
              type="text"
              name="crop_type"
              value={formData.crop_type}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 shadow-sm"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Variety</label>
            <input 
              type="text"
              name="variety"
              value={formData.variety}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 shadow-sm"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Growth Stage</label>
            <input 
              type="text"
              name="growth_stage"
              value={formData.growth_stage}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 shadow-sm"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Amount Sown</label>
            <input 
              type="number"
              name="amount_sown"
              value={formData.amount_sown}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 shadow-sm"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Extra Notes</label>
            <textarea 
              name="extra_notes"
              value={formData.extra_notes}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 shadow-sm"
              rows={3}
            ></textarea>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Location</label>
            <input 
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 shadow-sm"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Upload New Crop Image</label>
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
              className="bg-blue-600 text-black px-4 py-2 rounded hover:bg-blue-700 shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
        {initialData.crop_image && (
          <div className="mt-4">
            <p className="font-semibold mb-2">Current Crop Image:</p>
            <div className="flex flex-col items-center">
              <img src={initialData.crop_image} alt="Current Crop" className="w-16 h-auto border shadow-sm" />
              <div className="w-full flex justify-end mt-2">
                <button
                  type="button"
                  onClick={toggleViewModal}
                  className="bg-gray-200 text-black shadow-sm px-2 py-1 rounded text-sm"
                >
                  View
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {viewModalOpen && initialData.crop_image && (
        <CropModal show={viewModalOpen} onClose={toggleViewModal} size="lg">
          <div className="p-4">
            <img src={initialData.crop_image} alt="Full Crop" className="max-w-full h-auto shadow-sm mx-auto" />
          </div>
        </CropModal>
      )}
    </CropModal>
  );
};

export default EditCrop;
