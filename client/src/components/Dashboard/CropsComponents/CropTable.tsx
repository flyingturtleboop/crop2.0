import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiEdit, FiTrash2, FiPlus } from "react-icons/fi";
import AddCrop from "./AddCrop";
import EditCrop from "./EditCrop";

interface Crop {
  id: string;
  crop_type:    string;
  variety:      string;
  growth_stage: string;
  amount_sown:  number;
  extra_notes:  string;
  location?:    string;
  latitude?:    number;
  longitude?:   number;
  crop_image?:  string;
}

const CropTable: React.FC = () => {
  const [crops,    setCrops]    = useState<Crop[]>([]);
  const [loading,  setLoading]  = useState<boolean>(true);
  const [error,    setError]    = useState<string | null>(null);
  const [openAdd,  setOpenAdd]  = useState<boolean>(false);
  const [openEdit, setOpenEdit] = useState<boolean>(false);
  const [editCrop, setEditCrop] = useState<Crop | null>(null);

  const fetchCrops = async () => {
    setLoading(true);
    setError(null);

    try {
      // read the JWT your login stored
      const token = localStorage.getItem("token"); 
      console.log("📦 JWT →", token);
      const res = await axios.get("http://127.0.0.1:5000/crops", {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : undefined,
      });
      setCrops(res.data);
    } catch (err: any) {
      console.error("Error fetching crops:", err);
      const msg =
        err.response?.data?.error ||
        err.message ||
        "Failed to fetch crops";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrops();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://127.0.0.1:5000/crops/${id}`, {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : undefined,
      });
      setCrops(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      console.error("Error deleting crop:", err);
      alert(
        err.response?.data?.error ||
        "Failed to delete crop"
      );
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;
  if (error)
    return (
      <p className="p-4 text-red-500">
        Error: {error}
      </p>
    );

  return (
    <div className="p-4 shadow-xl">
      <div className="flex flex-col md:flex-row items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Crop Tracker</h2>
        <button
          onClick={() => setOpenAdd(true)}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-black font-semibold px-4 py-2 rounded shadow-sm"
        >
          <FiPlus size={18} className="text-green-500" />
          Add Crop
        </button>
      </div>

      <table className="min-w-full border border-gray-300 text-sm shadow-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-3 py-2 text-left font-semibold">Type</th>
            <th className="px-3 py-2 text-left font-semibold">Variety</th>
            <th className="px-3 py-2 text-left font-semibold">Stage</th>
            <th className="px-3 py-2 text-left font-semibold">Amount</th>
            <th className="px-3 py-2 text-left font-semibold">Notes</th>
            <th className="px-3 py-2 text-left font-semibold">Address</th>
            <th className="px-3 py-2 text-left font-semibold">Lat</th>
            <th className="px-3 py-2 text-left font-semibold">Lng</th>
            <th className="px-3 py-2 text-left font-semibold">Image</th>
            <th className="px-3 py-2 text-left font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {crops.map(c => (
            <tr
              key={c.id}
              className="hover:bg-gray-50 border-b border-gray-200"
            >
              <td className="px-3 py-2">{c.crop_type}</td>
              <td className="px-3 py-2">{c.variety}</td>
              <td className="px-3 py-2">{c.growth_stage}</td>
              <td className="px-3 py-2">{c.amount_sown}</td>
              <td className="px-3 py-2">{c.extra_notes}</td>
              <td className="px-3 py-2">{c.location}</td>
              <td className="px-3 py-2">
                {c.latitude?.toFixed(5) ?? '–'}
              </td>
              <td className="px-3 py-2">
                {c.longitude?.toFixed(5) ?? '–'}
              </td>
              <td className="px-3 py-2">
                {c.crop_image ? (
                  <img
                    src={c.crop_image}
                    alt="Crop"
                    className="w-16 h-auto border shadow-sm"
                  />
                ) : 'No Image'}
              </td>
              <td className="px-3 py-2 space-x-2">
                <button
                  onClick={() => {
                    setEditCrop(c);
                    setOpenEdit(true);
                  }}
                  className="text-black hover:underline"
                >
                  <FiEdit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="text-black hover:underline"
                >
                  <FiTrash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add Crop Modal */}
      {openAdd && (
        <AddCrop
          open={openAdd}
          setOpen={setOpenAdd}
          onCropAdded={fetchCrops}
        />
      )}

      {/* Edit Crop Modal */}
      {openEdit && editCrop && (
        <EditCrop
          open={openEdit}
          setOpen={setOpenEdit}
          cropId={editCrop.id}
          initialData={{
            crop_type:    editCrop.crop_type,
            variety:      editCrop.variety,
            growth_stage: editCrop.growth_stage,
            amount_sown:  editCrop.amount_sown,
            extra_notes:  editCrop.extra_notes,
            location:     editCrop.location || '',
            latitude:     editCrop.latitude  ?? 0,
            longitude:    editCrop.longitude ?? 0,
            crop_image:   editCrop.crop_image || '',
          }}
          onCropEdited={fetchCrops}
        />
      )}
    </div>
  );
};

export default CropTable;
