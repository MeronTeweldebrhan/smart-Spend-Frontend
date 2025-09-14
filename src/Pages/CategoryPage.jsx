import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CategoryTable from "../components/Inventory/CategoryTable.jsx";
import { useAuth } from "../Context/useAuth.js";

export default function CategoriesPage() {
  const { activeAccountId } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();

  const handleNewCategory = () => {
    navigate("/category/new");
  };

  const handleEditCategory = (category) => {
    navigate(`/category/${category._id}`);
  };

  return (
    <div className="max-w-5xl mx-auto mt-20 px-4 sm:px-6 lg:px-8 ">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-900">Categories</h1>
        {activeAccountId && (
          <button
            onClick={handleNewCategory}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
          >
            New Category
          </button>
        )}
      </div>

      {activeAccountId && (
        <CategoryTable
          refreshKey={refreshKey}
          onEditCategory={handleEditCategory}
        />
      )}
    </div>
  );
}