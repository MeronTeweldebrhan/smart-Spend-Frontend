import { useEffect, useState } from 'react';
import backendClient from '../Clients/backendClient';
import { useAuth } from '../Context/useAuth';

function CategoryPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);

  ///== Fetch categories on mount ===///
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await backendClient.get('/category');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        alert('Failed to load categories. Please try again.');
      }
    };
    fetchCategories();
  }, [user]);

  //== Handle search functionality (optional) ===///
  
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Category Management</h1>
<div className="mb-4">
        <input
          type="text"
          placeholder="Search categories..."
        //   value={searchTerm}
        //   onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/2 p-2 mb-4 border rounded"
        />
      </div>
      {categories.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border rounded-lg shadow">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Created Date</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{category.name}</td>
                  <td className="px-4 py-3 text-gray-700">{category.description || 'N/A'}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(category.createdAt).toLocaleDateString()}
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
