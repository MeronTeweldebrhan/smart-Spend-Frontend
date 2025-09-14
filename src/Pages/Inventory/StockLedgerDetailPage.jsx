import { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import backendClient from "../../Clients/backendClient.js";
import { useAuth } from "../../Context/useAuth.js";

export default function StockLedgerDetailPage() {
  const { activeAccountId } = useAuth();
  const { itemId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [ledgers, setLedgers] = useState([]);
  const [totals, setTotals] = useState({ totalReceived: 0, totalIssued: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const itemName = location.state?.itemName || "Item";

  useEffect(() => {
    // Debug log to check parameters
    console.log("Fetching ledgers with:", { activeAccountId, itemId });

    const fetchLedgers = async () => {
      // Guard clause for missing parameters
      if (!activeAccountId || !itemId) {
        setError("Missing accountId or itemId. Please ensure you are logged in and viewing a valid item.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await backendClient.get("/store/stock-ledgers", {
          params: { accountId: activeAccountId, itemId },
        });
        const ledgerData = res.data || [];
        setLedgers(ledgerData);

        // Calculate totals for received and issued
        const totalReceived = ledgerData.reduce((sum, l) => sum + (l.receivedQty || 0), 0);
        const totalIssued = ledgerData.reduce((sum, l) => sum + (l.IssuedQty || 0), 0);
        setTotals({ totalReceived, totalIssued });
      } catch (err) {
        console.error("Fetch error:", err.response?.data || err.message);
        setError(err.response?.data?.message || "Failed to fetch ledger entries");
      } finally {
        setLoading(false);
      }
    };

    fetchLedgers();
  }, [activeAccountId, itemId]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-6xl mx-auto mt-20">
      <h2 className="text-2xl font-bold mb-4">{itemName} - Ledger Details</h2>
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
      >
        Back
      </button>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doc Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doc No</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Opening Qty</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Received</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Issued</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Adjusted</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Closing Balance</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ledgers.length > 0 ? (
              ledgers.map((l) => (
                <tr key={l._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {new Date(l.docDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{l.docType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{l.docNumber || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">{l.OpeningQty || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">{l.receivedQty || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">{l.IssuedQty || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">{l.AdjustQty || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">{l.balanceQty || 0}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                  No ledger entries found.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan="4" className="px-6 py-3 text-left text-sm font-bold">Totals</td>
              <td className="px-6 py-3 text-right text-sm font-bold">{totals.totalReceived}</td>
              <td className="px-6 py-3 text-right text-sm font-bold">{totals.totalIssued}</td>
              <td colSpan="2" className="px-6 py-3"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}