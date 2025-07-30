import { useEffect, useState } from "react";
import backendClient from "../Clients/backendClient.js";
import { useAuth } from "../Context/useAuth.js";
import { useNavigate } from "react-router-dom";

function TransactionList() {
  const { user } = useAuth();
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
    try {
      const response = await backendClient.get("/transaction", {
        params: filters,
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
    const fetchCategories = async () => {
      try {
        const response = await backendClient.get("/category");
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        alert("Failed to load categories. Please try again.");
      }
    };

    fetchCategories();
  }, [user]);
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Transaction List</h2>

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
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
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
      <div className="overflow-x-auto">
        <table className="min-w-full border rounded-lg bg-white shadow-sm">
          <thead className="bg-gray-100 text-sm text-gray-600">
            <tr>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx._id} className="border-t hover:bg-gray-50 text-sm">
                <td className="p-3">
                  {new Date(tx.date).toLocaleDateString()}
                </td>
                <td className="p-3 capitalize">{tx.type}</td>
                <td className="p-3">{tx.category?.name || "Uncategorized"}</td>
                <td className="p-3">${tx.amount}</td>
                <td className="p-3 truncate max-w-xs">{tx.description}</td>
                <td className="p-3">
                  <button
                    onClick={() => navigate(`/transactions/${tx._id}`)}
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

      {/* {selectedTx && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <h3 className="text-lg font-semibold mb-2">Transaction Details</h3>
          <p><strong>Amount:</strong> ${selectedTx.amount}</p>
          <p><strong>Type:</strong> {selectedTx.type}</p>
          <p><strong>Date:</strong> {new Date(selectedTx.date).toLocaleDateString()}</p>
          <p><strong>Category:</strong> {selectedTx.category?.name || "Uncategorized"}</p>
          <p><strong>Description:</strong> {selectedTx.description}</p>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => handleDelete(selectedTx._id)}
              className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete
            </button>
            <button
              onClick={() => setSelectedTx(null)}
              className="px-4 py-1 border rounded hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      )} */}
    </div>
  );
}
export default TransactionList;
