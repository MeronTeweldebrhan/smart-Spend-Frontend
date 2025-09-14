// ItemForm.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import backendClient from "../../Clients/backendClient.js";
import { useAuth } from "../../Context/useAuth.js";

export default function ItemForm({ onItemAction, initialItem }) {
  const [formData, setFormData] = useState(
    initialItem || {
      name: "",
      sku: "",
      uom: "EA",
      category: "",
      description: "",
      barcode: "",
      costPrice: "",
      sellingPrice: "",
      minQty: "",
      reorderQty: "",
    }
  );
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const { activeAccountId } = useAuth();
  const navigate = useNavigate();

  // Debug: activeAccountId
  useEffect(() => {
    console.log("ItemForm: activeAccountId", activeAccountId);
    if (!activeAccountId) {
      setError("No active account selected. Please select an account.");
    }
  }, [activeAccountId]);

  // Fetch all categories
  useEffect(() => {
    const fetchCategories = async () => {
      if (!activeAccountId) return;
      try {
        const res = await backendClient.get(
          `/store/categories?account=${activeAccountId}`
        );
        console.log("ItemForm: Categories fetched", res.data);

        setCategories(res.data);

        if (res.data.length === 0) {
          setError("No categories available. Please create categories first.");
        }
      } catch (err) {
        console.error("ItemForm: Failed to fetch categories", err.response?.data || err);
        setError(err.response?.data?.message || "Failed to load categories.");
      }
    };
    fetchCategories();
  }, [activeAccountId]);

  // Update formData if initialItem changes (for edit mode)
  useEffect(() => {
    if (initialItem) {
      setFormData({
        name: initialItem.name || "",
        sku: initialItem.sku || "",
        uom: initialItem.uom || "EA",
        category: initialItem.category?._id || "",
        description: initialItem.description || "",
        barcode: initialItem.barcode || "",
        costPrice: initialItem.costPrice || "",
        sellingPrice: initialItem.sellingPrice || "",
        minQty: initialItem.minQty || "",
        reorderQty: initialItem.reorderQty || "",
      });
    }
  }, [initialItem]);

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

    if (!formData.name || !formData.uom || !formData.category || !activeAccountId) {
      setError("Name, unit of measure, category, and an active account are required.");
      return;
    }

    try {
      const payload = {
        ...formData,
        accountId: activeAccountId,
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : 0,
        sellingPrice: formData.sellingPrice ? parseFloat(formData.sellingPrice) : 0,
        minQty: formData.minQty ? parseInt(formData.minQty, 10) : 0,
        reorderQty: formData.reorderQty ? parseInt(formData.reorderQty, 10) : 0,
      };

      let response;
      if (initialItem) {
        response = await backendClient.put(`/store/items/${initialItem._id}`, payload);
        console.log("ItemForm: Item updated successfully", response.data);
      } else {
        response = await backendClient.post("/store/items", payload);
        console.log("ItemForm: Item created successfully", response.data);
      }

      // Reset form only for create; for update, keep as is or navigate
      if (!initialItem) {
        setFormData({
          name: "",
          sku: "",
          uom: "EA",
          category: "",
          description: "",
          barcode: "",
          costPrice: "",
          sellingPrice: "",
          minQty: "",
          reorderQty: "",
        });
      }

      onItemAction();
    } catch (err) {
      console.error(`ItemForm: Failed to ${initialItem ? 'update' : 'create'} item`, err.response?.data || err);
      setError(err.response?.data?.message || `Failed to ${initialItem ? 'update' : 'create'} item.`);
    }
  };

  return (
    <div>
      {error && <p className="text-red-600 font-medium bg-red-50 p-4 rounded-md mb-6">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Item Name</label>
          <input
            type="text"
            name="name"
            placeholder="Item Name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">SKU</label>
          <input
            type="text"
            name="sku"
            placeholder="SKU"
            value={formData.sku}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Unit of Measure</label>
          <select
            name="uom"
            value={formData.uom}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="EA">Each (EA)</option>
            <option value="KG">Kilogram (KG)</option>
            <option value="LT">Liter (LT)</option>
            <option value="M">Meter (M)</option>
            <option value="BOX">Box (BOX)</option>
            <option value="PACK">Pack (PACK)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Barcode</label>
          <input
            type="text"
            name="barcode"
            placeholder="Barcode"
            value={formData.barcode}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Cost Price</label>
          <input
            type="number"
            name="costPrice"
            placeholder="Cost Price"
            value={formData.costPrice}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Selling Price</label>
          <input
            type="number"
            name="sellingPrice"
            placeholder="Selling Price"
            value={formData.sellingPrice}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Minimum Quantity</label>
          <input
            type="number"
            name="minQty"
            placeholder="Minimum Quantity"
            value={formData.minQty}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Reorder Quantity</label>
          <input
            type="number"
            name="reorderQty"
            placeholder="Reorder Quantity"
            value={formData.reorderQty}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
            min="0"
          />
        </div>
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/item")}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {initialItem ? 'Update Item' : 'Save Item'}
          </button>
        </div>
      </form>
    </div>
  );
}