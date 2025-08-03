import { useState, useEffect } from "react";
import backendClient from "../Clients/backendClient.js";
import { useAuth } from "../Context/useAuth.js";
import { useNavigate } from "react-router-dom";

const SettingsPage = () => {
  const { user, activeAccountId, switchAccount } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const navigate = useNavigate();

  // Fetch accounts owned or shared with user===///
  const fetchAccounts = async () => {
    try {
      const response = await backendClient.get("/accounts");
      setAccounts(response.data);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      alert("Failed to load accounts. Please try again.");
    }
  };
 
  useEffect(() => {
    if (user) fetchAccounts();
  }, [user]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 p-4">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {!activeAccountId && (
        <>
          <h1 className="text-center">Welcome, {user?.username}!</h1>
          <h2 className="text-xl text-center text-red-600 font-semibold">
            Please select an account to continue
          </h2>
        </>
      )}
      
       <button
        onClick={() => navigate("/account/new")}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded  mb-10"
      >
        Create Account
      </button>
      <div>
        <h2 className="text-xl font-semibold mb-2"> Accounts</h2>
        {accounts.length === 0 ? (
          <p>No accounts yet.</p>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow w-150">
            <table className="w-150 divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                    Name
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                    Type
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                    Owner
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {accounts.map((acc) => (
                  <tr key={acc._id} className="hover:bg-gray-50">
                    <td className="px-2 py-1 font-medium">{acc.name}</td>
                    <td className="px-2 py-2 capitalize">{acc.type}</td>
                    <td className="px-2 py-2">
                      {acc.owner?.username || "Loading..."}
                    </td>
                    <td className="px-2 py-2 flex gap-2 flex-wrap">
                      <button
                        onClick={() => switchAccount(acc._id, acc.name)}
                        className="text-white bg-green-600 px-2 py-1 rounded hover:bg-green-700 text-sm"
                      >
                        Select
                      </button>
                     
                      <button
                        onClick={() => navigate(`/account/${acc._id}`)}
                        className="text-blue-600 hover:underline text-sm"
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
