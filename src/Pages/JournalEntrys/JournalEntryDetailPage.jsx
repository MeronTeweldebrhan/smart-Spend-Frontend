import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import backendClient from "../../Clients/backendClient.js";
import { useAuth } from "../../Context/useAuth.js";
import { toast } from "react-toastify";

function JournalEntryDetailPage() {
  const { id } = useParams();
  const { activeAccountId } = useAuth();
  const navigate = useNavigate();

  const [entry, setEntry] = useState(null);
  const [editing, setEditing] = useState(false);
  const [accounts, setAccounts] = useState([]);

  // Fetch journal entry
  const fetchEntry = async () => {
    try {
      const res = await backendClient.get(`/journals/${id}`, {
        params: { accountId: activeAccountId },
      });
      setEntry(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load journal entry.");
      navigate("/journal");
    }
  };

  useEffect(() => {
    fetchEntry();
  }, [id]);

  // Fetch chart of accounts
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await backendClient.get(`/chartofaccounts?accountId=${activeAccountId}`);
        setAccounts(res.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load accounts.");
      }
    };
    fetchAccounts();
  }, [activeAccountId]);

  const handleLineChange = (index, field, value) => {
    setEntry((prev) => {
      const updatedLines = [...prev.lines];
      updatedLines[index] = {
        ...updatedLines[index],
        [field]: value,
      };
      // Enforce only one of debit or credit filled:
      if (field === "debit" && value) updatedLines[index].credit = 0;
      if (field === "credit" && value) updatedLines[index].debit = 0;
      return { ...prev, lines: updatedLines };
    });
  };

  const addLine = () => {
    setEntry((prev) => ({
      ...prev,
      lines: [...prev.lines, { account: "", debit: 0, credit: 0 }],
    }));
  };

  const removeLine = (index) => {
    setEntry((prev) => ({
      ...prev,
      lines: prev.lines.filter((_, i) => i !== index),
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    // Validation (similar to form)
    if (entry.lines.length < 2) {
      toast.error("At least two lines are required.");
      return;
    }

    for (const line of entry.lines) {
      if (!line.account) {
        toast.error("Please select account for all lines.");
        return;
      }
      const debitNum = parseFloat(line.debit);
      const creditNum = parseFloat(line.credit);
      if (
        (isNaN(debitNum) || debitNum < 0) ||
        (isNaN(creditNum) || creditNum < 0)
      ) {
        toast.error("Amounts must be valid non-negative numbers.");
        return;
      }
      if (!((debitNum > 0 && creditNum === 0) || (creditNum > 0 && debitNum === 0))) {
        toast.error("Each line must have either debit or credit amount (not both).");
        return;
      }
    }

    const totalDebit = entry.lines.reduce((sum, l) => sum + (parseFloat(l.debit) || 0), 0);
    const totalCredit = entry.lines.reduce((sum, l) => sum + (parseFloat(l.credit) || 0), 0);

    if (totalDebit !== totalCredit) {
      toast.error("Total debit and credit must be equal.");
      return;
    }

    try {
      const payload = {
        ...entry,
        accountId: activeAccountId,
      };
      // Usually you don't send the whole populated refs back, so clean up if needed.

      // Send update request
      await backendClient.put(`/journals/${id}`, payload);
      toast.success("Journal entry updated.");
      setEditing(false);
      fetchEntry(); // refresh
    } catch (error) {
      console.error(error);
      toast.error("Failed to update journal entry.");
    }
  };

  if (!entry) return <p>Loading...</p>;

  return (
    <div className="max-w-xl mx-auto mt-10 bg-gradient-to-br from-purple-100 to-purple-300 p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Journal Entry Details</h2>

      {!editing ? (
        <>
          <p><strong>Date:</strong> {new Date(entry.date).toLocaleDateString()}</p>
          <p><strong>Description:</strong> {entry.description}</p>

          <table className="w-full table-auto border-collapse mt-4 mb-4">
            <thead>
              <tr>
                <th className="border p-2">Account</th>
                <th className="border p-2">Debit</th>
                <th className="border p-2">Credit</th>
              </tr>
            </thead>
            <tbody>
              {entry.lines.map((line, i) => (
                <tr key={i}>
                  <td className="border p-2">{line.account?.name || "N/A"}</td>
                  <td className="border p-2">{line.debit > 0 ? `$${line.debit.toFixed(2)}` : "-"}</td>
                  <td className="border p-2">{line.credit > 0 ? `$${line.credit.toFixed(2)}` : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Edit
            </button>
            <button
              onClick={async () => {
                if (!window.confirm("Are you sure you want to delete this journal entry?")) return;
                try {
                  await backendClient.delete(`/journals/${id}`, {
                    params: { accountId: activeAccountId },
                  });
                  toast.success("Journal entry deleted.");
                  navigate("/journal");
                } catch (error) {
                  console.error(error);
                  toast.error("Failed to delete journal entry.");
                }
              }}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Delete
            </button>
            <button
              onClick={() => window.print()}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              📤 Export
            </button>
            <button
              className="bg-purple-600 text-white px-4 py-2 rounded"
              onClick={() => navigate("/journal")}
            >
              Back
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={handleUpdate}>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Date</label>
            <input
              type="date"
              value={entry.date ? entry.date.split("T")[0] : ""}
              onChange={(e) => setEntry({ ...entry, date: e.target.value })}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-semibold">Description</label>
            <input
              type="text"
              value={entry.description}
              onChange={(e) => setEntry({ ...entry, description: e.target.value })}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold">Lines</label>
            {entry.lines.map((line, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <select
                  value={line.account?._id || line.account || ""}
                  onChange={(e) => {
                    const accId = e.target.value;
                    const selectedAccount = accounts.find((a) => a._id === accId) || null;
                    setEntry((prev) => {
                      const newLines = [...prev.lines];
                      newLines[i] = { ...newLines[i], account: selectedAccount?._id || accId };
                      return { ...prev, lines: newLines };
                    });
                  }}
                  className="flex-grow border p-2 rounded"
                  required
                >
                  <option value="">Select Account</option>
                  {accounts.map((acc) => (
                    <option key={acc._id} value={acc._id}>
                      {acc.name}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Debit"
                  value={line.debit}
                  onChange={(e) => handleLineChange(i, "debit", e.target.value)}
                  className="w-24 border p-2 rounded"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Credit"
                  value={line.credit}
                  onChange={(e) => handleLineChange(i, "credit", e.target.value)}
                  className="w-24 border p-2 rounded"
                />

                <button
                  type="button"
                  onClick={() => removeLine(i)}
                  className="bg-red-500 text-white px-2 rounded"
                  disabled={entry.lines.length <= 2}
                  title="Remove line"
                >
                  &times;
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addLine}
              className="bg-gray-300 px-3 py-1 rounded"
            >
              + Add Line
            </button>
          </div>

          <div className="mt-4 flex gap-2">
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

export default JournalEntryDetailPage;
