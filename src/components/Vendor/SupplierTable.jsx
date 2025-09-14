import { useEffect, useState } from "react";
import backendClient from "../../Clients/backendClient.js";
import { useAuth } from "../../Context/useAuth.js";
import { useNavigate } from "react-router-dom";

export default function SupplierTable({ refreshKey }) {
  const [suppliers, setSuppliers] = useState([]);
  const [error, setError] = useState("");
  const { activeAccountId } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSuppliers = async () => {
      if (!activeAccountId) {
        setSuppliers([]);
        return;
      }
      try {
        const res = await backendClient.get(
          `/vendor/suppliers?account=${activeAccountId}`
        );
        setSuppliers(res.data);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to fetch suppliers.");
      }
    };

    fetchSuppliers();
  }, [activeAccountId, refreshKey]);

  const handleDelete = async (supplierId) => {
    if (!window.confirm("Are you sure you want to delete this supplier?")) return;

    try {
      await backendClient.delete(`/vendor/suppliers/${supplierId}?accountId=${activeAccountId}`);
      setSuppliers((prev) => prev.filter((supplier) => supplier._id !== supplierId));
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete supplier.");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-gray-800">Suppliers</h2>
      {error && <p className="text-red-600 font-medium bg-red-50 p-4 rounded-md mb-4">{error}</p>}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Contact Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {suppliers.map((supplier) => (
              <tr key={supplier._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{supplier.name}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{supplier.contactName || "-"}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{supplier.email || "-"}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{supplier.phone || "-"}</td>
                <td className="px-4 py-3 text-sm">
                  <button
                    onClick={() => navigate(`/suppliers/edit/${supplier._id}`, { state: { supplier } })}
                    className="text-blue-600 hover:text-blue-800 font-medium mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(supplier._id)}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {suppliers.length === 0 && (
              <tr>
                <td colSpan="5" className="px-4 py-3 text-center text-sm text-gray-500">
                  No suppliers found for the selected account.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}