
import { useState } from "react";
import backendClient from "../Clients/backendClient.js";

const EmployeeManagement = ({ accountId, employees, fetchAccountDetails }) => {
  const [newEmployeeEmail, setNewEmployeeEmail] = useState("");
  const [addingEmployee, setAddingEmployee] = useState(false);
  const [permissionsForm, setPermissionsForm] = useState({
    transactions: false,
    invoices: false,
    reports: false,
    clients: false,
    categories: false,
    settings: false,
  });

  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [editedPermissions, setEditedPermissions] = useState({});

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setAddingEmployee(true);
    try {
      await backendClient.post(`/accounts/${accountId}/employees`, {
        email: newEmployeeEmail,
        permissions: permissionsForm,
      });
      alert("Employee added successfully!");
      setNewEmployeeEmail("");
      setPermissionsForm({
        transactions: false,
        invoices: false,
        reports: false,
        clients: false,
        categories: false,
        settings: false,
      });
      fetchAccountDetails();
    } catch (err) {
      console.error("Error adding employee:", err);
      alert(err.response?.data?.message || "Failed to add employee.");
    } finally {
      setAddingEmployee(false);
    }
  };

  const handleRemoveEmployee = async (employeeId) => {
    if (!window.confirm("Are you sure you want to remove this employee?")) return;
    try {
      await backendClient.delete(`/accounts/${accountId}/employees/${employeeId}`);
      alert("Employee removed successfully!");
      fetchAccountDetails();
    } catch (err) {
      console.error("Error removing employee:", err);
      alert("Failed to remove employee.");
    }
  };

  const handleUpdatePermissions = async () => {
    if (!editingEmployeeId) return;
    try {
      await backendClient.put(`/accounts/${accountId}/employees/${editingEmployeeId}`, {
        permissions: editedPermissions,
      });
      alert("Permissions updated!");
      fetchAccountDetails();
      setEditingEmployeeId(null);
      setEditedPermissions({});
    } catch (err) {
      console.error("Error updating permissions:", err);
      alert("Failed to update permissions.");
    }
  };

  const startEditing = (employee) => {
    setEditingEmployeeId(employee._id);
    setEditedPermissions({ ...employee.permissions });
  };

  const cancelEditing = () => {
    setEditingEmployeeId(null);
    setEditedPermissions({});
  };

  const handlePermissionChange = (key, value) => {
    setEditedPermissions((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="mt-8 p-4 bg-gray-100 rounded-lg">
      <h3 className="text-xl font-semibold mb-4">Manage Employees</h3>

      {/* Add Employee Form */}
      <form onSubmit={handleAddEmployee} className="flex flex-col gap-2 mb-6">
        <h4 className="text-lg font-medium">Add a new employee</h4>
        <input
          type="email"
          placeholder="Employee Email"
          value={newEmployeeEmail}
          onChange={(e) => setNewEmployeeEmail(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
        <div className="grid grid-cols-2 gap-2 mt-2">
          {Object.keys(permissionsForm).map((key) => (
            <label key={key} className="flex items-center">
              <input
                type="checkbox"
                name={key}
                checked={permissionsForm[key]}
                onChange={(e) =>
                  setPermissionsForm({ ...permissionsForm, [key]: e.target.checked })
                }
                className="mr-2"
              />
              <span className="capitalize">{key}</span>
            </label>
          ))}
        </div>
        <button
          type="submit"
          disabled={addingEmployee}
          className="bg-blue-600 text-white px-4 py-2 rounded mt-2"
        >
          {addingEmployee ? "Adding..." : "Add Employee"}
        </button>
      </form>

      {/* Employee List */}
      <h4 className="text-lg font-medium">Current Employees</h4>
      {employees && employees.length > 0 ? (
        <ul className="space-y-4 mt-4">
          {employees.map((employee) => (
            <li key={employee._id} className="p-4 border rounded-lg bg-white shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">
                  {employee.user?.username || employee.user?.email}
                </span>
                {editingEmployeeId === employee._id ? (
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdatePermissions}
                      className="text-green-600 hover:text-green-800 font-semibold text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="text-gray-500 hover:text-gray-700 font-semibold text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditing(employee)}
                      className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleRemoveEmployee(employee._id)}
                      className="text-red-500 hover:text-red-700 font-semibold text-sm"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-600 mb-2">Permissions:</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.keys(employee.permissions).map((key) => (
                  <div key={key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={
                        editingEmployeeId === employee._id
                          ? editedPermissions[key]
                          : employee.permissions[key]
                      }
                      onChange={(e) => handlePermissionChange(key, e.target.checked)}
                      disabled={editingEmployeeId !== employee._id}
                      className="mr-2"
                    />
                    <span className="capitalize">{key}</span>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 mt-2">No employees have been added yet.</p>
      )}
    </div>
  );
};

export default EmployeeManagement;
