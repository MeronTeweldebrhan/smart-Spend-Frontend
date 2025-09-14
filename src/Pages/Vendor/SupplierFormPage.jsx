import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SupplierForm from '../../components/Vendor/SupplierForm.jsx';
import { useAuth } from '../../Context/useAuth.js';

function SupplierFormPage() {
  const { activeAccountId } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [supplier, setSupplier] = useState(null);

  useEffect(() => {
    if (location.state?.supplier) {
      setSupplier(location.state.supplier);
    }
  }, [location]);

  const handleSupplierAction = () => {
    console.log(`SupplierFormPage: Supplier ${supplier ? 'updated' : 'created'}, navigating back to /suppliers`);
    navigate('/suppliers', { state: { refresh: true } });
  };

  if (!activeAccountId) {
    return (
      <div className="max-w-4xl mx-auto p-6 mt-16 bg-white rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Add Supplier</h2>
        <p className="text-red-600 font-medium bg-red-50 p-4 rounded-md">
          No active account selected. Please select an account to create suppliers.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 mt-16 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        {supplier ? 'Edit Supplier' : 'Add Supplier'}
      </h2>
      <SupplierForm 
        onSupplierAction={handleSupplierAction} 
        initialSupplier={supplier}
      />
    </div>
  );
}

export default SupplierFormPage;