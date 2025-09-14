// ItemTable.jsx
import { useEffect, useState } from "react";
import backendClient from "../../Clients/backendClient.js";
import { useAuth } from "../../Context/useAuth.js";
import { useNavigate } from "react-router-dom";

export default function ItemTable({ refreshKey }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const { activeAccountId } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItems = async () => {
      if (!activeAccountId) {
        setItems([]);
        return;
      }
      try {
        const res = await backendClient.get(
          `/store/items?accountId=${activeAccountId}`
        );
        setItems(res.data);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to fetch items.");
      }
    };

    fetchItems();
  }, [activeAccountId, refreshKey]);

  const handleDelete = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      await backendClient.delete(`/store/items/${itemId}?accountId=${activeAccountId}`);
      setItems((prev) => prev.filter((item) => item._id !== itemId));
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete item.");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-gray-800">Items</h2>
      {error && <p className="text-red-600 font-medium bg-red-50 p-4 rounded-md mb-4">{error}</p>}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">SKU</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">UOM</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Cost Price</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Selling Price</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {items.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{item.sku || "-"}</td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {item.category?.parentCategory?.name
                    ? `${item.category.parentCategory.name} > ${item.category.name}`
                    : item.category?.name || "-"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{item.uom}</td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {item.costPrice != null ? item.costPrice.toFixed(2) : "0.00"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {item.sellingPrice != null ? item.sellingPrice.toFixed(2) : "0.00"}
                </td>
                <td className="px-4 py-3 text-sm">
                  <button
                    onClick={() => navigate(`/items/edit/${item._id}`, { state: { item } })}
                    className="text-blue-600 hover:text-blue-800 font-medium mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan="7" className="px-4 py-3 text-center text-sm text-gray-500">
                  No items found for the selected account.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}