import { useEffect, useState } from "react";
import backendClient from "../Clients/backendClient.js";
import { useAuth } from "../Context/useAuth.js";
import { useNavigate } from "react-router-dom";
export default function ChartofAccountTable() {
  const [accounts, setAccounts] = useState([]);
  const { activeAccountId } = useAuth(); 
const navigate = useNavigate();
  useEffect(() => {
    const fetchAccounts = async () => {
      if (!activeAccountId) {
        
        setAccounts([]); 
        return;
      }
      try {
        const res = await backendClient.get(
          `/chartofaccounts?accountId=${activeAccountId}`
        );
        setAccounts(res.data);
      } catch (error) {
        console.error("Failed to fetch accounts", error);
      }
    };

    fetchAccounts();
  }, [activeAccountId]); 

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Chart of Accounts</h2>
      <table className="w-350 border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Code No</th>
            <th className="border px-2 py-1">Name</th>
            <th className="border px-2 py-1">Type</th>
            <th className="border px-2 py-1">Description</th>
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((acc) => (
            <tr key={acc._id}>
              <td className="border px-2 py-1">{acc.code}</td>
              <td className="border px-2 py-1">{acc.name}</td>
              <td className="border px-2 py-1">{acc.type}</td>
              <td className="border px-2 py-1">{acc.description}</td>
              <td className="border px-2 py-1">
                  <button
                    onClick={() => navigate(`/chartofaccounts/${acc._id}`)}
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </button>
                </td>
            </tr>
          ))}
          {accounts.length === 0 && (
            <tr>
              <td colSpan="4" className="border px-2 py-1 text-center text-gray-500">
                No accounts found for the selected account.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}