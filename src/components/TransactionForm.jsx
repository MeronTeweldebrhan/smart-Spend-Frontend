import { useState, useEffect } from "react";
import backendClient from "../Clients/backendClient.js";
import { useAuth } from "../Context/useAuth.js";

function TransactionForm() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [transaction, setTransaction] = useState({
    amount: "",
    type: "", // Assuming you have a type field, e.g., 'income' or 'expense'
    date: "",
    category: "",
    description: "",
  });

  ///==fetch catgeregoreis if already creted===///
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

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTransaction((prevTransaction) => ({
      ...prevTransaction,
      [name]: value,
    }));
  };
  //// Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !user._id) {
      alert("User not found or not logged in.");
      return;
    }
    try {
      const payload = {
        ...transaction,
        userId: user._id,
      };

      console.log("Submitting payload:", payload);

      await backendClient.post("/transaction", payload);

      alert("Transaction submitted successfully.");
    } catch (error) {
      console.error(
        "Error submitting transaction:",
        error.response?.data || error.message
      );
      alert("Failed to submit transaction. Please try again.");
    }
  };
  return (
    <div className="max-w-md mx-auto mt-6 p-4 border rounded-lg shadow">
      <button
        onClick={() => setShowForm((prev) => !prev)}
        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition mb-4"
      >
        {showForm ? "Cancel" : "Create Transaction"}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="amount"
            type="number"
            onChange={handleChange}
            placeholder="Amount"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />

          <select
            name="type"
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          >
            <option value="">Select type</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <input
            name="date"
            type="date"
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <select
            name="category"
            value={transaction.category}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
          >
            <option value="">-- Select category --</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.name}>
                {cat.name}
              </option>
            ))}
            <option value="__new">+ Create new category</option>
          </select>

          {transaction.category === "__new" && (
            <input
              type="text"
              name="category"
              placeholder="Enter new category name"
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md mt-2"
            />
          )}
          <input
            name="description"
            type="text"
            onChange={handleChange}
            placeholder="Description"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Save Transaction
          </button>
        </form>
      )}
    </div>
  );
}

export default TransactionForm;
