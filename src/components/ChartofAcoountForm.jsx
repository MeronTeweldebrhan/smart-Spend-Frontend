import { useState } from "react";
import backendClient from "../Clients/backendClient.js";
import { useAuth } from "../Context/useAuth.js";

export default function ChartofAccountsForm() {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    // You can remove `code` from the initial state as it's no longer needed in the form
    description: "",
  });
  const { activeAccountId } = useAuth();
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.type || !activeAccountId) {
      setError("Name, type, and an active account are required.");
      return;
    }

    try {
      await backendClient.post("/chartofaccounts", {
        ...formData,
        accountId: activeAccountId,
      });

      // Reset form
      setFormData({
        name: "",
        type: "",
        description: "",
      });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to create account.");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Add Chart of Account</h2>
      {error && <p className="text-red-500">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          className="border p-2 w-full"
        />
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="border p-2 w-full"
        >
          <option value="">Select Type</option>
          <option value="Asset">Asset</option>
          <option value="Liability">Liability</option>
          <option value="Equity">Equity</option>
          <option value="Income">Income</option>
          <option value="Expense">Expense</option>
        </select>
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          className="border p-2 w-full"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Account
        </button>
      </form>
    </div>
  );
}