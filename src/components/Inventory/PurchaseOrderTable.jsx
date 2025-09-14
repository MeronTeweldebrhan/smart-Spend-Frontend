import { useEffect, useState } from "react";
import backendClient from "../../Clients/backendClient.js";
import { useAuth } from "../../Context/useAuth.js";
import { useNavigate } from "react-router-dom";

export default function PurchaseOrderTable({ refreshKey }) {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [error, setError] = useState("");
  const { activeAccountId } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPurchaseOrders = async () => {
      if (!activeAccountId) {
        setPurchaseOrders([]);
        return;
      }
      try {
        const res = await backendClient.get(
          `/store/purchase-orders?accountId=${activeAccountId}`
        );
        setPurchaseOrders(res.data);
        res.data.forEach((po) => {
          if (po.total === 0 && po.lines.length > 0) {
            console.warn(
              `PO ${po.poNumber} has total 0 despite lines:`,
              po.lines.map((l) => ({
                qty: l.qty,
                unitPrice: l.unitPrice,
                TotalPrice: l.TotalPrice,
              }))
            );
          }
        });
      } catch (error) {
        console.error("Fetch Purchase Orders Error:", error);
        setError(
          error.response?.data?.message || "Failed to fetch purchase orders."
        );
      }
    };

    fetchPurchaseOrders();
  }, [activeAccountId, refreshKey]);

  const handleDelete = async (poId) => {
    if (!window.confirm("Are you sure you want to delete this purchase order?"))
      return;

    try {
      await backendClient.delete(
        `/store/purchase-orders/${poId}?accountId=${activeAccountId}`
      );
      setPurchaseOrders((prev) => prev.filter((po) => po._id !== poId));
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to delete purchase order."
      );
    }
  };

  // const handleReceiveItems = async (poId, lines) => {
  //   try {
  //     const receivedLines = lines.map(line => ({
  //       itemId: line.item._id,
  //       quantity: parseInt(prompt(`Enter received quantity for ${line.item.name} (max ${line.qty - line.receivedQty}):`, "0"), 10) || 0,
  //     }));

  //     await backendClient.post(`/store/purchase-orders/${poId}/receive`, {
  //       accountId: activeAccountId,
  //       receivedLines,
  //     });

  //     setPurchaseOrders((prev) =>
  //       prev.map((po) =>
  //         po._id === poId
  //           ? {
  //               ...po,
  //               lines: po.lines.map((line, i) => ({
  //                 ...line,
  //                 receivedQty: line.receivedQty + (receivedLines[i]?.quantity || 0),
  //               })),
  //               status: receivedLines.every((rl, i) => rl.quantity + po.lines[i].receivedQty >= po.lines[i].qty)
  //                 ? 'RECEIVED'
  //                 : 'PARTIALLY_RECEIVED',
  //             }
  //           : po
  //       )
  //     );
  //   } catch (error) {
  //     setError(error.response?.data?.message || "Failed to receive items.");
  //   }
  // };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-gray-800">Purchase Orders</h2>
      {error && (
        <p className="text-red-600 font-medium bg-red-50 p-4 rounded-md mb-4">
          {error}
        </p>
      )}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                PO Number
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Supplier
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                PO Date
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Total Items
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Total
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {purchaseOrders.map((po) => (
              <tr key={po._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">
                  {po.poNumber}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {po.supplier?.name || "-"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {new Date(po.poDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{po.status}</td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {po.lines.length}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {/* Calculate the total on the front end from the line items */}
                  $
                  {po.lines
                    .reduce((sum, line) => sum + (line.TotalPrice || 0), 0)
                    .toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm">
                  <button
                    onClick={() =>
                      navigate(`/purchase-orders/edit/${po._id}`, {
                        state: { purchaseOrder: po },
                      })
                    }
                    className="text-blue-600 hover:text-blue-800 font-medium mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(po._id)}
                    className="text-red-600 hover:text-red-800 font-medium mr-3"
                  >
                    Delete
                  </button>
                  {po.status !== "RECEIVED" && po.status !== "CANCELLED" && (
                    <button
                      onClick={() =>
                        navigate("/grn/create", {
                          state: { purchaseOrder: po },
                        })
                      }
                      className="text-green-600 hover:text-green-800 font-medium"
                    >
                      Receive Items
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {purchaseOrders.length === 0 && (
              <tr>
                <td
                  colSpan="7"
                  className="px-4 py-3 text-center text-sm text-gray-500"
                >
                  No purchase orders found for the selected account.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
