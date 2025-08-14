import { useEffect, useState } from "react";
import backendClient from "../../Clients/backendClient.js";
import { useAuth } from "../../Context/useAuth.js";
import { toast } from "react-toastify";
import JournalEntryTable from "../../components/JournalEntryTable.jsx";
import JournalEntryForm from "../../components/JournalEntryForm.jsx";

export default function JournalEntryPage() {
  const { activeAccountId } = useAuth();
  const [journalEntries, setJournalEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartAccounts, setChartAccounts] = useState([]);

  // Optional: local filters
  const [selectedChartAccount, setSelectedChartAccount] = useState("");

  // Fetch journal entries
  useEffect(() => {
    const fetchJournalEntries = async () => {
      console.log("Fetching journal entries for account:", activeAccountId);

      if (!activeAccountId) {
        setJournalEntries([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const queryParams = new URLSearchParams();

        if (selectedChartAccount) {
          queryParams.append("chartAccountId", selectedChartAccount);
        }

        const res = await backendClient.get(
          `/journals/account/${activeAccountId}?${queryParams.toString()}`
        );

        setJournalEntries(res.data);
        console.log("Fetched journal entries:", res.data);
      } catch (error) {
        console.error("Failed to fetch journal entries:", error);
        toast.error("Failed to load journal entries.");
      } finally {
        setLoading(false);
      }
    };

    fetchJournalEntries();
  }, [activeAccountId, selectedChartAccount]); // refetch if filter changes

  // Fetch chart of accounts for dropdowns
  useEffect(() => {
    const fetchChartAccounts = async () => {
      if (!activeAccountId) {
        setChartAccounts([]);
        return;
      }
      try {
        const res = await backendClient.get(
          `/chartofaccounts?accountId=${activeAccountId}`
        );
        setChartAccounts(res.data);
      } catch (error) {
        console.error("Failed to fetch chart of accounts", error);
        toast.error("Failed to load chart of accounts.");
      }
    };
    fetchChartAccounts();
  }, [activeAccountId]);

  const handleSuccess = (newEntry) => {
    setJournalEntries((prev) => [newEntry, ...prev]);
  };

  if (loading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Journal Entries</h1>

      {/* Chart of Account Filter */}
      {chartAccounts.length > 0 && (
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">
            Filter by Chart of Account:
          </label>
          <select
            value={selectedChartAccount}
            onChange={(e) => setSelectedChartAccount(e.target.value)}
            className="border p-2 rounded w-full"
          >
            <option value="">All Accounts</option>
            {chartAccounts.map((acc) => (
              <option key={acc._id} value={acc._id}>
                {acc.name} ({acc.code})
              </option>
            ))}
          </select>
        </div>
      )}

      {activeAccountId ? (
        <JournalEntryForm
          chartAccounts={chartAccounts}
          loadingAccounts={!chartAccounts.length}
          onSuccess={handleSuccess}
        />
      ) : (
        <p className="text-gray-500">
          Please select an account to create a journal entry.
        </p>
      )}

      <JournalEntryTable entries={journalEntries} />
    </div>
  );
}
