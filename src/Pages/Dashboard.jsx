import { useAuth } from "../Context/useAuth";
import { useEffect, useState } from 'react';
import backendClient from '../Clients/backendClient';
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
} from 'recharts';


const Dashboard = () => {
  const { user, } = useAuth();
const [transactions, setTransactions] = useState([]);
const [topCategories, setTopCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const txRes = await backendClient.get('/transaction?limit=50');
        setTransactions(txRes.data);

        const catTotals = {};
        txRes.data.forEach((tx) => {
          const name = tx.category?.name || 'Unknown';
          catTotals[name] = (catTotals[name] || 0) + tx.amount;
        });

        const sorted = Object.entries(catTotals)
          .map(([name, total]) => ({ name, total }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 3);

        setTopCategories(sorted);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      }
    };

    fetchData();
  }, []);
  return (
    <div className="relative min-h-screen bg-white p-4">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]
 opacity-10 pointer-events-none z-0"></div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <h1 className="text-center">Welcome, {user?.username}!</h1>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-4 shadow rounded-xl">
            <h2 className="text-lg font-semibold mb-2 text-center">Top 3 Categories</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topCategories}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Add other charts if needed */}
          <div className="bg-white p-4 shadow rounded-xl flex items-center justify-center text-gray-400">
            Add chart here
          </div>
        </div>

        {/* Transactions Table */}
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
                {transactions.map((tx) => (
                  <tr key={tx._id} className="border-t">
                    <td className="px-4 py-2">{new Date(tx.date).toLocaleDateString()}</td>
                    <td className="px-4 py-2">{tx.description}</td>
                    <td className="px-4 py-2">{tx.category?.name}</td>
                    <td className="px-4 py-2 capitalize text-gray-600">{tx.type}</td>
                    <td className={`px-4 py-2 font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                      ${tx.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

};
export default Dashboard;