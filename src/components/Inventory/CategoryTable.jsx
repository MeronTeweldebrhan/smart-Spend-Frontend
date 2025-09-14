import { useEffect, useState } from "react";
import backendClient from "../../Clients/backendClient.js";
import { useAuth } from "../../Context/useAuth.js";
import { useNavigate } from "react-router-dom";

export default function CategoryTable({ refreshKey, onEditCategory }) {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const { activeAccountId } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      if (!activeAccountId) return;

      try {
        const res = await backendClient.get(
          `/store/categories?account=${activeAccountId}`
        );
        setCategories(res.data);
      } catch (err) {
        console.error("Failed to fetch categories", err);
        setError(err.response?.data?.error || "Failed to fetch categories.");
      }
    };

    fetchCategories();
  }, [activeAccountId, refreshKey]);

  const handleDelete = async (categoryId) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      await backendClient.delete(`/store/categories/${categoryId}?account=${activeAccountId}`);
      setCategories(categories.filter((cat) => cat._id !== categoryId));
    } catch (err) {
      console.error("Failed to delete category", err);
      setError(err.response?.data?.error || "Failed to delete category.");
    }
  };

  return (
    <div className="mt-6">
      {error && (
        <p className="text-red-600 bg-red-50 border border-red-200 rounded-md p-3 mb-6">
          {error}
        </p>
      )}
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Parent Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.length > 0 ? (
              categories.map((cat) => (
                <tr key={cat._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cat.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cat.parentCategory?.name || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {cat.description || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => onEditCategory(cat)}
                      className="text-blue-600 hover:text-blue-800 mr-4 transition-colors duration-200"
                    >
                      View
                    </button>
                    <button
                      onClick={() => onEditCategory(cat)}
                      className="text-green-600 hover:text-green-800 mr-4 transition-colors duration-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cat._id)}
                      className="text-red-600 hover:text-red-800 transition-colors duration-200"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No categories found for the selected account.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}