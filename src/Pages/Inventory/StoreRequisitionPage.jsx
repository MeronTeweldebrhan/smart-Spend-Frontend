import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import backendClient from "../../Clients/backendClient.js";
import { useAuth } from "../../Context/useAuth.js";

export default function StoreRequisitionPage() {
  const { activeAccountId, user } = useAuth();
  const { departmentId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    lines: [{ itemId: "", qty: "", remark: "", unitCost: "" }],
    notes: "",
  });
  const [editReqId, setEditReqId] = useState("");
  const [editLines, setEditLines] = useState([{ itemId: "", qty: "", remark: "", unitCost: "" }]);
  const [requisitions, setRequisitions] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch items
        const itemRes = await backendClient.get("/store/items", {
          params: { accountId: activeAccountId },
        });
        setAvailableItems(Array.isArray(itemRes.data) ? itemRes.data : []);

        // Fetch requisitions for the department
        const reqRes = await backendClient.get("/store/store-requisitions", {
          params: { accountId: activeAccountId, departmentId },
        });
        setRequisitions(Array.isArray(reqRes.data) ? reqRes.data : []);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.response?.data?.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    if (activeAccountId && departmentId) {
      fetchData();
    }
  }, [activeAccountId, departmentId]);

  const addLine = (isEditMode = false) => {
    const setLines = isEditMode ? setEditLines : setFormData;
    setLines((prev) => ({
      ...prev,
      lines: [...prev.lines, { itemId: "", qty: "", remark: "", unitCost: "" }],
    }));
  };

  const updateLine = (index, field, value, isEditMode = false) => {
    const setLines = isEditMode ? setEditLines : setFormData;
    setLines((prev) => {
      const newLines = [...prev.lines];
      newLines[index][field] = value;
      if (field === "itemId" && !isEditMode) {
        const selectedItem = availableItems.find((item) => item._id === value);
        newLines[index].unitCost = selectedItem ? selectedItem.avgCost || "" : "";
      }
      return { ...prev, lines: newLines };
    });
  };

  const removeLine = (index, isEditMode = false) => {
    const setLines = isEditMode ? setEditLines : setFormData;
    setLines((prev) => ({
      ...prev,
      lines: prev.lines.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.lines.every(line => line.itemId && line.qty > 0 && line.unitCost >= 0)) {
      setError("All lines must have a valid item, quantity, and unit cost");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const payload = {
        account: activeAccountId,
        department: departmentId,
        lines: formData.lines.map((line) => ({
          item: line.itemId,
          qty: Number(line.qty),
          remark: line.remark,
          unitCost: Number(line.unitCost),
        })),
        notes: formData.notes,
        createdBy: user._id,
      };
      await backendClient.post("/store/store-requisitions", payload);
      navigate("/departments");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to create requisition");
    } finally {
      setLoading(false);
    }
  };

  const handleAddItemsSubmit = async (e) => {
    e.preventDefault();
    if (!editLines.every(line => line.itemId && line.qty > 0 && line.unitCost >= 0)) {
      setError("All lines must have a valid item, quantity, and unit cost");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const requisition = requisitions.find((req) => req._id === editReqId);
      if (!requisition) throw new Error("Requisition not found");
      if (requisition.status !== "DRAFT") throw new Error("Can only add items to DRAFT requisitions");

      const payload = {
        lines: [
          ...requisition.lines,
          ...editLines.map((line) => ({
            item: line.itemId,
            qty: Number(line.qty),
            remark: line.remark,
            unitCost: Number(line.unitCost),
          })),
        ],
        updatedBy: user._id,
      };
      await backendClient.patch(`/store/store-requisitions/${editReqId}`, payload);
      setEditReqId("");
      setEditLines([{ itemId: "", qty: "", remark: "", unitCost: "" }]);
      // Refresh requisitions
      const reqRes = await backendClient.get("/store/store-requisitions", {
        params: { accountId: activeAccountId, departmentId },
      });
      setRequisitions(Array.isArray(reqRes.data) ? reqRes.data : []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to add items to requisition");
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (req) => {
    setEditReqId(req._id);
    setEditLines([{ itemId: "", qty: "", remark: "", unitCost: "" }]);
  };

  const getTotalCost = (line) => {
    const qty = Number(line.qty) || 0;
    const unitCost = Number(line.unitCost) || 0;
    return (qty * unitCost).toFixed(2);
  };

  if (loading) return <p className="p-6 text-gray-600 text-lg">Loading...</p>;
  if (error) return <p className="p-6 text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</p>;

  return (
    <div className="max-w-7xl mx-auto mt-18 px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-semibold text-gray-900 mb-6">
        Store Requisitions for {state?.deptName || "Department"}
      </h2>

      {/* Create Requisition Form (Table) */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Create New Requisition</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              rows="4"
              placeholder="Enter notes"
            />
          </div>
          <div className="mb-5 max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UOM</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remark</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {formData.lines.map((line, index) => {
                  const selectedItem = availableItems.find((item) => item._id === line.itemId);
                  return (
                    <tr key={index} className="hover:bg-gray-50 transition duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {selectedItem?.sku || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <select
                          value={line.itemId}
                          onChange={(e) => updateLine(index, "itemId", e.target.value)}
                          className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                          <option value="">Select Item</option>
                          {availableItems.length > 0 ? (
                            availableItems.map((item) => (
                              <option key={item._id} value={item._id}>
                                {item.name} (SKU: {item.sku || "-"} | UOM: {item.uom || "-"} | Stock: {item.onHandQty || 0})
                              </option>
                            ))
                          ) : (
                            <option disabled>No items available</option>
                          )}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {selectedItem?.uom || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <input
                          type="number"
                          value={line.qty}
                          onChange={(e) => updateLine(index, "qty", e.target.value)}
                          placeholder="Qty"
                          className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          min="0"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <input
                          type="number"
                          value={line.unitCost}
                          onChange={(e) => updateLine(index, "unitCost", e.target.value)}
                          placeholder="Unit Cost"
                          className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {line.qty && line.unitCost ? `$${getTotalCost(line)}` : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <input
                          type="text"
                          value={line.remark}
                          onChange={(e) => updateLine(index, "remark", e.target.value)}
                          placeholder="Remark"
                          className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <button
                          type="button"
                          onClick={() => removeLine(index)}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
                          disabled={formData.lines.length === 1}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex gap-4 mb-5">
            <button
              type="button"
              onClick={() => addLine()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Add Item
            </button>
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              className="px-5 py-2 bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
              disabled={loading}
            >
              Submit Requisition
            </button>
            <button
              type="button"
              onClick={() => navigate("/departments")}
              className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Existing Requisitions Table */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Existing Requisitions</h3>
        {requisitions.length > 0 ? (
          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Req Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requisitions.map((req) => (
                  <tr key={req._id} className="hover:bg-gray-50 transition duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{req.reqNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(req.reqDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{req.status}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <ul className="list-disc list-inside">
                        {req.lines.map((line, idx) => (
                          <li key={idx}>
                            {line.item?.name || "Unknown"}: {line.qty} @ ${line.unitCost ? line.unitCost.toFixed(2) : "N/A"}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{req.notes || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {req.status === "DRAFT" && (
                        <button
                          onClick={() => startEditing(req)}
                          className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition duration-200"
                        >
                          Add Items
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-600">No requisitions found for this department.</p>
        )}
      </div>

      {/* Add Items to Existing Requisition */}
      {editReqId && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Add Items to Requisition {requisitions.find((req) => req._id === editReqId)?.reqNumber}
          </h3>
          <form onSubmit={handleAddItemsSubmit}>
            <div className="mb-5">
              <h4 className="text-lg font-medium text-gray-700 mb-3">New Items</h4>
              {editLines.map((line, index) => (
                <div key={index} className="flex items-center gap-4 mb-3">
                  <select
                    value={line.itemId}
                    onChange={(e) => updateLine(index, "itemId", e.target.value, true)}
                    className="w-2/5 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select Item</option>
                    {availableItems.length > 0 ? (
                      availableItems.map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.name} (SKU: {item.sku || "-"} | UOM: {item.uom || "-"} | Stock: {item.onHandQty || 0})
                        </option>
                      ))
                    ) : (
                      <option disabled>No items available</option>
                    )}
                  </select>
                  <input
                    type="number"
                    value={line.qty}
                    onChange={(e) => updateLine(index, "qty", e.target.value, true)}
                    placeholder="Quantity"
                    className="w-1/5 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    min="0"
                  />
                  <input
                    type="number"
                    value={line.unitCost}
                    onChange={(e) => updateLine(index, "unitCost", e.target.value, true)}
                    placeholder="Unit Cost"
                    className="w-1/5 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    min="0"
                    step="0.01"
                  />
                  <input
                    type="text"
                    value={line.remark}
                    onChange={(e) => updateLine(index, "remark", e.target.value, true)}
                    placeholder="Remark"
                    className="w-2/5 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeLine(index, true)}
                    className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
                    disabled={editLines.length === 1}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addLine(true)}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Add Item
              </button>
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="px-5 py-2 bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
                disabled={loading}
              >
                Save Items
              </button>
              <button
                type="button"
                onClick={() => setEditReqId("")}
                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}