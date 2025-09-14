import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import backendClient from "../../Clients/backendClient.js";
import { useAuth } from "../../Context/useAuth.js";

export default function SupplierForm({ onSupplierAction, initialSupplier }) {
  const [formData, setFormData] = useState({
    name: "",
    contactName: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });
  const [error, setError] = useState("");
  const { activeAccountId } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (initialSupplier) {
      setFormData({
        name: initialSupplier.name || "",
        contactName: initialSupplier.contactName || "",
        email: initialSupplier.email || "",
        phone: initialSupplier.phone || "",
        address: initialSupplier.address || "",
        notes: initialSupplier.notes || "",
      });
    }
  }, [initialSupplier]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !activeAccountId) {
      setError("Name and an active account are required.");
      return;
    }

    try {
      const payload = {
        accountId: activeAccountId,
        name: formData.name,
        contactName: formData.contactName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        notes: formData.notes,
      };

      let response;
      if (initialSupplier) {
        response = await backendClient.put(`/vendor/suppliers/${initialSupplier._id}`, payload);
        console.log("SupplierForm: Supplier updated successfully", response.data);
      } else {
        response = await backendClient.post("/vendor/suppliers", payload);
        console.log("SupplierForm: Supplier created successfully", response.data);
      }

      if (!initialSupplier) {
        setFormData({
          name: "",
          contactName: "",
          email: "",
          phone: "",
          address: "",
          notes: "",
        });
      }

      onSupplierAction();
    } catch (err) {
      console.error(`SupplierForm: Failed to ${initialSupplier ? 'update' : 'create'} supplier`, err.response?.data || err);
      setError(err.response?.data?.message || `Failed to ${initialSupplier ? 'update' : 'create'} supplier.`);
    }
  };

  return (
    <div>
      {error && <p className="text-red-600 font-medium bg-red-50 p-4 rounded-md mb-6">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            placeholder="Supplier Name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Contact Name</label>
          <input
            type="text"
            name="contactName"
            placeholder="Contact Name"
            value={formData.contactName}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            type="tel"
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <textarea
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            name="notes"
            placeholder="Notes"
            value={formData.notes}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/suppliers")}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {initialSupplier ? 'Update Supplier' : 'Save Supplier'}
          </button>
        </div>
      </form>
    </div>
  );
}