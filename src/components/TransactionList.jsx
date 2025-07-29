import { useEffect, useState } from "react";
import backendClient from "../Clients/backendClient.js";
import { useAuth } from "../Context/useAuth.js";

function TransactionList() {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    // Fetch transactions for the user
    const fetchTransactions = async () => {
        try {
            const response = await backendClient.get(`/transaction`);
            setTransactions(response.data);
        } catch (error) {
            console.error("Error fetching transactions:", error);
            alert("Failed to load transactions. Please try again.");
        }
    };

    useEffect(() => {
  if (user?._id) {
    fetchTransactions();
  }
}, [user]);
    
  return (
  <div>
    <h1>Transaction List</h1>
    {transactions.length > 0 ? (
      <ul>
        {transactions.map((tx) => (
  <div key={tx._id} className="p-4 border mb-2 rounded-md">
    <p>Amount: ${tx.amount}</p>
    <p>Type: {tx.type}</p>
    <p>Date: {new Date(tx.date).toLocaleDateString()}</p>
    <p>Category: {tx.category?.name || "Uncategorized"}</p>
    <p>Description: {tx.description}</p>
  </div>
))}
      </ul>
    ) : (
      <p>No transactions found.</p>
    )}
  </div>
);
}
export default TransactionList;