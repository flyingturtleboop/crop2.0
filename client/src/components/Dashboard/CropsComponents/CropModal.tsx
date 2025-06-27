import React from 'react';
import { FiX } from 'react-icons/fi';

interface CropModalProps {
  show: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const CropModal: React.FC<CropModalProps> = ({ show, onClose, children, size = 'md' }) => {
  if (!show) return null;

  let maxWidthClass = "max-w-md";
  if (size === 'sm') maxWidthClass = "max-w-sm";
  else if (size === 'lg') maxWidthClass = "max-w-lg";
  else if (size === 'xl') maxWidthClass = "max-w-xl";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="fixed inset-0"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
        onClick={onClose}
      ></div>
      <div
        className={`relative z-60 bg-white rounded-lg shadow-lg w-full ${maxWidthClass} max-h-[90vh] overflow-y-auto`}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-black hover:text-gray-700 shadow-sm"
        >
          <FiX size={20} />
        </button>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CropModal;
