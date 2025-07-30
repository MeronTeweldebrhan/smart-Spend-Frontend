// src/Pages/TransactionDetailsPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import backendClient from "../Clients/backendClient";
import { useAuth } from "../Context/useAuth";

function TransactionDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tx, setTx] = useState(null);
  const [editing, setEditing] = useState(false);
  const [categories, setCategories] = useState([]);

  const fetchTx = async () => {
    try {
      const res = await backendClient.get(`/transaction/${id}`);
      setTx(res.data);
    } catch (err) {
      console.error("Error loading transaction", err);
    }
  };

  useEffect(() => {
    fetchTx();
  }, [id]);

  ///==Handle delete===///
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this?")) return;
    await backendClient.delete(`/transaction/${id}`);
    navigate("/reports");
  };
  ///==Handle update===///
  const handleUpdate = async (e) => {
    e.preventDefault();
    const updated = await backendClient.put(`/transaction/${id}`, tx);
    setTx(updated.data);
    setEditing(false);
  };
  //==Fetchi catgegories to edit drop down===///
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
  if (!tx) return <p>Loading...</p>;

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Transaction Details</h2>

      {!editing ? (
        <>
          <p>
            <strong>Amount:</strong> ${tx.amount}
          </p>
          <p>
            <strong>Type:</strong> {tx.type}
          </p>
          <p>
            <strong>Date:</strong> {new Date(tx.date).toLocaleDateString()}
          </p>
          <p>
            <strong>Category:</strong> {tx.category?.name}
          </p>
          <p>
            <strong>Description:</strong> {tx.description}
          </p>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Delete
            </button>
            <button
              onClick={() => window.print()}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Export
            </button>
            {/* Share can be a future feature (e.g., copy link, email) */}
          </div>
        </>
      ) : (
        <form onSubmit={handleUpdate} className="space-y-3">
          <input
            name="amount"
            type="number"
            value={tx.amount}
            onChange={(e) => setTx({ ...tx, amount: e.target.value })}
            className="w-full border p-2"
            placeholder="Amount"
          />
          <select
            name="type"
            value={tx.type}
            onChange={(e) => setTx({ ...tx, type: e.target.value })}
            className="w-full border p-2"
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <input
            name="date"
            type="date"
            value={tx.date ? tx.date.split("T")[0] : ""}
            onChange={(e) => setTx({ ...tx, date: e.target.value })}
            className="w-full border p-2"
            placeholder="Date"
          />
          <select
            name="category"
            value={tx.category?._id || ""}
            onChange={(e) =>
              setTx({ ...tx, category: { _id: e.target.value } })
            }
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
            name="description"
            type="text"
            value={tx.description}
            onChange={(e) => setTx({ ...tx, description: e.target.value })}
            className="w-full border p-2"
            placeholder="Description"
          />
          {/* Add dropdowns if needed */}
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="border px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default TransactionDetailsPage;
