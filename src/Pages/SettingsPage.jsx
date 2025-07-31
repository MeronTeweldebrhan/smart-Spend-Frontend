import { useState, useEffect } from "react";
import backendClient from "../Clients/backendClient.js";
import { useAuth } from "../Context/useAuth.js";

const SettingsPage = () => {
  const { user, activeAccountId, switchAccount } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [newAccount, setNewAccount] = useState({ name: "", type: "personal" });

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

  useEffect(() => {
    if (user) fetchAccounts();
  }, [user]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <h2 className="text-xl font-semibold mb-4">
        Active Account:{" "}
        {accounts.find((a) => a._id === activeAccountId)?.name || "None Selected"}
      </h2>

      {/* Create Account Form */}
      <form onSubmit={handleCreate} className="mb-6 bg-gray-100 p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Create New Account</h2>
        <div className="flex gap-4 flex-wrap">
          <input
            name="name"
            type="text"
            placeholder="Account Name"
            value={newAccount.name}
            onChange={handleInputChange}
            className="border px-3 py-2 rounded w-full sm:w-1/2"
            required
          />
          <select
            name="type"
            value={newAccount.type}
            onChange={handleInputChange}
            className="border px-3 py-2 rounded w-full sm:w-1/2"
          >
            <option value="personal">Personal</option>
            <option value="family">Family</option>
            <option value="group">Group</option>
          </select>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create
          </button>
        </div>
      </form>

      {/* Account List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Your Accounts</h2>
        {accounts.length === 0 && <p>No accounts yet.</p>}
        {accounts.map((acc) => (
          <div
            key={acc._id}
            className="border p-4 rounded mb-3 bg-white shadow-sm"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold">{acc.name}</p>
                <p className="text-sm text-gray-500">Type: {acc.type}</p>
                <p className="text-sm text-gray-500">
                  Owner: {acc.owner?.username || "Unknown"}
                </p>
              </div>

              <div className="flex gap-4 items-center">
                <button
                  onClick={() => switchAccount(acc._id, acc.name)}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                  Switch
                </button>

                {acc.isOwner && (
                  <button
                    onClick={() => handleDelete(acc._id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsPage;
