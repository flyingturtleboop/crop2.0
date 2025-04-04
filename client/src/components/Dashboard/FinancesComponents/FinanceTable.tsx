// FinanceTable.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiEdit, FiTrash2, FiSearch, FiPlus } from "react-icons/fi";
import AddFinance from "./AddFinance";
import EditFinance from "./EditFinance";

interface Finance {
  id: string;
  amount: number;
  currency: string;
  status: string;
  notes: string;
  total: number;
  timestamp: string;
}

const FinanceTable: React.FC = () => {
  const [finances, setFinances] = useState<Finance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openAdd, setOpenAdd] = useState<boolean>(false);
  const [openEdit, setOpenEdit] = useState<boolean>(false);
  const [editFinance, setEditFinance] = useState<Finance | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 15;

  const fetchFinances = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://127.0.0.1:5000/finances", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setFinances(response.data);
      setLoading(false);
    } catch (err: any) {
      console.error("Error fetching finances:", err);
      setError("Failed to fetch finances");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinances();
  }, []);

  // Reset pagination when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://127.0.0.1:5000/finances/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setFinances((prev) => prev.filter((finance) => finance.id !== id));
    } catch (err) {
      console.error("Error deleting finance record:", err);
      alert("Failed to delete finance record");
    }
  };

  const handleEditClick = (finance: Finance) => {
    setEditFinance(finance);
    setOpenEdit(true);
  };

  // Filter finances based on search term (case-insensitive)
  const filteredFinances = finances.filter((finance) =>
    finance.currency.toLowerCase().includes(searchTerm.toLowerCase()) ||
    finance.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    finance.notes.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredFinances.length / itemsPerPage);
  const paginatedFinances = filteredFinances.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="p-4 shadow-xl relative">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-2">
        <h2 className="text-2xl font-bold text-gray-700">Finance Tracker</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpenAdd(true)}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-black font-semibold py-2 px-4 rounded shadow-sm"
          >
            <FiPlus size={18} />
            <span>Add Finance</span>
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
                Date
              </th>
              <th className="px-4 py-3 font-medium text-gray-600 text-sm uppercase">
                Amount
              </th>
              <th className="px-4 py-3 font-medium text-gray-600 text-sm uppercase">
                Currency
              </th>
              <th className="px-4 py-3 font-medium text-gray-600 text-sm uppercase">
                Status
              </th>
              <th className="px-4 py-3 font-medium text-gray-600 text-sm uppercase">
                Notes
              </th>
              <th className="px-4 py-3 font-medium text-gray-600 text-sm uppercase">
                Total
              </th>
              <th className="px-4 py-3 font-medium text-gray-600 text-sm uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {paginatedFinances.map((finance) => (
              <tr key={finance.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  {new Date(finance.timestamp).toLocaleString()}
                </td>
                <td className="px-4 py-3">{finance.amount}</td>
                <td className="px-4 py-3">{finance.currency}</td>
                <td className="px-4 py-3">{finance.status}</td>
                <td className="px-4 py-3">{finance.notes}</td>
                <td className="px-4 py-3">{finance.total}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditClick(finance)}
                      className="text-blue-500 hover:text-blue-700 shadow-sm"
                    >
                      <FiEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(finance.id)}
                      className="text-red-500 hover:text-red-700 shadow-sm"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {paginatedFinances.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500">
                  No finance records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between mt-4 text-sm text-gray-500">
        <div>
          Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
          {Math.min(currentPage * itemsPerPage, filteredFinances.length)} of{" "}
          {filteredFinances.length} entries
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

      {/* Render the Add Finance modal */}
      {openAdd && (
        <AddFinance open={openAdd} setOpen={setOpenAdd} onFinanceAdded={fetchFinances} />
      )}

      {/* Render the Edit Finance modal */}
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
          }}
          onFinanceEdited={fetchFinances}
        />
      )}
    </div>
  );
};

export default FinanceTable;
