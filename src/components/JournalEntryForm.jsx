import { useState } from "react";
import backendClient from "../Clients/backendClient.js";
import { useAuth } from "../Context/useAuth.js";
import { toast } from "react-toastify";

function JournalEntryForm({ chartAccounts, loadingAccounts, onSuccess }) {
  const { activeAccountId } = useAuth();

  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [lines, setLines] = useState([
    { account: "", type: "debit", amount: "" },
  ]);
  //===Handle changes per line and field==//
  const handleChange = (index, e) => {
    const { name, value } = e.target;
    setLines((prev) => {
      const updated = [...prev];
      updated[index][name] = value;
      return updated;
    });
  };

  // Add new empty line
  const addLine = () => {
    setLines((prev) => [...prev, { account: "", type: "debit", amount: "" }]);
  };

  // Remove last line
  const removeLastLine = () => {
    setLines((prev) => prev.slice(0, -1));
  };

  // Submit handler
  const handleSubmit = async (e) => {
  e.preventDefault();

  if (lines.length < 2) {
    toast.error("At least two lines (accounts) are required.");
    return;
  }

  // Validate that there's exactly one debit and one credit
  const debitLines = lines.filter((line) => line.type === "debit");
  const creditLines = lines.filter((line) => line.type === "credit");

  if (debitLines.length !== 1 || creditLines.length !== 1) {
    toast.error("Exactly one debit line and one credit line are required.");
    return;
  }

  // Validate amounts are numbers and > 0
  for (const line of lines) {
    if (!line.account) {
      toast.error("Please select an account for all lines.");
      return;
    }
    if (!line.amount || parseFloat(line.amount) <= 0) {
      toast.error("Amounts must be positive numbers.");
      return;
    }
  }

  // Check debit amount equals credit amount
  const debitAmount = parseFloat(debitLines[0].amount);
  const creditAmount = parseFloat(creditLines[0].amount);

  if (debitAmount !== creditAmount) {
    toast.error("Debit and Credit amounts must be equal.");
    return;
  }

  try {
    const payload = {
      date,
      description,
      accountId: activeAccountId,
      lines: lines.map((line) => ({
        account: line.account,
        type: line.type,
        amount: parseFloat(line.amount),
      })),
    };

    const response = await backendClient.post("/journals", payload);
    toast.success("Journal entry saved successfully!");
    if (onSuccess) onSuccess(response.data);

    // Reset form
    setDate("");
    setDescription("");
    setLines([{ account: "", type: "debit", amount: "" }]);
  } catch (error) {
    console.error("Error creating journal entry:", error);
    toast.error("Failed to save journal entry.");
  }
};


  return (
    <div className="bg-white max-w-4xl mx-auto mt-6 p-4 border rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Add Journal Entry</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4 flex gap-4">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border p-2 rounded w-1/3"
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border p-2 rounded flex-grow"
          />
        </div>

        <table className="w-full table-auto border-collapse mb-4">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2 border">Account</th>
              <th className="p-2 border">Type</th>
              <th className="p-2 border">Amount</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, index) => (
              <tr key={index} className="even:bg-gray-50">
                <td className="p-2 border">
                  <select
                    name="account"
                    value={line.account}
                    onChange={(e) => handleChange(index, e)}
                    className="w-full px-2 py-1 border rounded"
                    required
                    disabled={loadingAccounts}
                  >
                    <option value="">
                      {loadingAccounts
                        ? "Loading accounts..."
                        : "-- Select Account --"}
                    </option>
                    {chartAccounts.map((acc) => (
                      <option key={acc._id} value={acc._id}>
                        {acc.name} ({acc.type})
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-2 border">
                  <select
                    name="type"
                    value={line.type}
                    onChange={(e) => handleChange(index, e)}
                    className="w-full px-2 py-1 border rounded"
                    required
                  >
                    <option value="debit">Debit</option>
                    <option value="credit">Credit</option>
                  </select>
                </td>
                <td className="p-2 border">
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    name="amount"
                    value={line.amount}
                    onChange={(e) => handleChange(index, e)}
                    className="w-full px-2 py-1 border rounded"
                    placeholder="Amount"
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
            onClick={addLine}
            className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
            disabled={loadingAccounts}
          >
            + Add Line
          </button>
          <button
            type="button"
            onClick={removeLastLine}
            className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
            disabled={lines.length === 1}
          >
            - Remove Last Line
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            disabled={loadingAccounts}
          >
            Save Journal Entry
          </button>
        </div>
      </form>
    </div>
  );
}

export default JournalEntryForm;
