import { useState, useEffect } from "react";
import backendClient from "../Clients/backendClient.js";
import { useAuth } from "../Context/useAuth.js";
import { useNavigate } from "react-router-dom";

const SettingsPage = () => {
  const { user, activeAccountId, switchAccount } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [newAccount, setNewAccount] = useState({ name: "", type: "personal" });
  const [editingAccountId, setEditingAccountId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", type: "" });
  const navigate = useNavigate();

  // Fetch accounts owned or shared with user
  const fetchAccounts = async () => {
    try {
      const response = await backendClient.get("/accounts");
      setAccounts(response.data);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      alert("Failed to load accounts. Please try again.");
    }
  };
  ///===Create Account====///
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await backendClient.post("/accounts", newAccount);
      const created = response.data;
      setAccounts((prev) => [...prev, created]);
      setNewAccount({ name: "", type: "personal" });
      // switchAccount(created._id); // Auto-switch to new account
    } catch (error) {
      console.error("Error creating account:", error);
      alert("Failed to create account. Please try again.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAccount((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDelete = async (accountId) => {
    try {
      await backendClient.delete(`/accounts/${accountId}`);
      setAccounts(accounts.filter((acc) => acc._id !== accountId));
      if (accountId === activeAccountId) {
        switchAccount(null); // Clear active if deleted
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete account. Please try again.");
    }
  };
  const handleEditClick = (account) => {
    setEditingAccountId(account._id);
    setEditForm({ name: account.name, type: account.type });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (accountId) => {
    try {
      await backendClient.put(`/accounts/${accountId}`, editForm);
      setEditingAccountId(null);
      fetchAccounts(); // Refresh accounts list
    } catch (error) {
      console.error("Error updating account:", error);
      alert("Failed to update account. Please try again.");
    }
  };

  const handleCancelEdit = () => {
    setEditingAccountId(null);
  };
  useEffect(() => {
    if (user) fetchAccounts();
  }, [user]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 p-4">
      <h1 className="text-center">Welcome, {user?.username}!</h1>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <h2 className="text-xl font-semibold mb-4">
        Active Account:{" "}
        {accounts.find((a) => a._id === activeAccountId)?.name ||
          "None Selected"}
      </h2>

      {/* Create Account Form */}
      <form
        onSubmit={handleCreate}
        className="mb-6 bg-gray-100 p-4 w-200 rounded shadow"
      >
        <h2 className="text-xl font-semibold mb-2">Create New Account</h2>
        <div className="flex gap-4 flex-wrap">
          <div className="w-full sm:w-1/2">
            <input
              name="name"
              type="text"
              placeholder="Account Name"
              value={newAccount.name}
              onChange={handleInputChange}
              className="border px-3 py-2 rounded w-full"
              required
            />
          </div>

          <div className="w-full sm:w-1/2">
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Account Type
            </label>
            <select
              name="type"
              id="type"
              value={newAccount.type}
              onChange={handleInputChange}
              className="border px-3 py-2 rounded w-full"
            >
              <option value="personal">Personal</option>
              <option value="family">Family</option>
              <option value="group">Group</option>
            </select>
          </div>

          <div className="w-full">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Create
            </button>
          </div>
        </div>
      </form>

      {/* Account List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Your Accounts</h2>
        {accounts.length === 0 && <p>No accounts yet.</p>}
        {accounts.map((acc) => (
          <div
            key={acc._id}
            className="border p-4 rounded w-120 mb-3 bg-white shadow-sm"
          >
            {editingAccountId === acc._id ? (
              <div>
                <input
                  name="name"
                  type="text"
                  value={editForm.name}
                  onChange={handleEditChange}
                  className="border px-3 py-2 rounded w-full mb-2"
                />
                <select
                  name="type"
                  value={editForm.type}
                  onChange={handleEditChange}
                  className="border px-3 py-2 rounded w-full mb-2"
                >
                  <option value="personal">Personal</option>
                  <option value="family">Family</option>
                  <option value="group">Group</option>
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdate(acc._id)}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold">{acc.name}</p>
                  <p className="text-sm text-gray-500">Type: {acc.type}</p>
                  <p className="text-sm text-gray-500">
                    Owner: {acc.owner?.username || "Laoding.."}
                  </p>
                </div>
                <div className="flex gap-4 items-center">
                  <button
                    onClick={() => switchAccount(acc._id, acc.name)}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    Switch
                  </button>
                  <button
                    onClick={() => handleEditClick(acc)}
                    className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(acc._id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => navigate(`/account/${acc._id}`)}
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsPage;
