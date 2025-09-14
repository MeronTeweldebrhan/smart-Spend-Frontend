import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function GRNPrintPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const grn = location.state?.grn;
    const purchaseOrder = location.state?.purchaseOrder;
    const grnContentRef = useRef(null);

    useEffect(() => {
        if (!grn || !purchaseOrder) {
            navigate('/purchase-orders', { replace: true });
        }
    }, [grn, purchaseOrder, navigate]);

    const handlePrint = () => {
        window.print();
    };

    const handleExportPDF = async () => {
        try {
            const input = grnContentRef.current;
            if (!input) {
                alert('Error: Unable to generate PDF. Content not found.');
                return;
            }

            const canvas = await html2canvas(input, {
                scale: 2,
                useCORS: true,
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`GRN_${grn.grnNumber}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to export PDF. Please try again.');
        }
    };

    if (!grn || !purchaseOrder) {
        return (
            <div className="p-6 text-center">
                <h2 className="text-xl font-bold mb-4 text-gray-800">GRN Not Found</h2>
                <p>No GRN or Purchase Order data was provided. Please create a GRN first.</p>
                <button
                    onClick={() => navigate('/purchase-orders')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Go to Purchase Orders
                </button>
            </div>
        );
    }

    // Calculate grand total from GRN lines if not already present
    const grnGrandTotal = grn.lines.reduce((acc, line) => {
        const poLine = purchaseOrder.lines?.find(poLine => poLine.item?._id === line.item);
        const unitPrice = poLine ? poLine.unitPrice : 0;
        return acc + (line.quantityReceived * unitPrice);
    }, 0);

    return (
        <div className="p-8 max-w-4xl mx-auto mt-20">
            <div className="flex justify-end space-x-4 mb-4">
                <button
                    onClick={handleExportPDF}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                    Export as PDF
                </button>
                <button
                    onClick={handlePrint}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Print
                </button>
            </div>

            <div
                ref={grnContentRef}
                className="bg-white p-8 border border-gray-300 rounded-md shadow-lg"
            >
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Goods Received Note</h1>
                    <div className="text-right">
                        <p className="text-lg font-semibold text-gray-700">
                            GRN No: {grn.grnNumber ?? 'N/A'}
                        </p>
                        <p className="text-sm text-gray-500">
                            Date:{' '}
                            {grn.receivedDate
                                ? new Date(grn.receivedDate).toLocaleDateString()
                                : 'N/A'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div>
                        <p className="font-semibold text-gray-700">Supplier Details</p>
                        <p className="text-gray-600">{purchaseOrder.supplier?.name ?? 'N/A'}</p>
                        <p className="text-gray-600">{purchaseOrder.supplier?.address ?? 'N/A'}</p>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-700">Order Information</p>
                        <p className="text-gray-600">PO Number: {purchaseOrder.poNumber ?? 'N/A'}</p>
                    </div>
                </div>

                <div className="overflow-x-auto mb-8">
                    <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Item Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Quantity Received
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Unit Price
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total Price
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {grn.lines?.length > 0 ? (
                                grn.lines.map((line, index) => {
                                    const poLine = purchaseOrder.lines?.find(
                                        (poLine) => poLine.item?._id === line.item
                                    );
                                    const unitPrice = poLine ? poLine.unitPrice : 0;
                                    const totalPrice = line.quantityReceived * unitPrice;
                                    return (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {poLine?.item?.name ?? 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {line.quantityReceived ?? 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {unitPrice.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {totalPrice.toFixed(2)}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                                        No items found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>


                <div className="mt-8 pt-4 border-t border-gray-200 text-right">
                    <p className="text-xl font-bold text-gray-800">
                        Grand Total: {grnGrandTotal.toFixed(2)}
                    </p>
                </div>

                 <div className="mt-8 pt-4 border-t border-gray-200">
                    <p className="text-xl  text-gray-800">
             Prepared By:________ Checked By:_________ Approved By:_________
                    </p>
                </div>

                <div className="mt-8 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                        This document confirms the receipt of goods listed above.
                    </p>
                </div>
            </div>
        </div>
    );
}