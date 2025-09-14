import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import backendClient from "../../Clients/backendClient.js";
import { useAuth } from "../../Context/useAuth.js";

export default function GRNPage() {
    const { activeAccountId } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // State to hold the pre-filled PO data
    const [purchaseOrder, setPurchaseOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [grnData, setGrnData] = useState({ lines: [] });

    useEffect(() => {
        if (location.state?.purchaseOrder) {
            const po = location.state.purchaseOrder;
            setPurchaseOrder(po);
            const linesToReceive = po.lines.map(line => ({
                item: line.item._id,
                name: line.item.name,
                orderedQty: line.qty,
                receivedQty: line.receivedQty,
                quantityToReceive: line.qty - line.receivedQty
            }));
            setGrnData({
                purchaseOrderId: po._id,
                lines: linesToReceive,
            });
        }
    }, [location.state]);

    const handleQuantityChange = (e, index) => {
        const { value } = e.target;
        setGrnData(prev => {
            const newLines = [...prev.lines];
            newLines[index].quantityToReceive = parseInt(value, 10) || 0;
            return { ...prev, lines: newLines };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const linesToSend = grnData.lines
                .filter(line => line.quantityToReceive > 0)
                .map(line => ({
                    item: line.item,
                    quantityReceived: line.quantityToReceive,
                }));

            if (linesToSend.length === 0) {
                setError("Please enter a quantity for at least one item.");
                setLoading(false);
                return;
            }

            const payload = {
                accountId: activeAccountId,
                purchaseOrderId: grnData.purchaseOrderId,
                lines: linesToSend,
            };

            const response = await backendClient.post('/store/grn', payload);
            const createdGRN = response.data;

            // Navigate to a new print page, passing the full GRN data as state
            navigate(`/grn/print/${createdGRN._id}`, { state: { grn: createdGRN, purchaseOrder: purchaseOrder } });

        } catch (err) {
            console.error('Create GRN Error:', err);
            setError(err.response?.data?.message || 'Failed to create GRN.');
        } finally {
            setLoading(false);
        }
    };

    if (!purchaseOrder) {
        return (
            <div className="p-6 text-center">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Create GRN</h2>
                <p>No Purchase Order selected. Please select a PO to receive items.</p>
                <button 
                  onClick={() => navigate('/purchase-orders')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Go to Purchase Orders
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Create Goods Received Note</h2>
            {error && <p className="text-red-600 font-medium mb-4">{error}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <span className="font-semibold text-gray-700">PO Number:</span> {purchaseOrder.poNumber}
                </div>
                <div>
                    <span className="font-semibold text-gray-700">Supplier:</span> {purchaseOrder.supplier?.name || "N/A"}
                </div>
                <div>
                    <span className="font-semibold text-gray-700">Status:</span> {purchaseOrder.status}
                </div>
            </div>
            
            <form onSubmit={handleSubmit}>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ordered Qty</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received Qty</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty to Receive</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {grnData.lines.map((line, index) => (
                                <tr key={line.item}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{line.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{line.orderedQty}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{line.receivedQty}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <input
                                            type="number"
                                            name="quantityToReceive"
                                            value={line.quantityToReceive}
                                            onChange={(e) => handleQuantityChange(e, index)}
                                            min="0"
                                            max={line.orderedQty - line.receivedQty}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                <div className="mt-6 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-green-600 text-white font-medium rounded-md shadow-sm hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Receiving...' : 'Create GRN'}
                    </button>
                </div>
            </form>
        </div>
    );
}