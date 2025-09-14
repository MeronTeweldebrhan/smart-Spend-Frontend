import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import backendClient from "../../Clients/backendClient.js";
import { useAuth } from "../../Context/useAuth.js";

export default function PurchaseOrderForm({
  onPurchaseOrderAction,
  initialPurchaseOrder,
}) {
  const [formData, setFormData] = useState({
    supplier: "",
    poDate: new Date().toISOString().split("T")[0],
    lines: [
      { item: "", description: "", qty: "", unitPrice: "", TotalPrice: "" },
    ],
    notes: "",
    status: "DRAFT",
  });
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [error, setError] = useState("");
  const { activeAccountId } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (initialPurchaseOrder) {
      setFormData({
        supplier: initialPurchaseOrder.supplier?._id || "",
        poNumber: initialPurchaseOrder.poNumber || "",
        poDate: initialPurchaseOrder.poDate
          ? new Date(initialPurchaseOrder.poDate).toISOString().split("T")[0]
          : "",
        lines: initialPurchaseOrder.lines.map((line) => ({
          item: line.item?._id || "",
          description: line.description || "",
          qty: line.qty || "",
          unitPrice: line.unitPrice || "",
          TotalPrice: line.TotalPrice || "",
          receivedQty: line.receivedQty || 0,
        })),
        notes: initialPurchaseOrder.notes || "",
        status: initialPurchaseOrder.status || "DRAFT",
      });
    } else {
      setFormData({
        supplier: "",
        poDate: new Date().toISOString().split("T")[0],
        lines: [
          { item: "", description: "", qty: "", unitPrice: "", TotalPrice: "" },
        ],
        notes: "",
        status: "DRAFT",
      });
    }
  }, [initialPurchaseOrder]);

  useEffect(() => {
    const fetchData = async () => {
      if (!activeAccountId) return;
      try {
        const [itemsRes, suppliersRes] = await Promise.all([
          backendClient.get(`/store/items?accountId=${activeAccountId}`),
          backendClient.get(`/vendor/suppliers?account=${activeAccountId}`),
        ]);
        setItems(itemsRes.data);
        setSuppliers(suppliersRes.data);
        if (itemsRes.data.length === 0) {
          setError("No items available. Please create items first.");
        }
        if (suppliersRes.data.length === 0) {
          setError("No suppliers available. Please create suppliers first.");
        }
      } catch (err) {
        console.error(
          "PurchaseOrderForm: Failed to fetch data",
          err.response?.data || err
        );
        setError(
          err.response?.data?.message || "Failed to load items or suppliers."
        );
      }
    };
    fetchData();
  }, [activeAccountId]);

  const handleChange = (e, index) => {
    const { name, value } = e.target;
    if (index !== undefined) {
      setFormData((prev) => {
        const newLines = [...prev.lines];
        newLines[index] = { ...newLines[index], [name]: value };
        // Calculate TotalPrice for the line
        if (name === "qty" || name === "unitPrice") {
          const qty = parseInt(newLines[index].qty, 10) || 0;
          const unitPrice = parseFloat(newLines[index].unitPrice) || 0;
          newLines[index].TotalPrice = (qty * unitPrice).toFixed(2);
        }
        return { ...prev, lines: newLines };
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const addLine = () => {
    setFormData((prev) => ({
      ...prev,
      lines: [
        ...prev.lines,
        { item: "", description: "", qty: "", unitPrice: "", TotalPrice: "" },
      ],
    }));
  };

  const removeLine = (index) => {
    setFormData((prev) => ({
      ...prev,
      lines: prev.lines.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.supplier || formData.lines.length === 0) {
      setError("Supplier and at least one line item are required.");
      return;
    }

    for (const line of formData.lines) {
      if (!line.item || !line.qty || !line.unitPrice) {
        setError("All line items must have an item, quantity, and unit price.");
        return;
      }
    }

    try {
      const payload = {
        accountId: activeAccountId,
        supplier: formData.supplier,
        poDate: formData.poDate,
        lines: formData.lines.map((line) => ({
          item: line.item,
          description: line.description,
          qty: parseInt(line.qty, 10),
          unitPrice: parseFloat(line.unitPrice),
          TotalPrice: parseFloat(line.TotalPrice),
          receivedQty: line.receivedQty !== undefined ? parseInt(line.receivedQty, 10) : 0,
        })),
        notes: formData.notes,
        status: formData.status,
      };

      let response;
      if (initialPurchaseOrder) {
        response = await backendClient.put(
          `/store/purchase-orders/${initialPurchaseOrder._id}`,
          { ...payload, poNumber: formData.poNumber }
        );
      } else {
        response = await backendClient.post("/store/purchase-orders", payload);
      }

      onPurchaseOrderAction();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        `Failed to ${initialPurchaseOrder ? "update" : "create"} purchase order.`
      );
    }
  };

  // Calculate total for the entire PO
  const poTotal = formData.lines
    .reduce((sum, line) => sum + parseFloat(line.TotalPrice || 0), 0)
    .toFixed(2);

  return (
    <div>
      {error && (
        <p className="text-red-600 font-medium bg-red-50 p-4 rounded-md mb-6">
          {error}
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Supplier
          </label>
          <select
            name="supplier"
            value={formData.supplier}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select Supplier</option>
            {suppliers.map((sup) => (
              <option key={sup._id} value={sup._id}>
                {sup.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            PO Number
          </label>
          <input
            type="text"
            name="poNumber"
            placeholder="(auto-generated)"
            value={formData.poNumber}
            readOnly
            className="mt-1 block w-full border border-gray-300 rounded-md p-3 bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            PO Date
          </label>
          <input
            type="date"
            name="poDate"
            value={formData.poDate}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Line Items
          </label>
          {formData.lines.map((line, index) => (
            <div
              key={index}
              className="flex flex-wrap gap-4 mb-4 p-4 border rounded-md bg-gray-50"
            >
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700">
                  Item
                </label>
                <select
                  name="item"
                  value={line.item}
                  onChange={(e) => handleChange(e, index)}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Item</option>
                  {items.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name} ({item.sku})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  placeholder="Description"
                  value={line.description}
                  onChange={(e) => handleChange(e, index)}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="w-24">
                <label className="block text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <input
                  type="number"
                  name="qty"
                  placeholder="Qty"
                  value={line.qty}
                  onChange={(e) => handleChange(e, index)}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  required
                />
              </div>
              <div className="w-24">
                <label className="block text-sm font-medium text-gray-700">
                  Unit Price
                </label>
                <input
                  type="number"
                  name="unitPrice"
                  placeholder="Price"
                  value={line.unitPrice}
                  onChange={(e) => handleChange(e, index)}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="w-24">
                <label className="block text-sm font-medium text-gray-700">
                  Total Price
                </label>
                <input
                  type="number"
                  name="TotalPrice"
                  value={line.TotalPrice}
                  readOnly
                  className="mt-1 block w-full border border-gray-300 rounded-md p-3 bg-gray-100"
                  min="0"
                  step="0.01"
                />
              </div>
              {initialPurchaseOrder && (
                <div className="w-24">
                  <label className="block text-sm font-medium text-gray-700">
                    Received Qty
                  </label>
                  <input
                    type="number"
                    name="receivedQty"
                    value={line.receivedQty}
                    readOnly
                    className="mt-1 block w-full border border-gray-300 rounded-md p-3 bg-gray-100"
                    min="0"
                  />
                </div>
              )}
              {formData.lines.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLine(index)}
                  className="mt-6 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addLine}
            className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Add Line Item
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            PO Total
          </label>
          <input
            type="number"
            value={poTotal}
            readOnly
            className="mt-1 block w-full border border-gray-300 rounded-md p-3 bg-gray-100"
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <textarea
            name="notes"
            placeholder="Notes"
            value={formData.notes}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="DRAFT">Draft</option>
            <option value="APPROVED">Approved</option>
            <option value="PARTIALLY_RECEIVED">Partially Received</option>
            <option value="RECEIVED">Received</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/purchase-orders")}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {initialPurchaseOrder
              ? "Update Purchase Order"
              : "Save Purchase Order"}
          </button>
        </div>
      </form>
    </div>
  );
}