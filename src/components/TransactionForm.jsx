import { useState, useEffect } from "react";
import backendClient from "../Clients/backendClient.js";
import { useAuth } from "../Context/useAuth.js";

function TransactionForm() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([
    { amount: "", type: "", date: "", category: "", description: "" },
  ]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await backendClient.get("/category");
        setCategories(response.data);
      } catch (error) {
        console.error("Failed to fetch categories:", error.message);
      }
    };
    if (user) fetchCategories();
  }, [user]);

  // Handle changes per row
  const handleChange = (index, e) => {
    const { name, value } = e.target;
    setTransactions((prev) => {
      const updated = [...prev];
      updated[index][name] = value;
      return updated;
    });
  };

  // Add another empty row
  const addTransactionRow = () => {
    setTransactions((prev) => [
      ...prev,
      { amount: "", type: "", date: "", category: "", description: "" },
    ]);
  };

  // Submit all transactions
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !user._id) {
      alert("User not found or not logged in.");
      return;
    }

    try {
      const payload = transactions.map((t) => ({ ...t, userId: user._id }));
      console.log("Submitting payload:", payload);

      for (const tx of payload) {
        await backendClient.post("/transaction", tx);
      }

      alert("All transactions submitted successfully.");
      setTransactions([
        { amount: "", type: "", date: "", category: "", description: "" },
      ]);
    } catch (error) {
      console.error("Error submitting transactions:", error);
      alert("Failed to submit. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-6 p-4 border rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Add Transactions</h2>
      <form onSubmit={handleSubmit}>
        <table className="w-full table-auto border-collapse mb-4">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2 border">Amount</th>
              <th className="p-2 border">Type</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Category</th>
              <th className="p-2 border">Description</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, index) => (
              <tr key={index} className="even:bg-gray-50">
                <td className="p-2 border">
                  <input
                    type="number"
                    name="amount"
                    value={tx.amount}
                    onChange={(e) => handleChange(index, e)}
                    className="w-full px-2 py-1 border rounded"
                    required
                  />
                </td>
                <td className="p-2 border">
                  <select
                    name="type"
                    value={tx.type}
                    onChange={(e) => handleChange(index, e)}
                    className="w-full px-2 py-1 border rounded"
                    required
                  >
                    <option value="">-- Select --</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </td>
                <td className="p-2 border">
                  <input
                    type="date"
                    name="date"
                    value={tx.date}
                    onChange={(e) => handleChange(index, e)}
                    className="w-full px-2 py-1 border rounded"
                  />
                </td>
                <td className="p-2 border">
                  <select
                    name="category"
                    value={tx.category}
                    onChange={(e) => handleChange(index, e)}
                    className="w-full px-2 py-1 border rounded"
                    
                  >
                    <option value="">-- Select --</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-2 border">
                  <input
                    type="text"
                    name="description"
                    value={tx.description}
                    onChange={(e) => handleChange(index, e)}
                    className="w-full px-2 py-1 border rounded"
                    required
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={addTransactionRow}
            className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
          >
            + Add Row
          </button>

          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Save Transactions
          </button>
        </div>
      </form>
    </div>
  );
}

export default TransactionForm;
