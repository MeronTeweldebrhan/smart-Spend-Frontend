import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import backendClient from "../Clients/backendClient.js";
import { useAuth } from "../Context/useAuth.js";
import { toast } from "react-toastify";

export default function CategoryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, activeAccountId } = useAuth();
  const isEditing = id !== "new";

  const [category, setCategory] = useState({ name: "", description: "" });

  // Fetch category if editing
  useEffect(() => {
    if (!user || !isEditing) return;

    const fetchCategory = async () => {
      try {
        const res = await backendClient.get(`/store/categories/${id}`);
        setCategory(res.data);
      } catch (err) {
        console.error("Failed to load category:", err);
        toast.error("Category not found.");
        navigate("/categories");
      }
    };

    fetchCategory();
  }, [user, id, isEditing, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCategory((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await backendClient.put(`/store/categories/${id}`, category);
        toast.success("Category updated");
      } else {
        await backendClient.post("/store/categories", {
          ...category,
          account: activeAccountId,
        });
        toast.success("Category created");
      }
      navigate("/CategoriesPage");
    } catch (err) {
      console.error("Save failed:", err);
      toast.error("Failed to save category.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      await backendClient.delete(`/store/categories/${id}?account=${activeAccountId}`);
      toast.success("Category deleted successfully");
      navigate("/CategoriesPage");
    } catch (err) {
      console.error("Error deleting category:", err);
      toast.error("Failed to delete category.");
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-gradient-to-br from-blue-100 to-blue-300 p-6 rounded shadow mt-10">
      <h2 className="text-2xl font-bold mb-4">{isEditing ? "Edit" : "New"} Category</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Name</label>
          <input
            type="text"
            name="name"
            value={category.name}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            name="description"
            value={category.description}
            onChange={handleChange}
            rows={4}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="flex items-center">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            {isEditing ? "Update" : "Create"}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={handleDelete}
              className="ml-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Delete
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate("/CategoriesPage")}
            className="ml-4 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
