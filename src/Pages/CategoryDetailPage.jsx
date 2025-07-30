// src/Pages/CategoryDetailPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import backendClient from "../Clients/backendClient";
import { useAuth } from "../Context/useAuth";

function CategoryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = id !== "new";
  const [category, setCategory] = useState({ name: "", description: "" });

  useEffect(() => {
    if (!user || !isEditing) return;

    const fetchCategory = async () => {
      try {
        const res = await backendClient.get(`/category/${id}`);
        setCategory(res.data);
      } catch (err) {
        console.error("Failed to load category:", err);
        alert("Category not found.");
        navigate("/category");
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
        await backendClient.put(`/category/${id}`, category);
        alert("Category updated");
      } else {
        await backendClient.post("/category", category);
        alert("Category created");
      }
      navigate("/category");
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save category.");
    }
  };
///===handle delete===///
const handleDelete = async () => {
  if (window.confirm("Are you sure you want to delete this category?")) {
    try {
      await backendClient.delete(`/category/${id}`);
      alert("Category deleted successfully");
      navigate('/category');
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category.");
    }
  }
};

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">{isEditing ? "Edit" : "Create"} Category</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-sm font-medium">Name</label>
          <input type="text" name="name" value={category.name} onChange={handleChange} required className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">Description</label>
          <textarea name="description" value={category.description} onChange={handleChange} rows={4} className="w-full p-2 border rounded" />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          {isEditing ? "Update" : "Create"} Category
        </button>
      </form>
      {isEditing && (
  <button
    type="button"
    onClick={handleDelete}
    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 ml-4"
  >
    Delete Category
  </button>
)}
        <button
            type="button"
            onClick={() => navigate("/category")}
            className="ml-4 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
        >
            Cancel
        </button>
    </div>
  );
}

export default CategoryDetailPage;
