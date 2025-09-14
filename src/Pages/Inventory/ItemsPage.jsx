// ItemsPage.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ItemTable from "../../components/Inventory/ItemTable.jsx";
import { useAuth } from "../../Context/useAuth.js";

function ItemsPage() {
  const { activeAccountId } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Refresh table if redirected after item creation or update
  useEffect(() => {
    if (location.state?.refresh) {
      setRefreshKey((prev) => prev + 1);
      // clear state so it doesn’t keep re-triggering
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  return (
    <div className="max-w-7xl mx-auto p-6 mt-16">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Items</h1>
        {activeAccountId && (
          <button
            onClick={() => navigate("/items/new")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add New Item
          </button>
        )}
      </div>

      {activeAccountId && <ItemTable refreshKey={refreshKey} />}
    </div>
  );
}

export default ItemsPage;