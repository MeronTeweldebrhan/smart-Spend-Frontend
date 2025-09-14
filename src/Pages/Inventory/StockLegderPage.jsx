

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import backendClient from "../../Clients/backendClient.js";
import { useAuth } from "../../Context/useAuth.js";

export default function StockLedgerSummaryPage() {
  const { activeAccountId } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [totals, setTotals] = useState({ totalReceived: 0, totalIssued: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    includeZeroBalance: false,
    minUnitCost: "",
    maxUnitCost: "",
    category: ""
  });

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        setLoading(true);
        const params = { 
          accountId: activeAccountId,
          ...filters,
          includeZeroBalance: filters.includeZeroBalance.toString()
        };
        
        // Remove empty string values from params
        Object.keys(params).forEach(key => {
          if (params[key] === "") delete params[key];
        });

        const res = await backendClient.get("/store/stock-ledgers/balances", {
          params
        });
        
        console.log("Fetched stock balances:", res.data);
        setItems(res.data.balances || []);
        setTotals(res.data.totals || { totalReceived: 0, totalIssued: 0 });
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to fetch stock balances");
      } finally {
        setLoading(false);
      }
    };

    if (activeAccountId) {
      fetchBalances();
    }
  }, [activeAccountId, filters]);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const resetFilters = () => {
    setFilters({
      fromDate: "",
      toDate: "",
      includeZeroBalance: false,
      minUnitCost: "",
      maxUnitCost: "",
      category: ""
    });
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-6xl mx-auto mt-15">
      <h2 className="text-2xl font-bold mb-4">Stock Ledger Summary</h2>
      
      {/* Filter Form */}
      <div className="mb-6 p-4 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">From Date</label>
            <input
              type="date"
              name="fromDate"
              value={filters.fromDate}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">To Date</label>
            <input
              type="date"
              name="toDate"
              value={filters.toDate}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Min Unit Cost</label>
            <input
              type="number"
              name="minUnitCost"
              value={filters.minUnitCost}
              onChange={handleFilterChange}
              placeholder="Enter min cost"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Max Unit Cost</label>
            <input
              type="number"
              name="maxUnitCost"
              value={filters.maxUnitCost}
              onChange={handleFilterChange}
              placeholder="Enter max cost"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category Name</label>
            <input
              type="text"
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              placeholder="Enter category name"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              name="includeZeroBalance"
              checked={filters.includeZeroBalance}
              onChange={handleFilterChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm font-medium text-gray-700">
              Include Zero Balance
            </label>
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Reset Filters
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UOM</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Cost</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Opening Qty</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Received</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Issued</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Adjusted</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Closing Balance</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.item._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.item.sku || "-"}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.item.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.item.uom}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.item.category || "-"}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">{item.unitCost || item.item.costPrice || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">{item.OpeningQty || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">{item.receivedQty || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">{item.IssuedQty || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">{item.AdjustQty || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">{item.balance || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button
                    onClick={() =>
                      navigate(`/stock-ledger/${item.item._id}`, { state: { itemName: item.item.name } })
                    }
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan="4" className="px-6 py-3 text-left text-sm font-bold">Totals</td>
              <td className="px-6 py-3 text-right text-sm font-bold">{totals.totalopening}</td>
              <td className="px-6 py-3 text-right text-sm font-bold">{totals.totalReceived}</td>
              <td className="px-6 py-3 text-right text-sm font-bold">{totals.totalIssued}</td>
              <td colSpan="3" className="px-6 py-3"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}