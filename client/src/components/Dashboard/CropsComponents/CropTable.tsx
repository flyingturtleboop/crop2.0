// src/components/Dashboard/Crops/CropTable.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiEdit, FiTrash2, FiSearch, FiPlus } from "react-icons/fi";
import AddCrop from "./AddCrop";
import EditCrop from "./EditCrop";
import Modal from "./CropModal";

interface Crop {
  id: string;
  crop_type: string;
  variety: string;
  growth_stage: string;
  amount_sown: number;
  extra_notes: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  crop_image?: string;
}

const CropTable: React.FC = () => {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editCrop, setEditCrop] = useState<Crop | null>(null);
  const [viewModal, setViewModal] = useState(false);
  const [viewImage, setViewImage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => { fetchCrops(); }, []);

  const fetchCrops = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get<Crop[]>("http://127.0.0.1:5000/crops", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setCrops(res.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || err.message || "Failed to fetch crops");
    } finally {
      setLoading(false);
    }
  };

  // filter & pagination
  const filtered = crops.filter(c =>
    c.crop_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.growth_stage.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const pageItems = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://127.0.0.1:5000/crops/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setCrops(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to delete crop");
    }
  };

  const handleEditClick = (crop: Crop) => {
    setEditCrop(crop);
    setOpenEdit(true);
  };

  const handleViewImage = (img: string) => {
    setViewImage(img);
    setViewModal(true);
  };

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">Error: {error}</p>;

  return (
    <div className="p-4 shadow-xl">
      <div className="flex flex-col md:flex-row items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Crop Tracker</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpenAdd(true)}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-black font-semibold px-4 py-2 rounded shadow-sm"
          >
            <FiPlus size={18} className="text-green-500" /> Add Crop
          </button>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded shadow-sm" />
          </div>
        </div>
      </div>

      <table className="min-w-full border border-gray-300 text-sm shadow-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-3 py-2 text-left font-semibold">Type</th>
            <th className="px-3 py-2 text-left font-semibold">Variety</th>
            <th className="px-3 py-2 text-left font-semibold">Stage</th>
            <th className="px-3 py-2 text-left font-semibold">Amount</th>
            <th className="px-3 py-2 text-left font-semibold">Location</th>
            <th className="px-3 py-2 text-left font-semibold">Receipt</th>
            <th className="px-3 py-2 text-left font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {pageItems.map(c => (
            <tr key={c.id} className="hover:bg-gray-50 border-b border-gray-200">
              <td className="px-3 py-2">{c.crop_type}</td>
              <td className="px-3 py-2">{c.variety}</td>
              <td className="px-3 py-2">{c.growth_stage}</td>
              <td className="px-3 py-2">{c.amount_sown}</td>
              <td className="px-3 py-2">{c.location || 'N/A'}</td>
              <td className="px-3 py-2">
                {c.crop_image ? (
                  <button
                    onClick={() => handleViewImage(c.crop_image!)}
                    className="bg-gray-200 text-black px-2 py-1 rounded text-xs"
                  >View</button>
                ) : 'No Image'}
              </td>
              <td className="px-3 py-2 space-x-2">
                <button onClick={() => handleEditClick(c)} className="text-blue-500 hover:underline shadow-sm p-1 rounded">
                  <FiEdit size={18} />
                </button>
                <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:underline shadow-sm p-1 rounded">
                  <FiTrash2 size={18} />
                </button>
              </td>
            </tr>
          ))}

          {pageItems.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center py-4 text-gray-500">
                No crops found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="flex flex-col md:flex-row items-center justify-between mt-4 text-sm text-gray-500">
        <div>
          Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} entries
        </div>
        <div className="flex items-center gap-2 mt-2 md:mt-0">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded hover:bg-gray-100 shadow-sm"
          >Prev</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 border rounded hover:bg-gray-100 shadow-sm ${page === currentPage ? 'bg-gray-200 font-bold' : ''}`}
            >{page}</button>
          ))}
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded hover:bg-gray-100 shadow-sm"
          >Next</button>
        </div>
      </div>

      {/* Add/Edit Modals and Image Viewer */}
      {openAdd && <AddCrop open={openAdd} setOpen={setOpenAdd} onCropAdded={fetchCrops} />}
      {openEdit && editCrop && (
        <EditCrop
          open={openEdit}
          setOpen={setOpenEdit}
          cropId={editCrop.id}
          initialData={{
            crop_type: editCrop.crop_type,
            variety: editCrop.variety,
            growth_stage: editCrop.growth_stage,
            amount_sown: editCrop.amount_sown,
            extra_notes: editCrop.extra_notes,
            location: editCrop.location || '',
            latitude: editCrop.latitude || 0,
            longitude: editCrop.longitude || 0,
            crop_image: editCrop.crop_image || ''
          }}
          onCropEdited={fetchCrops}
        />
      )}
      {viewModal && viewImage && (
        <Modal show={viewModal} onClose={() => setViewModal(false)} size="lg">
          <div className="p-4">
            <img src={viewImage} alt="Crop" className="max-w-full h-auto shadow-sm" />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CropTable;
