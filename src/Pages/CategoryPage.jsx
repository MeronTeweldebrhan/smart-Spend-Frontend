import { useEffect, useState } from "react";
import backendClient from "../Clients/backendClient";
import { useAuth } from "../Context/useAuth";
import { useNavigate } from "react-router-dom";

function CategoryPage() {
  const { user, activeAccountId } = useAuth();
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  ///== Fetch categories on mount ===///
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await backendClient.post("/category/all", {
          accountId: activeAccountId,
        });
        
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        alert("Failed to load categories. Please try again.");
      }
    };
    fetchCategories();
  }, [user, activeAccountId]);

  //== Handle search functionality  ===///
  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 p-4">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-3xl font-bold text-gray-800">
          Category Management
        </h1>
      </div>

      <div className="mb-4 w-150">
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-white md:w-1/2 p-2 mb-4 border rounded mt-5"
        />
      </div>
      <button
        onClick={() => navigate("/category/new")}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded  mb-3 ms-310"
      >
        Create Category
      </button>
      {filteredCategories.length > 0 ? (
        <div className=" overflow-x-auto">
          <table className="min-w-350 text-sm text-left border rounded-lg shadow bg-white">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Created Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((category) => (
                <tr key={category._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {category.name}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {category.description || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(category.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate(`/category/${category._id}`)}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-8">No categories found.</p>
      )}
    </div>
  );
}

export default CategoryPage;
