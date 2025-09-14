import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import backendClient from "../../Clients/backendClient.js";
import { useAuth } from "../../Context/useAuth.js";

export default function StoreIssuePage() {
  const { activeAccountId, user } = useAuth();
  const { departmentId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    requisitionId: "",
    lines: [],
    notes: "",
  });
  const [requisitions, setRequisitions] = useState([]);
  const [issues, setIssues] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    reqNumber: "",
    issueNumber: "",
    department: "",
    date: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch approved requisitions
        const reqRes = await backendClient.get("/api/store-requisitions", {
          params: { accountId: activeAccountId, departmentId, status: "APPROVED" },
        });
        setRequisitions(Array.isArray(reqRes.data) ? reqRes.data : []);

        // Fetch existing issues
        const issueRes = await backendClient.get("/api/store-issues", {
          params: { accountId: activeAccountId, departmentId },
        });
        setIssues(Array.isArray(issueRes.data) ? issueRes.data : []);

        // Fetch departments
        const deptRes = await backendClient.get("/api/departments", {
          params: { accountId: activeAccountId },
        });
        setDepartments(Array.isArray(deptRes.data) ? deptRes.data : []);
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

  const handleReqSelect = async (reqId) => {
    setFormData((prev) => ({ ...prev, requisitionId: reqId, lines: [] }));
    try {
      setLoading(true);
      const res = await backendClient.get(`/api/store-requisitions/${reqId}`);
      if (res.data) {
        setFormData((prev) => ({
          ...prev,
          lines: res.data.lines.map((line) => ({
            itemId: line.item._id,
            itemName: line.item.name,
            qty: line.qty,
            unitCost: line.item.avgCost || 0,
          })),
        }));
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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.requisitionId) {
      setError("Please select a requisition");
      return;
    }
    if (!formData.lines.every((line) => line.itemId && line.qty > 0 && line.unitCost >= 0)) {
      setError("All lines must have a valid item, quantity, and unit cost");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const payload = {
        account: activeAccountId,
        department: departmentId,
        requisition: formData.requisitionId,
        lines: formData.lines.map((line) => ({
          item: line.itemId,
          qty: Number(line.qty),
          unitCost: Number(line.unitCost),
          reqId: formData.requisitionId,
        })),
        notes: formData.notes,
        createdBy: user._id,
        status: "PENDING_LEVEL_1",
      };
      await backendClient.post("/api/store-issues", payload);
      await backendClient.patch(`/api/store-requisitions/${formData.requisitionId}`, {
        status: "CLOSED",
      });
      navigate("/departments");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to create issue");
    } finally {
      setLoading(false);
    }
  };

  // Filter issues based on user input
  const filteredIssues = issues.filter((issue) => {
    const matchesReqNumber = filters.reqNumber
      ? issue.requisition?.reqNumber?.toLowerCase().includes(filters.reqNumber.toLowerCase())
      : true;
    const matchesIssueNumber = filters.issueNumber
      ? issue.issueNumber.toLowerCase().includes(filters.issueNumber.toLowerCase())
      : true;
    const matchesDepartment = filters.department
      ? issue.department?._id === filters.department
      : true;
    const matchesDate = filters.date
      ? new Date(issue.issueDate).toISOString().split("T")[0] === filters.date
      : true;
    return matchesReqNumber && matchesIssueNumber && matchesDepartment && matchesDate;
  });

  if (loading) return <p className="p-6 text-gray-600 text-lg">Loading...</p>;
  if (error) return <p className="p-6 text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</p>;

  return (
    <div className="max-w-7xl mx-auto mt-10 px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-semibold text-gray-900 mb-6">
        Store Issues for {state?.deptName || "Department"}
      </h2>

      {/* Create Issue Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Create New Issue</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Requisition</label>
            <select
              value={formData.requisitionId}
              onChange={(e) => handleReqSelect(e.target.value)}
              className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Select Requisition</option>
              {requisitions.length > 0 ? (
                requisitions.map((req) => (
                  <option key={req._id} value={req._id}>
                    {req.reqNumber} - {new Date(req.reqDate).toLocaleDateString()}
                  </option>
                ))
              ) : (
                <option disabled>No approved requisitions available</option>
              )}
            </select>
          </div>
          {formData.lines.length > 0 && (
            <>
              <div className="mb-5">
                <h4 className="text-lg font-medium text-gray-700 mb-3">Items</h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Item Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unit Cost
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Cost
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {formData.lines.map((line, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{line.itemName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            <input
                              type="number"
                              value={line.qty}
                              onChange={(e) => updateLine(index, "qty", e.target.value)}
                              placeholder="Quantity"
                              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              min="0"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            <input
                              type="number"
                              value={line.unitCost}
                              onChange={(e) => updateLine(index, "unitCost", e.target.value)}
                              placeholder="Unit Cost"
                              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {line.qty && line.unitCost ? `$${(line.qty * line.unitCost).toFixed(2)}` : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
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
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="px-5 py-2 bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
                  disabled={loading || !formData.requisitionId}
                >
                  Submit Issue
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/departments")}
                  className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </form>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Filter Issues</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Requisition Number</label>
            <input
              type="text"
              name="reqNumber"
              value={filters.reqNumber}
              onChange={handleFilterChange}
              placeholder="Enter requisition number"
              className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Issue Number</label>
            <input
              type="text"
              name="issueNumber"
              value={filters.issueNumber}
              onChange={handleFilterChange}
              placeholder="Enter issue number"
              className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              name="department"
              value={filters.department}
              onChange={handleFilterChange}
              className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
            <input
              type="date"
              name="date"
              value={filters.date}
              onChange={handleFilterChange}
              className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Existing Issues Table */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Existing Issues</h3>
        {filteredIssues.length > 0 ? (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issue Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requisition
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredIssues.map((issue) => (
                  <tr key={issue._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{issue.issueNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(issue.issueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{issue.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {issue.requisition?.reqNumber || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {issue.department?.name || "-"}
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
          <p className="text-sm text-gray-600">No issues match the selected filters.</p>
        )}
      </div>
    </div>
  );
}