import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CropTable from './CropsComponents/CropTable';
import AddCrop from './CropsComponents/AddCrop';

const Crops: React.FC = () => {
  return (
    <Routes>
      {/* Default route shows the crop table */}
      <Route index element={<CropTable />} />
      {/* The "add" route displays the AddCrop modal */}
      <Route path="add" element={<AddCrop />} />
      {/* Fallback: show crop table */}
      <Route path="*" element={<CropTable />} />
    </Routes>
  );
};

export default Crops;
