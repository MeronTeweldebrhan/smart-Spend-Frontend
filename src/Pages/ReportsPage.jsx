import TransactionList from "../components/TransactionList";

function ReportsPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 p-4">
      <h1 className="text-3xl font-bold mb-6">Reports Page</h1>
      <TransactionList />
    </div>
  );
  
}
export default ReportsPage;