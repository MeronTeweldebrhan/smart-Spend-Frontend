// ItemFormPage.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ItemForm from '../../components/Inventory/ItemForm.jsx';
import { useAuth } from '../../Context/useAuth.js';

function ItemFormPage() {
  const { activeAccountId } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [item, setItem] = useState(null);

  useEffect(() => {
    // Check if we're editing an existing item
    if (location.state?.item) {
      setItem(location.state.item);
    }
  }, [location]);

  const handleItemAction = () => {
    console.log(`ItemFormPage: Item ${item ? 'updated' : 'created'}, navigating back to /items`);
    navigate('/item', { state: { refresh: true } });
  };

  if (!activeAccountId) {
    return (
      <div className="max-w-4xl mx-auto p-6 mt-16 bg-white rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Add Item</h2>
        <p className="text-red-600 font-medium bg-red-50 p-4 rounded-md">
          No active account selected. Please select an account to create items.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 mt-16 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        {item ? 'Edit Item' : 'Add Item'}
      </h2>
      <ItemForm 
        onItemAction={handleItemAction} 
        initialItem={item}
      />
    </div>
  );
}

export default ItemFormPage;