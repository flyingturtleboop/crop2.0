// src/components/FinanceTable.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiEdit, FiTrash2, FiSearch, FiPlus } from "react-icons/fi";
import AddFinance from "./AddFinance";
import EditFinance from "./EditFinance";
import Modal from "./Modal";

export interface Finance {
  id: string;
  amount: number;
  currency: string;
  status: string;
  notes: string;
  total: number;
  timestamp: string;
  receipt_image?: string;
}

const FinanceTable: React.FC = () => {
  const [finances, setFinances] = useState<Finance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editFinance, setEditFinance] = useState<Finance | null>(null);
  const [viewModal, setViewModal] = useState(false);
  const [viewImage, setViewImage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const fetchFinances = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get<Finance[]>("http://127.0.0.1:5000/finances", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setFinances(res.data);
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch finances");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinances();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://127.0.0.1:5000/finances/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setFinances(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete finance record");
    }
  };

  const handleEditClick = (f: Finance) => {
    setEditFinance(f);
    setOpenEdit(true);
  };

  const handleImageClick = (img: string) => {
    setViewImage(img);
    setViewModal(true);
  };

  const filtered = finances.filter(f =>
    f.currency.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.notes.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const pageItems = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="p-4 shadow-xl">
      <div className="flex flex-col md:flex-row items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Finance Tracker</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpenAdd(true)}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-black font-semibold px-4 py-2 rounded shadow-sm"
          >
            <FiPlus size={18} className="text-green-500" />
            Add Finance
          </button>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded shadow-sm"
            />
          </div>
        </div>
      </div>

      <table className="min-w-full border border-gray-300 text-sm shadow-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-3 py-2 text-left font-semibold">Date</th>
            <th className="px-3 py-2 text-left font-semibold">Amount</th>
            <th className="px-3 py-2 text-left font-semibold">Currency</th>
            <th className="px-3 py-2 text-left font-semibold">Status</th>
            <th className="px-3 py-2 text-left font-semibold">Notes</th>
            <th className="px-3 py-2 text-left font-semibold">Total</th>
            <th className="px-3 py-2 text-left font-semibold">Receipt</th>
            <th className="px-3 py-2 text-left font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {pageItems.map(f => (
            <tr key={f.id} className="hover:bg-gray-50 border-b border-gray-200">
              <td className="px-3 py-2">
                {new Date(f.timestamp + "Z").toLocaleString()}
              </td>
              <td className="px-3 py-2">{f.amount}</td>
              <td className="px-3 py-2">{f.currency}</td>
              <td className="px-3 py-2">{f.status}</td>
              <td className="px-3 py-2">{f.notes}</td>
              <td className="px-3 py-2">{f.total}</td>
              <td className="px-3 py-2">
                {f.receipt_image ? (
                  <img
                    src={f.receipt_image}
                    alt="Receipt"
                    className="w-16 h-auto border rounded cursor-pointer"
                    onClick={() => handleImageClick(f.receipt_image!)}
                  />
                ) : (
                  "No Image"
                )}
              </td>
              <td className="px-3 py-2 space-x-2">
                <button
                  onClick={() => handleEditClick(f)}
                  className="text-blue-500 hover:underline shadow-sm p-1 rounded"
                >
                  <FiEdit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(f.id)}
                  className="text-red-500 hover:underline shadow-sm p-1 rounded"
                >
                  <FiTrash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
          {pageItems.length === 0 && (
            <tr>
              <td colSpan={8} className="text-center py-4 text-gray-500">
                No finance records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="flex flex-col md:flex-row items-center justify-between mt-4 text-sm text-gray-500">
        <div>
          Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
          {Math.min(currentPage * itemsPerPage, filtered.length)} of{" "}
          {filtered.length} entries
        </div>
        <div className="flex items-center gap-2 mt-2 md:mt-0">
          <button
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded hover:bg-gray-100 shadow-sm"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
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
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded hover:bg-gray-100 shadow-sm"
          >
            Next
          </button>
        </div>
      </div>

      {openAdd && (
        <AddFinance
          open={openAdd}
          setOpen={setOpenAdd}
          onFinanceAdded={fetchFinances}
        />
      )}
      {openEdit && editFinance && (
        <EditFinance
          open={openEdit}
          setOpen={setOpenEdit}
          financeId={editFinance.id}
          initialData={{
            amount: editFinance.amount,
            currency: editFinance.currency,
            status: editFinance.status,
            notes: editFinance.notes,
            receipt_image: editFinance.receipt_image,
          }}
          onFinanceEdited={fetchFinances}
        />
      )}
      {viewModal && viewImage && (
        <Modal show={viewModal} onClose={() => setViewModal(false)} size="lg">
          <div className="p-4 text-center">
            <img
              src={viewImage}
              alt="Full Receipt"
              className="max-w-full h-auto shadow-sm"
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default FinanceTable;
