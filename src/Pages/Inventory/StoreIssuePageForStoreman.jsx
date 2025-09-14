import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import backendClient from "../../Clients/backendClient.js";
import { useAuth } from "../../Context/useAuth.js";

export default function StoreIssuePageForStoreman() {
  const { activeAccountId, user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    requisitionId: "",
    departmentId: "",
    lines: [],
    notes: "",
  });
  const [requisitions, setRequisitions] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch approved requisitions for the account
        const reqRes = await backendClient.get("/api/store-requisitions", {
          params: { accountId: activeAccountId, status: "APPROVED" },
        });
        setRequisitions(Array.isArray(reqRes.data) ? reqRes.data : []);

        // Fetch existing issues for the account
        const issueRes = await backendClient.get("/api/store-issues", {
          params: { accountId: activeAccountId },
        });
        setIssues(Array.isArray(issueRes.data) ? issueRes.data : []);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.response?.data?.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    if (activeAccountId) {
      fetchData();
    }
  }, [activeAccountId]);

  const handleReqSelect = async (reqId) => {
    try {
      setLoading(true);
      setError("");
      const res = await backendClient.get(`/api/store-requisitions/${reqId}`);
      if (res.data) {
        setFormData({
          requisitionId: reqId,
          departmentId: res.data.department._id,
          lines: res.data.lines.map((line) => ({
            itemId: line.item._id,
            itemName: line.item.name,
            qty: line.qty,
            unitCost: line.item.avgCost || 0,
            reqId: reqId,
            availableQty: line.item.onHandQty || 0,
          })),
          notes: "",
        });
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to fetch requisition details");
    } finally {
      setLoading(false);
    }
  };

  const updateLine = (index, field, value) => {
    const newLines = [...formData.lines];
    newLines[index][field] = value;
    setFormData((prev) => ({ ...prev, lines: newLines }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      // Validate quantities against available stock
      for (const line of formData.lines) {
        if (Number(line.qty) > Number(line.availableQty)) {
          throw new Error(`Insufficient stock for ${line.itemName}: requested ${line.qty}, available ${line.availableQty}`);
        }
        if (Number(line.qty) < 0 || Number(line.unitCost) < 0) {
          throw new Error("Quantity and unit cost must be non-negative");
        }
      }

      const payload = {
        account: activeAccountId,
        department: formData.departmentId,
        requisition: formData.requisitionId,
        lines: formData.lines.map((line) => ({
          item: line.itemId,
          qty: Number(line.qty),
          unitCost: Number(line.unitCost),
          reqId: line.reqId,
        })),
        notes: formData.notes,
        createdBy: user._id,
        status: "ISSUED",
      };

      await backendClient.post("/api/store-issues", payload);
      await backendClient.patch(`/api/store-requisitions/${formData.requisitionId}`, {
        status: "CLOSED",
      });
      navigate("/store-issues/storeman");
      setFormData({ requisitionId: "", departmentId: "", lines: [], notes: "" });
      // Refresh issues
      const issueRes = await backendClient.get("/api/store-issues", {
        params: { accountId: activeAccountId },
      });
      setIssues(Array.isArray(issueRes.data) ? issueRes.data : []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Failed to create issue");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-6xl mx-auto mt-20">
      <h2 className="text-2xl font-bold mb-4">Store Manager - Create Issues</h2>

      {/* Create Issue Form */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Create New Issue</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Select Approved Requisition</label>
            <select
              value={formData.requisitionId}
              onChange={(e) => handleReqSelect(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select Requisition</option>
              {requisitions.length > 0 ? (
                requisitions.map((req) => (
                  <option key={req._id} value={req._id}>
                    {req.reqNumber} - {req.department.name} - {new Date(req.reqDate).toLocaleDateString()}
                  </option>
                ))
              ) : (
                <option disabled>No approved requisitions available</option>
              )}
            </select>
          </div>
          {formData.lines.length > 0 && (
            <>
              <div className="mb-4">
                <h4 className="text-md font-medium mb-2">Items</h4>
                {formData.lines.map((line, index) => (
                  <div key={index} className="flex items-center gap-4 mb-2">
                    <span className="w-1/3 text-sm">{line.itemName} (Stock: {line.availableQty})</span>
                    <input
                      type="number"
                      value={line.qty}
                      onChange={(e) => updateLine(index, "qty", e.target.value)}
                      placeholder="Quantity"
                      className="w-1/6 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      min="0"
                    />
                    <input
                      type="number"
                      value={line.unitCost}
                      onChange={(e) => updateLine(index, "unitCost", e.target.value)}
                      placeholder="Unit Cost"
                      className="w-1/6 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                    />
                  </div>
                ))}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows="4"
                  placeholder="Enter notes"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  disabled={loading || !formData.requisitionId}
                >
                  Submit Issue
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/departments")}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </form>
      </div>

      {/* Existing Issues Table */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Existing Issues</h3>
        {issues.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requisition</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {issues.map((issue) => (
                  <tr key={issue._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{issue.issueNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{issue.department?.name || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(issue.issueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{issue.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {issue.requisition?.reqNumber || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <ul className="list-disc list-inside">
                        {issue.lines.map((line, idx) => (
                          <li key={idx}>
                            {line.item?.name || "Unknown"}: {line.qty} @ ${line.unitCost.toFixed(2)}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{issue.notes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-600">No issues found for this account.</p>
        )}
      </div>
    </div>
  );
}