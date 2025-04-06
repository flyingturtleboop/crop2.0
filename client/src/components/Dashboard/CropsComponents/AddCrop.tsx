// AddCrop.tsx
import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { FiPlus } from 'react-icons/fi';
import { useDropzone } from 'react-dropzone';
import CropModal from './CropModal';

interface AddCropProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onCropAdded?: () => void;
}

interface CropData {
  crop_type: string;
  variety: string;
  growth_stage: string;
  amount_sown: number;
  extra_notes: string;
  location: string;
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
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles[0]) {
      setCropFile(acceptedFiles[0]);
    }
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif'] },
    multiple: false,
  });

  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      if (cropFile) {
        data.append('crop_image', cropFile);
      }
      await axios.post('http://127.0.0.1:5000/crops', data, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'multipart/form-data',
        },
      });
      setOpen(false);
      if (onCropAdded) onCropAdded();
    } catch (err: any) {
      console.error("Error adding crop record:", err);
      setError("Failed to add crop record");
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <CropModal show={open} onClose={handleCancel} size="md">
      <div className="p-4">
        <h2 className="flex items-center text-2xl font-bold mb-4">
          <FiPlus className="mr-2 text-green-500" size={24} />
          Add Crop
        </h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
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
          <div>
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
          <div>
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
          <div>
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
          <div>
            <label className="block text-sm font-medium mb-1">Extra Notes</label>
            <textarea 
              name="extra_notes"
              value={formData.extra_notes}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 shadow-sm"
              rows={3}
            ></textarea>
          </div>
          <div>
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
          <div>
            <label className="block text-sm font-medium mb-2">Upload Crop Image</label>
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
              <FiPlus className="mr-2 text-green-500" size={15} />
              Save
            </button>
          </div>
        </form>
      </div>
    </CropModal>
  );
};

export default AddCrop;
