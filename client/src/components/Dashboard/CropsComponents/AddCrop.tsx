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
  crop_type:    string;
  variety:      string;
  growth_stage: string;
  amount_sown:  number;
  extra_notes:  string;
  location:     string;
  latitude?:    number;
  longitude?:   number;
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

const AddCrop: React.FC<AddCropProps> = ({ open, setOpen, onCropAdded }) => {
  const [formData, setFormData] = useState<CropData>({
    crop_type:    '',
    variety:      '',
    growth_stage: '',
    amount_sown:  0,
    extra_notes:  '',
    location:     '',
    latitude:     undefined,
    longitude:    undefined,
  });
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [error,    setError]    = useState<string | null>(null);

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) setCropFile(accepted[0]);
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
    setFormData(prev => ({
      ...prev,
      [name]: Number(value),
    }));
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
      // fallback geocode if blur didn't run
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
      if (cropFile)          data.append('crop_image', cropFile);

      await axios.post('http://127.0.0.1:5000/crops', data, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'multipart/form-data',
        },
      });

      setOpen(false);
      onCropAdded?.();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'Failed to add crop');
    }
  };

  if (!open) return null;
  return (
    <CropModal show={open} onClose={() => setOpen(false)} size="md">
      <div className="p-4">
        <h2 className="flex items-center text-2xl font-bold mb-4">
          <FiPlus className="mr-2 text-green-500" /> Add Crop
        </h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
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
            <label className="block text-sm font-medium mb-2">Upload Crop Image</label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded p-4 text-center cursor-pointer shadow-sm ${
                isDragActive ? 'bg-blue-50 border-blue-400' : 'border-gray-300'
              }`}
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <p>Drop the file here…</p>
              ) : (
                <p>Drag & drop a file here, or click to select</p>
              )}
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
              className="flex items-center px-4 py-2 bg-blue-600 text-black rounded shadow-sm hover:bg-blue-700"
            >
              <FiPlus className="mr-2 text-green-500" /> Save
            </button>
          </div>
        </form>
      </div>
    </CropModal>
  );
};

export default AddCrop;
