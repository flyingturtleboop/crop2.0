// CropTable.tsx
import React, { useEffect, useState, Fragment } from "react";
import axios from "axios";
import { FiEdit, FiTrash2, FiSearch, FiPlus } from "react-icons/fi";
import AddCrop from "./AddCrop";
import EditCrop from "./EditCrop";
import CropModal from "./CropModal";

interface Crop {
  id: string;
  crop_type: string;
  variety: string;
  growth_stage: string;
  amount_sown: number;
  extra_notes: string;
  location: string;
  crop_image?: string;
}

const CropTable: React.FC = () => {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openAdd, setOpenAdd] = useState<boolean>(false);
  const [openEdit, setOpenEdit] = useState<boolean>(false);
  const [editCrop, setEditCrop] = useState<Crop | null>(null);
  const [viewModal, setViewModal] = useState<boolean>(false);
  const [viewImage, setViewImage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 15;

  const fetchCrops = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://127.0.0.1:5000/crops", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setCrops(response.data);
      setLoading(false);
    } catch (err: any) {
      console.error("Error fetching crops:", err);
      setError("Failed to fetch crops");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrops();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://127.0.0.1:5000/crops/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setCrops((prev) => prev.filter((crop) => crop.id !== id));
    } catch (err) {
      console.error("Error deleting crop:", err);
      alert("Failed to delete crop");
    }
  };

  const handleEditClick = (crop: Crop) => {
    setEditCrop(crop);
    setOpenEdit(true);
  };

  const handleViewImage = (image: string) => {
    setViewImage(image);
    setViewModal(true);
  };

  const filteredCrops = crops.filter((crop) =>
    crop.crop_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crop.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crop.growth_stage.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crop.extra_notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crop.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCrops.length / itemsPerPage);
  const paginatedCrops = filteredCrops.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="p-4 shadow-xl">
      <div className="flex flex-col md:flex-row items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Crop Tracker</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpenAdd(true)}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-black font-semibold px-4 py-2 rounded shadow-sm"
          >
            <FiPlus size={18} className="text-green-500" />
            Add Crop
          </button>
          <input
            type="text"
            placeholder="Search..."
            className="border border-gray-300 rounded px-3 py-2 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <table className="min-w-full border border-gray-300 text-sm shadow-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-3 py-2 text-left font-semibold">Crop Type</th>
            <th className="px-3 py-2 text-left font-semibold">Variety</th>
            <th className="px-3 py-2 text-left font-semibold">Growth Stage</th>
            <th className="px-3 py-2 text-left font-semibold">Amount Sown</th>
            <th className="px-3 py-2 text-left font-semibold">Extra Notes</th>
            <th className="px-3 py-2 text-left font-semibold">Location</th>
            <th className="px-3 py-2 text-left font-semibold">Image</th>
            <th className="px-3 py-2 text-left font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {paginatedCrops.map((crop) => (
            <tr key={crop.id} className="hover:bg-gray-50 border-b border-gray-200 shadow-sm">
              <td className="px-3 py-2">{crop.crop_type}</td>
              <td className="px-3 py-2">{crop.variety}</td>
              <td className="px-3 py-2">{crop.growth_stage}</td>
              <td className="px-3 py-2">{crop.amount_sown}</td>
              <td className="px-3 py-2">{crop.extra_notes}</td>
              <td className="px-3 py-2">{crop.location}</td>
              <td className="px-3 py-2">
                {crop.crop_image ? (
                  <div className="flex items-center gap-2">
                    <img
                      src={crop.crop_image}
                      alt="Crop"
                      className="w-16 h-auto border shadow-sm"
                    />
                    <button
                      onClick={() => handleViewImage(crop.crop_image!)}
                      className="bg-black text-black shadow-sm px-2 py-1 rounded text-xs"
                    >
                      View
                    </button>
                  </div>
                ) : (
                  "No Image"
                )}
              </td>
              <td className="px-3 py-2">
                <button 
                  onClick={() => handleEditClick(crop)} 
                  className="text-blue-500 hover:underline shadow-sm mr-2"
                >
                  <FiEdit size={18} className="text-blue-500" />
                </button>
                <button 
                  onClick={() => handleDelete(crop.id)} 
                  className="text-red-500 hover:underline shadow-sm"
                >
                  <FiTrash2 size={18} className="text-red-500" />
                </button>
              </td>
            </tr>
          ))}
          {paginatedCrops.length === 0 && (
            <tr>
              <td colSpan={8} className="text-center py-4 text-gray-500">
                No crops found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="flex flex-col md:flex-row items-center justify-between mt-4 text-sm text-gray-500">
        <div>
          Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
          {Math.min(currentPage * itemsPerPage, filteredCrops.length)} of{" "}
          {filteredCrops.length} entries
        </div>
        <div className="flex items-center gap-2 mt-2 md:mt-0">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded hover:bg-gray-100 shadow-sm"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 border rounded hover:bg-gray-100 shadow-sm ${
                page === currentPage ? "bg-gray-200 font-bold" : ""
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded hover:bg-gray-100 shadow-sm"
          >
            Next
          </button>
        </div>
      </div>
      {openAdd && (
        <AddCrop open={openAdd} setOpen={setOpenAdd} onCropAdded={fetchCrops} />
      )}
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
            location: editCrop.location,
            crop_image: editCrop.crop_image,
          }}
          onCropEdited={fetchCrops}
        />
      )}
      {viewModal && viewImage && (
        <CropModal show={viewModal} onClose={() => setViewModal(false)} size="lg">
          <div className="p-4">
            <img src={viewImage} alt="Full Crop" className="max-w-full h-auto shadow-sm" />
          </div>
        </CropModal>
      )}
    </div>
  );
};

export default CropTable;
