import { useState, useEffect } from "react";
import backendClient from "../Clients/backendClient.js";
import { useAuth } from "../Context/useAuth.js";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
const SettingsPage = () => {
  const { user, activeAccountId, switchAccount } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const navigate = useNavigate();

  const fetchAccounts = async () => {
    try {
      const response = await backendClient.get("/accounts");
      setAccounts(response.data);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      toast.error("Failed to load accounts. Please try again.");
    }
  };

  useEffect(() => {
    if (user) fetchAccounts();
  }, [user]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 p-6">
      <h1 className="text-3xl font-bold text-blue-800 mb-8">Settings</h1>

      {!activeAccountId && (
        <div className="mb-8 text-center">
          <h2 className="text-xl font-semibold text-gray-700">Welcome, {user?.username}!</h2>
          <p className="text-red-600 font-medium mt-2">Please select an account to continue.</p>
        </div>
      )}

      <div className="mb-10">
        <button
          onClick={() => navigate("/account/new")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow"
        >
          + Create Account
        </button>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Accounts</h2>
        {accounts.length === 0 ? (
          <p className="text-gray-600">No accounts yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow border border-gray-200 bg-white">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-700">Name</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Type</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Owner</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {accounts.map((acc) => (
                  <tr key={acc._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-2 font-medium text-gray-900">{acc.name}</td>
                    <td className="px-4 py-2 capitalize text-gray-700">{acc.type}</td>
                    <td className="px-4 py-2 text-gray-700">
                      {acc.owner?.username || "Loading..."}
                    </td>
                    <td className="px-4 py-2 flex flex-wrap gap-2">
                      <button
                        onClick={() => switchAccount(acc._id, acc.name)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs shadow"
                      >
                        Select
                      </button>
                      <button
                        onClick={() => navigate(`/account/${acc._id}`)}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
