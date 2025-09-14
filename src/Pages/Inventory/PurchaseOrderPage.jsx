import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PurchaseOrderTable from "../../components/Inventory/PurchaseOrderTable.jsx";
import { useAuth } from "../../Context/useAuth.js";

function PurchaseOrdersPage() {
  const { activeAccountId } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.refresh) {
      setRefreshKey((prev) => prev + 1);
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  return (
    <div className="max-w-7xl mx-auto p-6 mt-16">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Purchase Orders</h1>
        {activeAccountId && (
          <button
            onClick={() => navigate("/purchase-orders/new")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add New Purchase Order
          </button>
        )}
      </div>

      {activeAccountId ? (
        <PurchaseOrderTable refreshKey={refreshKey} />
      ) : (
        <p className="text-red-600 font-medium bg-red-50 p-4 rounded-md">
          No active account selected. Please select an account to view purchase orders.
        </p>
      )}
    </div>
  );
}

export default PurchaseOrdersPage;