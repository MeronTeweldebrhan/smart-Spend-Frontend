import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import backendClient from "../../Clients/backendClient.js";
import { useAuth } from "../../Context/useAuth.js";
import { toast } from "react-toastify";

export default function EmployeeFormPage() {
  const { activeAccountId } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role: "",
    approvalLevel: 0,
  });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [error, setError] = useState("");

  const roles = ["admin", "employee", "storeman", "manager"];

  // Fetch employees
  const fetchEmployees = async () => {
    if (!activeAccountId) return;
    try {
      setLoading(true);
      const res = await backendClient.get("/employees", {
        params: { accountId: activeAccountId },
      });
      setEmployees(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.response?.data?.message || "Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [activeAccountId]);

  // Handle form input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit new employee
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      await backendClient.post("/employees", { ...formData });
      toast.success("Employee created!");
      setFormData({
        name: "",
        username: "",
        email: "",
        password: "",
        role: "",
        approvalLevel: 0,
      });
      fetchEmployees();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create employee");
    } finally {
      setLoading(false);
    }
  };

  // Edit employee inline
  const startEditing = (employee) => {
    setEditingId(employee._id);
    setEditedData({
      username: employee.username,
      email: employee.email,
      role: employee.role,
      approvalLevel: employee.approvalLevel,
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({ ...prev, [name]: value }));
  };

  const saveEdit = async (userId) => {
    try {
      await backendClient.put(`/employees/${userId}`, editedData);
      toast.success("Employee updated!");
      setEditingId(null);
      setEditedData({});
      fetchEmployees();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update employee");
    }
  };

  // Delete employee (soft delete)
  const deleteEmployee = async (userId) => {
    if (!window.confirm("Are you sure you want to deactivate this employee?"))
      return;
    try {
      await backendClient.delete(`/employees/${userId}`);
      toast.success("Employee deactivated");
      fetchEmployees();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete employee");
    }
  };

  if (loading && !employees.length)
    return <p className="p-6 text-gray-600 text-lg">Loading...</p>;
  if (error)
    return (
      <p className="p-6 text-red-600 text-lg font-medium">{error}</p>
    );

  return (
    <div className="p-8 bg-gray-50 rounded-xl shadow-lg max-w-7xl mx-auto mt-20">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Manage Employees</h2>

      {/* Create Employee Form */}
      <div className="mb-10 bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          Create New Employee
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-300 p-3"
              placeholder="Enter name"
              required
            />
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-300 p-3"
              placeholder="Enter username"
              required
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-300 p-3"
              placeholder="Enter email"
              required
            />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-300 p-3"
              placeholder="Enter password"
              required
            />
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-300 p-3"
              required
            >
              <option value="">Select Role</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
            <select
              name="approvalLevel"
              value={formData.approvalLevel}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-300 p-3"
            >
              <option value={0}>No Approval</option>
              <option value={1}>Level 1</option>
              <option value={2}>Level 2</option>
              <option value={3}>Level 3</option>
            </select>
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              disabled={loading}
            >
              Create Employee
            </button>
            <button
              type="button"
              onClick={() => navigate("/settings")}
              className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Employees Table */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          Existing Employees
        </h3>
        {employees.length > 0 ? (
          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Approval Level
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {emp.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {editingId === emp._id ? (
                        <input
                          type="text"
                          name="username"
                          value={editedData.username}
                          onChange={handleEditChange}
                          className="border rounded p-1 w-full"
                        />
                      ) : (
                        emp.username
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {editingId === emp._id ? (
                        <input
                          type="email"
                          name="email"
                          value={editedData.email}
                          onChange={handleEditChange}
                          className="border rounded p-1 w-full"
                        />
                      ) : (
                        emp.email
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {editingId === emp._id ? (
                        <select
                          name="role"
                          value={editedData.role}
                          onChange={handleEditChange}
                          className="border rounded p-1 w-full"
                        >
                          {roles.map((role) => (
                            <option key={role} value={role}>
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </option>
                          ))}
                        </select>
                      ) : (
                        emp.role
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {editingId === emp._id ? (
                        <select
                          name="approvalLevel"
                          value={editedData.approvalLevel}
                          onChange={handleEditChange}
                          className="border rounded p-1 w-full"
                        >
                          <option value={0}>No Approval</option>
                          <option value={1}>Level 1</option>
                          <option value={2}>Level 2</option>
                          <option value={3}>Level 3</option>
                        </select>
                      ) : (
                        emp.approvalLevel
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      {editingId === emp._id ? (
                        <>
                          <button
                            onClick={() => saveEdit(emp._id)}
                            className="text-green-600 hover:underline mr-3"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-gray-500 hover:underline"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEditing(emp)}
                            className="text-blue-600 hover:underline mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteEmployee(emp._id)}
                            className="text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-600">
            No employees found for this account.
          </p>
        )}
      </div>
    </div>
  );
}
