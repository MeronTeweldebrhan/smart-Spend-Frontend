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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, activeAccountId } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [topIncomeCategories, setTopIncomeCategories] = useState([]);
  const [topExpenseCategories, setTopExpenseCategories] = useState([]);
  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"]; // Colors for PieChart
const navigate = useNavigate();
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(
          "Fetching transactions with activeAccountId:",
          activeAccountId
        );
        const txRes = await backendClient.get("/transaction", {
          params: { limit: 3, accountId: activeAccountId },
        });
        console.log(" response:", txRes.data);
        setTransactions(txRes.data);

        // Calculate top Income categories
        const incomeTotals = {};
        txRes.data
          .filter((tx) => tx.type === "income")
          .forEach((tx) => {
            const name = tx.category?.name || "Unknown";
            incomeTotals[name] = (incomeTotals[name] || 0) + tx.amount;
          });
        const sortedIncome = Object.entries(incomeTotals)
          .map(([name, total]) => ({ name, total }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 9);
        setTopIncomeCategories(sortedIncome);

        // Calculate top Expense categories
        const expenseTotals = {};
        txRes.data
          .filter((tx) => tx.type === "expense")
          .forEach((tx) => {
            const name = tx.category?.name || "Unknown";
            expenseTotals[name] = (expenseTotals[name] || 0) + tx.amount;
          });
        const sortedExpense = Object.entries(expenseTotals)
          .map(([name, total]) => ({ name, total }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 9);
        setTopExpenseCategories(sortedExpense);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        alert("Failed to load dashboard data. Please try again.");
      }
    };

    if (activeAccountId) fetchData();
  }, [activeAccountId]);

  // Get the 3 most recent transactions
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);
  return (
    <div className="relative min-h-screen bg-white p-4">
      {/* Subtle background */}
      <div
        className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]
 opacity-10 pointer-events-none z-0"
      ></div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <h1 className="text-center">Welcome, {user?.username}!</h1>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-4 shadow rounded-xl">
            <h2 className="text-lg font-semibold mb-2 text-center">
              Top 3 Income Categories
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topIncomeCategories}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-4 shadow rounded-xl">
            <h2 className="text-lg font-semibold mb-2 text-center">
              Top 3 Expense Categories
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={topExpenseCategories}
                  dataKey="total"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {topExpenseCategories.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="bg-white shadow rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-2">Recent Transactions</h2>
          <div className="overflow-y-auto max-h-[300px] border rounded">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Description</th>
                  <th className="px-4 py-2 text-left">Category</th>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((tx) => (
                    <tr key={tx._id} className="border-t">
                      <td className="px-4 py-2">
                        {new Date(tx.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2">{tx.description}</td>
                      <td className="px-4 py-2">
                        {tx.category?.name || "Unknown"}
                      </td>
                      <td className="px-4 py-2 capitalize text-gray-600">
                        {tx.type}
                      </td>
                      <td
                        className={`px-4 py-2 font-semibold ${
                          tx.type === "income"
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        ${tx.amount}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-4 py-2 text-center text-gray-400"
                    >
                      No recent transactions found.
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
