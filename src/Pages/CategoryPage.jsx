import { useEffect, useState } from 'react';
import backendClient from '../Clients/backendClient'; 
import { useAuth } from '../Context/useAuth'; 


function CategoryPage() {
    const { user } = useAuth();
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await backendClient.get('/category');
                setCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
                alert('Failed to load categories. Please try again.');
            }
        }
        fetchCategories();
    }, [user]);

  return (
    <div>
      <h1>Category Page</h1>
      {categories.length > 0 ? (
        <ul>    
            {categories.map((category) => (
            <li key={category._id} className="p-4 border mb-2 rounded-md">
              <h2 className="text-lg font-semibold">{category.name}</h2>
              <p>{category.description}</p>
            </li>
          ))  }      
          </ul>
          ) : (
            <p>No categories found.</p>
          ) 
          }
    </div>
  );
}

export default CategoryPage;