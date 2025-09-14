import { useState, useEffect } from 'react';
import backendClient from '../../Clients/backendClient.js';
import { useAuth } from '../../Context/useAuth.js';

export default function CategoryForm({ onCategoryCreated, categoryToEdit }) {
  const [formData, setFormData] = useState({
    name: '',
    parentCategory: '',
    description: '',
  });
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const { activeAccountId } = useAuth();

  // Populate form for editing
  useEffect(() => {
    if (categoryToEdit) {
      setFormData({
        name: categoryToEdit.name || '',
        parentCategory: categoryToEdit.parentCategory?._id || '',
        description: categoryToEdit.description || '',
      });
    }
  }, [categoryToEdit]);

  // Fetch categories for parentCategory dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      if (!activeAccountId) return;
      try {
        const res = await backendClient.get(`/store/categories?accountId=${activeAccountId}`);
        // Exclude the category being edited from parent options
        setCategories(
          categoryToEdit
            ? res.data.filter((cat) => cat._id !== categoryToEdit._id)
            : res.data
        );
      } catch (err) {
        console.error('Failed to fetch categories', err);
      }
    };
    fetchCategories();
  }, [activeAccountId, categoryToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !activeAccountId) {
      setError('Name and an active account are required.');
      return;
    }

    try {
      if (categoryToEdit) {
        // Update existing category
        await backendClient.put(`/store/categories/${categoryToEdit._id}`, {
          ...formData,
          accountId: activeAccountId,
          parentCategory: formData.parentCategory || null,
        });
      } else {
        // Create new category
        await backendClient.post('/store/categories', {
          ...formData,
          accountId: activeAccountId,
          parentCategory: formData.parentCategory || null,
        });
      }

      // Reset form
      setFormData({
        name: '',
        parentCategory: '',
        description: '',
      });

      // Notify parent of successful creation/update
      onCategoryCreated();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save category.');
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        {categoryToEdit ? 'Edit Category' : 'Add Category'}
      </h2>
      {error && (
        <p className="text-red-600 bg-red-50 border border-red-200 rounded-md p-3 mb-6">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Category Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            placeholder="Enter category name"
            value={formData.name}
            onChange={handleChange}
            className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="parentCategory" className="block text-sm font-medium text-gray-700 mb-1">
            Parent Category
          </label>
          <select
            name="parentCategory"
            id="parentCategory"
            value={formData.parentCategory}
            onChange={handleChange}
            className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">No Parent (Top-Level)</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.parentCategory ? `${cat.parentCategory.name} > ${cat.name}` : cat.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            id="description"
            placeholder="Enter description"
            value={formData.description}
            onChange={handleChange}
            className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            rows="4"
          />
        </div>
        <div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
          >
            {categoryToEdit ? 'Update Category' : 'Add Category'}
          </button>
        </div>
      </form>
    </div>
  );
}