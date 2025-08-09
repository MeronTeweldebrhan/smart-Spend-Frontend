/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import backendClient from "../../Clients/backendClient.js";
import { useAuth } from "../../Context/useAuth.js";
import { toast } from "react-toastify";

function JournalEntryDetailPage() {
  const { id } = useParams();
  const { user, activeAccountId } = useAuth();
  const navigate = useNavigate();

  const [entry, setEntry] = useState(null);
  const [editing, setEditing] = useState(false);
  const [accounts, setAccounts] = useState([]);

  // === Fetch journal entry by ID === //
  const fetchEntry = async () => {
    try {
      const res = await backendClient.get(`/journalentry/${id}`, {
        params: { accountId: activeAccountId },
      });
      setEntry(res.data);
    } catch (err) {
      console.error("Error loading journal entry", err);
      toast.error("Failed to load journal entry.");
      navigate("/journal");
    }
  };

  useEffect(() => {
    fetchEntry();
  }, [id]);

  // === Handle delete === //
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this journal entry?")) return;
    try {
      await backendClient.delete(`/journalentry/${id}`, {
        params: { accountId: activeAccountId },
      });
      toast.success("Journal entry deleted.");
      navigate("/journal");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete journal entry.");
    }
  };

  // === Handle update === //
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updated = await backendClient.put(`/journalentry/${id}`, {
        ...entry,
        accountId: activeAccountId,
      });
      setEntry(updated.data);
      setEditing(false);
      toast.success("Journal entry updated.");
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update journal entry.");
    }
  };

  // === Fetch chart of accounts for dropdown === //
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
         const res = await backendClient.get(
          `/chartofaccounts?accountId=${activeAccountId}`
        );
        setAccounts(res.data);
      } catch (error) {
        console.error("Error fetching chart of accounts:", error);
        toast.error("Failed to load accounts.");
      }
    };
    fetchAccounts();
  }, [user, activeAccountId]);

  if (!entry) return <p>Loading...</p>;

  // === Handle back button === //
  const handleBack = () => {
    navigate("/journal");
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-gradient-to-br from-purple-100 to-purple-300 p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Journal Entry Details</h2>

      {!editing ? (
        <>
          <p>
            <strong>Date:</strong> {new Date(entry.date).toLocaleDateString()}
          </p>
          <p>
            <strong>Debit:</strong> ${entry.debit}
          </p>
          <p>
            <strong>Credit:</strong> ${entry.credit}
          </p>
          <p>
            <strong>Account:</strong> {entry.chartOfAccount?.name}
          </p>
          <p>
            <strong>Description:</strong> {entry.description}
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
              📤 Export
            </button>
            <button
              className="bg-purple-600 text-white px-4 py-2 rounded"
              onClick={handleBack}
            >
              Back
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={handleUpdate} className="space-y-3">
          <input
            name="date"
            type="date"
            value={entry.date ? entry.date.split("T")[0] : ""}
            onChange={(e) => setEntry({ ...entry, date: e.target.value })}
            className="w-full border p-2"
          />

          <input
            name="debit"
            type="number"
            value={entry.debit}
            onChange={(e) => setEntry({ ...entry, debit: e.target.value })}
            className="w-full border p-2"
            placeholder="Debit"
          />

          <input
            name="credit"
            type="number"
            value={entry.credit}
            onChange={(e) => setEntry({ ...entry, credit: e.target.value })}
            className="w-full border p-2"
            placeholder="Credit"
          />

          <select
            name="chartOfAccount"
            value={entry.chartOfAccount?._id || ""}
            onChange={(e) =>
              setEntry({ ...entry, chartOfAccount: { _id: e.target.value } })
            }
            className="w-full border p-2"
          >
            <option value="">Select Account</option>
            {accounts.map((acc) => (
              <option key={acc._id} value={acc._id}>
                {acc.name}
              </option>
            ))}
          </select>

          <input
            name="description"
            type="text"
            value={entry.description}
            onChange={(e) => setEntry({ ...entry, description: e.target.value })}
            className="w-full border p-2"
            placeholder="Description"
          />

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

export default JournalEntryDetailPage;
