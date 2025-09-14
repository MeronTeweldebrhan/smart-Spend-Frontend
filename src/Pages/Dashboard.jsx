import { useAuth } from "../Context/useAuth";
import { useEffect, useState } from "react";
import backendClient from "../Clients/backendClient";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Dashboard = () => {
  const { activeAccountId } = useAuth();
  const [journalEntries, setJournalEntries] = useState([]);
  const [topIncomeCategories, setTopIncomeCategories] = useState([]);
  const [topExpenseCategories, setTopExpenseCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!activeAccountId) {
        setJournalEntries([]);
        return;
      }

      try {
        const jeRes = await backendClient.get("/journalentry", {
          params: { limit: 3, accountId: activeAccountId },
        });

        // Ensure jeRes.data is an array
        if (!Array.isArray(jeRes.data)) {
          console.error("Expected an array, received:", jeRes.data);
          toast.error("Invalid data format from server. Please try again.");
          setJournalEntries([]);
          return;
        }

        setJournalEntries(jeRes.data);

        // Calculate top Income categories (Revenue accounts)
        const incomeTotals = {};
        jeRes.data.forEach((je) => {
          je.lines.forEach((line) => {
            if (line.account?.type === "Revenue") {
              const name = line.account?.name || "Uncategorized";
              incomeTotals[name] = (incomeTotals[name] || 0) + (line.credit || 0);
            }
          });
        });
        const sortedIncome = Object.entries(incomeTotals)
          .map(([name, total]) => ({ name, total }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 9);
        setTopIncomeCategories(sortedIncome);

        // Calculate top Expense categories (Expense accounts)
        const expenseTotals = {};
        jeRes.data.forEach((je) => {
          je.lines.forEach((line) => {
            if (line.account?.type === "Expense") {
              const name = line.account?.name || "Uncategorized";
              expenseTotals[name] = (incomeTotals[name] || 0) + (line.debit || 0);
            }
          });
        });
        const sortedExpense = Object.entries(expenseTotals)
          .map(([name, total]) => ({ name, total }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 9);
        setTopExpenseCategories(sortedExpense);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        toast.error("Failed to load dashboard data. Please try again.");
        setJournalEntries([]);
      }
    };

    fetchData();
  }, [activeAccountId]);

  // Get the 3 most recent journal entries
  const recentJournalEntries = Array.isArray(journalEntries)
    ? journalEntries.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3)
    : [];

  // Handlers for buttons
  const handleCreateJournalEntry = () => {
    navigate("/journalentry");
  };
  const handleCategoryBtn = () => {
    navigate("/category");
  };
  const handleReports = () => {
    navigate("/reports");
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 p-4">
      <div className="relative z-10 max-w-6xl mx-auto">
        <h1 className="font-semibold text-lg text-center p-4 rounded">
          Dashboard
        </h1>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-4 shadow rounded-xl">
            <h2 className="text-lg font-semibold mb-2 text-center">
              Income Categories
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topIncomeCategories}>
                <XAxis dataKey="name" angle={-10} textAnchor="end" interval={0} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-4 shadow rounded-xl">
            <h2 className="text-lg font-semibold mb-2 text-center">
              Expense Categories
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topExpenseCategories}>
                <XAxis dataKey="name" angle={-10} textAnchor="end" interval={0} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="red" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Shortcut buttons */}
        <div className="flex space-x-2 mb-6">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 hover:scale-105 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200 transform"
            onClick={handleCreateJournalEntry}
          >
            ➕ Add Journal Entry
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 hover:scale-105 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200 transform"
            onClick={handleReports}
          >
            Go To Reports
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 hover:scale-105 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200 transform"
            onClick={handleCategoryBtn}
          >
            Category Management
          </button>
        </div>

        {/* Recent Journal Entries Table */}
        <div className="bg-white shadow rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-2">Recent Journal Entries</h2>
          <div className="overflow-y-auto max-h-[300px] border rounded">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Description</th>
                  <th className="px-4 py-2 text-left">Accounts</th>
                  <th className="px-4 py-2 text-left">Debit</th>
                  <th className="px-4 py-2 text-left">Credit</th>
                  <th className="p-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentJournalEntries.length > 0 ? (
                  recentJournalEntries.map((je) => (
                    <tr key={je._id} className="border-t">
                      <td className="px-4 py-2">
                        {new Date(je.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2">{je.description || "No description"}</td>
                      <td className="px-4 py-2">
                        {je.lines
                          .map((line) => line.account?.name || "Unknown")
                          .join(", ")}
                      </td>
                      <td className="px-4 py-2 font-semibold text-green-600">
                        $
                        {je.lines
                          .reduce((sum, line) => sum + (line.debit || 0), 0)
                          .toFixed(2)}
                      </td>
                      <td className="px-4 py-2 font-semibold text-red-500">
                        $
                        {je.lines
                          .reduce((sum, line) => sum + (line.credit || 0), 0)
                          .toFixed(2)}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => navigate(`/journalentry/${je._id}`)}
                          className="text-blue-600 hover:underline"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-4 py-2 text-center text-gray-400"
                    >
                      No recent journal entries found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;