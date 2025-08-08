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
  const [transactions, setTransactions] = useState([]);
  const [topIncomeCategories, setTopIncomeCategories] = useState([]);
  const [topExpenseCategories, setTopExpenseCategories] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const txRes = await backendClient.get("/transaction", {
          params: { limit: 3, accountId: activeAccountId },
        });
        setTransactions(txRes.data);

        //===Calculate top Income categories===//
        const incomeTotals = {};
        txRes.data
          .filter((tx) => tx.type === "income")
          .forEach((tx) => {
            const name = tx?.category?.name || "Uncategorized";
            incomeTotals[name] = (incomeTotals[name] || 0) + tx.amount;
          });
        const sortedIncome = Object.entries(incomeTotals)
          .map(([name, total]) => ({ name, total }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 9);
        setTopIncomeCategories(sortedIncome);

        //====Calculate top Expense categories===////
        const expenseTotals = {};
        txRes.data
          .filter((tx) => tx.type === "expense")
          .forEach((tx) => {
            const name = tx?.category?.name || "Uncategorized";
            expenseTotals[name] = (expenseTotals[name] || 0) + tx.amount;
          });
        const sortedExpense = Object.entries(expenseTotals)
          .map(([name, total]) => ({ name, total }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 9);
        setTopExpenseCategories(sortedExpense);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        toast.error("Failed to load dashboard data. Please try again.");
      }
    };

    if (activeAccountId) fetchData();
  }, [activeAccountId,navigate]);

  //==Get the 3 most recent transactions==//
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);

  //==Handler for button click==//
  const handleCreateTransaction = () => {
    navigate("/transaction");
  };
  const handleCategorybtn = () => {
    navigate("/category");
  };
  const handleReports = () => {
    navigate("/reports");
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 p-4">
      <div className="relative z-10 max-w-6xl mx-auto">
        <h1 className="font-semibold text-lg  text-center p-4 rounded ">
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
        <div className="ms-50">
          {/* Short cut buttons */}
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded ms-10 hover:bg-blue-700 hover:scale-105 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200 transform"
            onClick={handleCreateTransaction}
          >
            ➕Add Transaction
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 ms-10 rounded hover:bg-blue-700 hover:scale-105 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200 transform"
            onClick={handleReports}
          >
            Go To Reports
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded ms-10 mb-2.5 hover:bg-blue-700 hover:scale-105 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200 transform"
            onClick={handleCategorybtn}
          >
            Category Management
          </button>
        </div>
        {/* Tabel  */}
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
                  <th className="p-3 text-left">Action</th>
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
                        {tx.category?.name || "Uncategorized"}
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
                      <td className="p-3">
                        <button
                          onClick={() => navigate(`/transaction/${tx._id}`)}
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
