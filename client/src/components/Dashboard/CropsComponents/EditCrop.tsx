import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FiX, FiEdit } from 'react-icons/fi';
import { useDropzone } from 'react-dropzone';
import CropModal from './CropModal';

interface CropData {
  crop_type:    string;
  variety:      string;
  growth_stage: string;
  amount_sown:  number;
  extra_notes:  string;
  location:     string;
  latitude?:    number;
  longitude?:   number;
  crop_image?:  string;
}

async function geocodeAddress(address: string) {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const res = await axios.get(
    'https://maps.googleapis.com/maps/api/geocode/json',
    { params: { address, key } }
  );
  if (res.data.status === 'OK' && res.data.results.length) {
    return res.data.results[0].geometry.location;
  }
  throw new Error(`Geocode failed: ${res.data.status}`);
}

interface EditCropProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  cropId: string;
  initialData: CropData;
  onCropEdited?: () => void;
}

const EditCrop: React.FC<EditCropProps> = ({
  open, setOpen, cropId, initialData, onCropEdited
}) => {
  const [formData, setFormData] = useState<CropData>(initialData);
  const [newCropFile, setNewCropFile] = useState<File | null>(null);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const onDrop = useCallback((files: File[]) => {
    if (files[0]) setNewCropFile(files[0]);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png','.jpg','.jpeg','.gif'] },
    multiple: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount_sown' ? Number(value) : value,
    }));
  };

  const handleLatLngChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: Number(value) }));
  };

  const handleAddressBlur = async () => {
    if (!formData.location) return;
    try {
      const coords = await geocodeAddress(formData.location);
      setFormData(prev => ({
        ...prev,
        latitude: coords.lat,
        longitude: coords.lng,
      }));
    } catch (err: any) {
      console.warn('Geocode error:', err.message);
      setError('Could not auto-fill coordinates');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      let { latitude, longitude } = formData;
      if (formData.location && (latitude == null || longitude == null)) {
        const coords = await geocodeAddress(formData.location);
        latitude  = coords.lat;
        longitude = coords.lng;
      }

      const token = localStorage.getItem('token');
      const data  = new FormData();
      data.append('crop_type',    formData.crop_type);
      data.append('variety',      formData.variety);
      data.append('growth_stage', formData.growth_stage);
      data.append('amount_sown',  formData.amount_sown.toString());
      data.append('extra_notes',  formData.extra_notes);
      data.append('location',     formData.location);
      if (latitude  != null) data.append('latitude',  String(latitude));
      if (longitude != null) data.append('longitude', String(longitude));
      if (newCropFile)        data.append('crop_image', newCropFile);

      await axios.put(`http://127.0.0.1:5000/crops/${cropId}`, data, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'multipart/form-data',
        },
      });

      onCropEdited?.();
      setOpen(false);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'Failed to edit crop');
    }
  };

  if (!open) return null;
  return (
    <CropModal show={open} onClose={() => setOpen(false)} size="md">
      <div className="p-4 relative">
        <button
          onClick={() => setOpen(false)}
          className="absolute top-2 right-2 text-black shadow-sm"
        >
          <FiX size={20} />
        </button>
        <h2 className="flex items-center text-2xl font-bold mb-4">
          <FiEdit className="mr-2 text-blue-500" size={24} /> Edit Crop
        </h2>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Crop Type */}
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
          {/* Variety */}
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
          {/* Growth Stage */}
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
          {/* Amount Sown */}
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
          {/* Extra Notes */}
          <div>
            <label className="block text-sm font-medium mb-1">Extra Notes</label>
            <textarea
              name="extra_notes"
              value={formData.extra_notes}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 shadow-sm"
              rows={3}
            />
          </div>
          {/* Address */}
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              onBlur={handleAddressBlur}
              className="w-full border rounded px-3 py-2 shadow-sm"
              placeholder="123 Main St, City, Country"
              required
            />
          </div>
          {/* Latitude & Longitude */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                name="latitude"
                value={formData.latitude ?? ''}
                onChange={handleLatLngChange}
                className="w-full border rounded px-3 py-2 shadow-sm"
                placeholder="auto-filled"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                name="longitude"
                value={formData.longitude ?? ''}
                onChange={handleLatLngChange}
                className="w-full border rounded px-3 py-2 shadow-sm"
                placeholder="auto-filled"
              />
            </div>
          </div>
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Upload New Crop Image</label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded p-4 text-center cursor-pointer shadow-sm ${
                isDragActive ? 'bg-blue-50 border-blue-400' : 'border-gray-300'
              }`}
            >
              <input {...getInputProps()} />
              {isDragActive ? <p>Drop here…</p> : <p>Drag & drop or click</p>}
            </div>
          </div>
          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 bg-gray-200 text-black rounded shadow-sm hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-black rounded shadow-sm hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </CropModal>
  );
};

export default EditCrop;
