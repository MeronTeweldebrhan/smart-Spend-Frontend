import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PurchaseOrderForm from '../../components/Inventory/PurchaseOrderForm.jsx';
import { useAuth } from '../../Context/useAuth.js';

function PurchaseOrderFormPage() {
  const { activeAccountId } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [purchaseOrder, setPurchaseOrder] = useState(null);

  useEffect(() => {
    if (location.state?.purchaseOrder) {
      setPurchaseOrder(location.state.purchaseOrder);
    }
  }, [location]);

  const handlePurchaseOrderAction = () => {
    console.log(`PurchaseOrderFormPage: Purchase Order ${purchaseOrder ? 'updated' : 'created'}, navigating back to /purchase-orders`);
    navigate('/purchase-orders', { state: { refresh: true } });
  };

  if (!activeAccountId) {
    return (
      <div className="max-w-4xl mx-auto p-6 mt-16 bg-white rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Add Purchase Order</h2>
        <p className="text-red-600 font-medium bg-red-50 p-4 rounded-md">
          No active account selected. Please select an account to create purchase orders.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 mt-16 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        {purchaseOrder ? 'Edit Purchase Order' : 'Add Purchase Order'}
      </h2>
      <PurchaseOrderForm 
        onPurchaseOrderAction={handlePurchaseOrderAction} 
        initialPurchaseOrder={purchaseOrder}
      />
    </div>
  );
}

export default PurchaseOrderFormPage;