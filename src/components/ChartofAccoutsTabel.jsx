import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import backendClient from "../Clients/backendClient.js";
import { useAuth } from "../Context/useAuth.js";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";

export default function ChartOfAccountTable({ refreshKey }) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { activeAccountId } = useAuth();

  useEffect(() => {
    const fetchAccounts = async () => {
      if (!activeAccountId) {
        setError("No active account selected.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const res = await backendClient.get("/chartofaccounts", {
          params: { accountId: activeAccountId },
        });
        const accountsData = Array.isArray(res.data) ? res.data : [];
        console.log("Fetched accounts:", accountsData); // Debug log
        setAccounts(accountsData);
      } catch (err) {
        console.error("Error fetching accounts:", err);
        setError("Failed to load accounts.");
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, [activeAccountId, refreshKey]);

  if (loading) {
    return <CardContent>Loading...</CardContent>;
  }

  if (error) {
    return <CardContent className="text-red-600">{error}</CardContent>;
  }

  return (
    <CardContent>
      <h2 className="text-xl font-semibold mb-4">Chart of Accounts</h2>
      {accounts.length === 0 ? (
        <p className="text-gray-600">No accounts found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead><tr className="bg-gray-50 text-gray-600 uppercase text-sm tracking-wider"><th className="border-b px-4 py-3 text-left">Date</th><th className="border-b px-4 py-3 text-left">Code</th><th className="border-b px-4 py-3 text-left">REFJOno</th><th className="border-b px-4 py-3 text-left">Name</th><th className="border-b px-4 py-3 text-left">Type</th><th className="border-b px-4 py-3 text-left">Subtype</th><th className="border-b px-4 py-3 text-left">Balance</th><th className="border-b px-4 py-3 text-left">Actions</th></tr></thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account._id} className="hover:bg-gray-50 transition-colors"><td className="border-b px-4 py-3">{account.date ? new Date(account.date).toLocaleDateString() : '-'}</td><td className="border-b px-4 py-3">{account.code || '-'}</td><td className="border-b px-4 py-3">{account.refJOno || '-'}</td><td className="border-b px-4 py-3">{account.name}</td><td className="border-b px-4 py-3">{account.type}</td><td className="border-b px-4 py-3">{account.subtype?.name || '-'}</td><td className="border-b px-4 py-3">{account.balance?.toFixed(2) || '0.00'}</td><td className="border-b px-4 py-3"><Link to={`/chartofaccounts/${account._id}`}><Button variant="outline" size="sm">Edit</Button></Link></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </CardContent>
  );
}