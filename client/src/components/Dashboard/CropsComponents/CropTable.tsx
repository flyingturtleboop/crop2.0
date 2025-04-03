import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiEdit, FiTrash2, FiSearch, FiPlus } from "react-icons/fi";
import AddCrop from "./AddCrop";
import EditCrop from "./EditCrop";

interface Crop {
  id: string;
  crop_type: string;
  variety: string;
  growth_stage: string;
  amount_sown: number;
  extra_notes: string;
  location: string;
}

const CropTable: React.FC = () => {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openAdd, setOpenAdd] = useState<boolean>(false);
  const [openEdit, setOpenEdit] = useState<boolean>(false);
  const [editCrop, setEditCrop] = useState<Crop | null>(null);
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

  // Reset pagination when search term changes
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

  // Filter crops based on search term (case-insensitive)
  const filteredCrops = crops.filter((crop) =>
    crop.crop_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crop.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crop.growth_stage.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crop.extra_notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crop.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredCrops.length / itemsPerPage);
  const paginatedCrops = filteredCrops.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="p-4 shadow-xl relative">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-2">
        <h2 className="text-2xl font-bold text-gray-700">Crop Tracker</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpenAdd(true)}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-black font-semibold py-2 px-4 rounded shadow-sm"
          >
            <FiPlus size={18} />
            <span>Add Crop</span>
          </button>
          <div className="relative text-gray-600">
            <input
              type="text"
              className="border border-gray-300 rounded-lg py-2 px-3 pl-10 focus:outline-none"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400" />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left whitespace-no-wrap">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 font-medium text-gray-600 text-sm uppercase">
                Crop Type
              </th>
              <th className="px-4 py-3 font-medium text-gray-600 text-sm uppercase">
                Variety
              </th>
              <th className="px-4 py-3 font-medium text-gray-600 text-sm uppercase">
                Growth Stage
              </th>
              <th className="px-4 py-3 font-medium text-gray-600 text-sm uppercase">
                Amount Sown
              </th>
              <th className="px-4 py-3 font-medium text-gray-600 text-sm uppercase">
                Extra Notes
              </th>
              <th className="px-4 py-3 font-medium text-gray-600 text-sm uppercase">
                Location
              </th>
              <th className="px-4 py-3 font-medium text-gray-600 text-sm uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {paginatedCrops.map((crop) => (
              <tr key={crop.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{crop.crop_type}</td>
                <td className="px-4 py-3">{crop.variety}</td>
                <td className="px-4 py-3">{crop.growth_stage}</td>
                <td className="px-4 py-3">{crop.amount_sown}</td>
                <td className="px-4 py-3">{crop.extra_notes}</td>
                <td className="px-4 py-3">{crop.location}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditClick(crop)}
                      className="text-blue-500 hover:text-blue-700 shadow-sm"
                    >
                      <FiEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(crop.id)}
                      className="text-red-500 hover:text-red-700 shadow-sm"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {paginatedCrops.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500">
                  No crops found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar (always rendered) */}
      <div className="flex flex-col md:flex-row items-center justify-between mt-4 text-sm text-gray-500">
        <div>
          Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
          {Math.min(currentPage * itemsPerPage, filteredCrops.length)} of{" "}
          {filteredCrops.length} entries
        </div>
        <div className="mt-2 md:mt-0 flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 shadow-sm"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 shadow-sm ${
                page === currentPage ? "bg-gray-200 font-bold" : ""
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 shadow-sm"
          >
            Next
          </button>
        </div>
      </div>

      {/* Render the Add Crop modal */}
      {openAdd && (
        <AddCrop open={openAdd} setOpen={setOpenAdd} onCropAdded={fetchCrops} />
      )}

      {/* Render the Edit Crop modal */}
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
          }}
          onCropEdited={fetchCrops}
        />
      )}
    </div>
  );
};

export default CropTable;
