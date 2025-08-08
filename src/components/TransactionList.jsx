/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import backendClient from "../Clients/backendClient.js";
import { useAuth } from "../Context/useAuth.js";
import { useNavigate } from "react-router-dom";

function TransactionList() {
  const { user, activeAccountId } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    type: "",
    category: "",
    minAmount: "",
    maxAmount: "",
    startDate: "",
    endDate: "",
  });

  /// ===handle filter changes === //
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };
  // Fetch transactions for the user
  const fetchTransactions = async () => {
    if (!activeAccountId) return;
    try {
      const response = await backendClient.get("/transaction", {
        params: {
          ...filters,
          accountId: activeAccountId, // Pass active account ID for filtering
        },
      });
      setTransactions(response.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      alert("Failed to load transactions. Please try again.");
    }
  };
  ///==refetch transactions when filters change and // Debounce for 500ms ===///
  useEffect(() => {
    if (!user?._id) return;
    const timeout = setTimeout(() => {
      fetchTransactions();
    }, 500);
    return () => clearTimeout(timeout);
  }, [user, filters]);

  /// === Fetch categories for filtering === ///
  useEffect(() => {
   
    if (!user?._id || !activeAccountId) {
      return;
    }
    const fetchCategories = async () => {
    
      try {
        const response = await backendClient.post("/category/all", {
          accountId: activeAccountId,
        });
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        // alert("Failed to load categories. Please try again.");
      }
    };
    fetchCategories();
  }, [user?._id, activeAccountId]);
  return (
    <div className="bg-white p-6">
      <h3 className="text-lg font-semibold mb-3">Filters</h3>
     {/* === FILTER CONTROLS === */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <select
          name="type"
          className="border p-2 rounded w-50"
          value={filters.type}
          onChange={handleFilterChange}
        >
          <option value="">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select
          name="category"
          value={filters.category}
          onChange={handleFilterChange}
          className="border px-3 py-2 rounded w-50"
        >
          <option value="">-- Select --</option>
          {categories.length > 0 ? (
            categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))
          ) : (
            <option value="">Loading categories...</option>
          )}
        </select>

        <input
          name="minAmount"
          type="number"
          className="border p-2 rounded w-50"
          placeholder="Min Amount"
          value={filters.minAmount}
          onChange={handleFilterChange}
        />

        <input
          name="maxAmount"
          type="number"
          className="border p-2 rounded w-50"
          placeholder="Max Amount"
          value={filters.maxAmount}
          onChange={handleFilterChange}
        />

        <input
          name="startDate"
          type="date"
          className="border p-2 rounded w-50"
          value={filters.startDate}
          onChange={handleFilterChange}
        />

        <input
          name="endDate"
          type="date"
          className="border p-2 rounded w-50"
          value={filters.endDate}
          onChange={handleFilterChange}
        />
        <button
          onClick={() =>
            setFilters({
              type: "",
              category: "",
              minAmount: "",
              maxAmount: "",
              startDate: "",
              endDate: "",
            })
          }
          className="text-sm px-3 py-1 border rounded bg-gray-100 hover:bg-gray-200 w-50"
        >
          Reset Filters
        </button>
      </div>

      {/* Transaction Table */}
      <h2 className="text-2xl font-bold mb-4 ms-2.5">Transaction List</h2>
      <div className="overflow-y-auto max-h-[300px] border rounded">
        <table className="min-w-full border rounded-lg bg-white shadow-sm">
          <thead className="bg-gray-100 text-sm text-gray-600">
            <tr>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx._id} className="border-t hover:bg-gray-50 text-sm">
                <td className="p-3">
                  {new Date(tx.date).toLocaleDateString()}
                </td>
                <td className="p-3 truncate max-w-xs">{tx.description}</td>
                <td className="p-3">{tx.category?.name || "Uncategorized"}</td>
                <td className="p-3 capitalize">{tx.type}</td>
                <td className="p-3">${tx.amount}</td>
                <td className="p-3">
                  <button
                    onClick={() => navigate(`/transaction/${tx._id}`)}
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-400">
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default TransactionList;
